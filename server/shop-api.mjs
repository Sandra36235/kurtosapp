import { SHOP, initialCatalog, validateCatalog, quoteCart, isOpen } from './shop-domain.mjs';
import { BusinessError } from './domain.mjs';
import { verifyCatalog } from './catalog-signature.mjs';
import { createWebOrder, recoverWebOrder, manageWebOrders } from './web-orders.mjs';
import { verifyOrderGrant } from './order-access.mjs';
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export async function readCatalog(db){const row=await db.prepare("SELECT payload FROM records WHERE kind='setting' AND id='public-catalog'").first();return row?JSON.parse(row.payload):initialCatalog()}
async function equalSecret(actual,expected){if(!actual||!expected)return false;const hash=async s=>new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)));const [a,b]=await Promise.all([hash(actual),hash(expected)]);let diff=0;for(let i=0;i<a.length;i++)diff|=a[i]^b[i];return diff===0}
async function handle(request,db,env={}){try{
 const {pathname,origin}=new URL(request.url);
 // A strict allowlist: no POS API is imported or proxied here.
 if(!['/api/catalog','/api/quote','/api/catalog-sync','/api/orders','/api/orders/recover','/api/orders/manage'].includes(pathname))return json({error:'No encontrado.'},404);
 if(!db)return json({error:'El menú no está disponible. Intenta nuevamente.'},503);
 if(pathname==='/api/catalog'&&request.method==='GET')return json({...await readCatalog(db),shop:SHOP,open:isOpen()});
 if(request.method!=='POST')return json({error:'Método no permitido.'},405);
 if(!['/api/catalog-sync','/api/orders/manage'].includes(pathname)&&request.headers.get('Origin')&&request.headers.get('Origin')!==origin)return json({error:'Origen no permitido.'},403);
 if(!request.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'Se requiere JSON.'},415);
 const raw=await request.text();if(raw.length>32768)return json({error:'Pedido demasiado grande.'},413);
 let body;try{body=JSON.parse(raw)}catch{return json({error:'Datos inválidos.'},400)}
 if(!body||typeof body!=='object'||Array.isArray(body))return json({error:'Datos inválidos.'},400);
 if(pathname==='/api/orders/manage'){if(!await verifyOrderGrant(body,env.CATALOG_SYNC_TOKEN))return json({error:'No autorizado.'},401);return json(await manageWebOrders(db,body.action,body.body,env.CATALOG_SYNC_TOKEN))}
 if(pathname==='/api/orders')return json({order:await createWebOrder(db,await readCatalog(db),body,request.headers.get('Idempotency-Key'))},201);
 if(pathname==='/api/orders/recover')return json({order:await recoverWebOrder(db,body.key)});
 if(pathname==='/api/catalog-sync'){
  const authorized=await equalSecret(request.headers.get('Authorization'),env.CATALOG_SYNC_TOKEN?'Bearer '+env.CATALOG_SYNC_TOKEN:'');
  if(!authorized&&!await verifyCatalog(body,env.CATALOG_SYNC_TOKEN))return json({error:'No autorizado.'},401);
  let next;try{next=validateCatalog(authorized?body:body.catalog)}catch{return json({error:'Catálogo inválido.'},400)}
  await db.prepare("INSERT INTO records (kind,id,payload,updated_at) VALUES ('setting','public-catalog',?,?) ON CONFLICT(kind,id) DO UPDATE SET payload=excluded.payload,updated_at=excluded.updated_at WHERE json_extract(excluded.payload,'$.sourceVersion')>=json_extract(records.payload,'$.sourceVersion')").bind(JSON.stringify(next),next.updatedAt).run();
  const saved=await readCatalog(db);return json({ok:true,sourceVersion:saved.sourceVersion,updatedAt:saved.updatedAt});
 }
 return json(quoteCart(await readCatalog(db),body.items));
 }catch(e){if(e instanceof BusinessError)return json({error:e.message},e.status);console.error('Storefront error',e.message);return json({error:'No se pudo completar la consulta.'},500)}
}
export async function shopApi(request,db,env={}){
 const sync=['/api/catalog-sync','/api/orders/manage'].includes(new URL(request.url).pathname),origin=request.headers.get('Origin'),allowed=env.POS_ORIGIN||'https://cono-studio-quyi.sandraabasto.chatgpt.site';
 if(sync&&origin&&origin!==allowed)return json({error:'Origen no permitido.'},403);
 if(sync&&request.method==='OPTIONS')return new Response(null,{status:204,headers:origin===allowed?{'Access-Control-Allow-Origin':allowed,'Access-Control-Allow-Methods':'POST','Access-Control-Allow-Headers':'Content-Type','Access-Control-Max-Age':'600','Vary':'Origin'}:{}});
 const response=await handle(request,db,env);if(sync&&origin===allowed){response.headers.set('Access-Control-Allow-Origin',allowed);response.headers.set('Vary','Origin')}return response;
}
