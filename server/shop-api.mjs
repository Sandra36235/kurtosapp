import { SHOP, initialCatalog, validateCatalog, quoteCart, isOpen } from './shop-domain.mjs';
import { BusinessError } from './domain.mjs';
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export async function readCatalog(db){const row=await db.prepare("SELECT payload FROM records WHERE kind='setting' AND id='public-catalog'").first();return row?JSON.parse(row.payload):initialCatalog()}
async function equalSecret(actual,expected){if(!actual||!expected)return false;const hash=async s=>new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)));const [a,b]=await Promise.all([hash(actual),hash(expected)]);let diff=0;for(let i=0;i<a.length;i++)diff|=a[i]^b[i];return diff===0}
export async function shopApi(request,db,env={}){try{
 const {pathname,origin}=new URL(request.url);
 // A strict allowlist: no POS API is imported or proxied here.
 if(!['/api/catalog','/api/quote','/api/catalog-sync'].includes(pathname))return json({error:'No encontrado.'},404);
 if(!db)return json({error:'El menú no está disponible. Intenta nuevamente.'},503);
 if(pathname==='/api/catalog'&&request.method==='GET')return json({...await readCatalog(db),shop:SHOP,open:isOpen()});
 if(request.method!=='POST')return json({error:'Método no permitido.'},405);
 if(pathname==='/api/catalog-sync'){
  if(!await equalSecret(request.headers.get('Authorization'),env.CATALOG_SYNC_TOKEN?'Bearer '+env.CATALOG_SYNC_TOKEN:''))return json({error:'No autorizado.'},401);
 }else if(request.headers.get('Origin')&&request.headers.get('Origin')!==origin)return json({error:'Origen no permitido.'},403);
 if(!request.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'Se requiere JSON.'},415);
 const raw=await request.text();if(raw.length>32768)return json({error:'Pedido demasiado grande.'},413);
 let body;try{body=JSON.parse(raw)}catch{return json({error:'Datos inválidos.'},400)}
 if(!body||typeof body!=='object'||Array.isArray(body))return json({error:'Datos inválidos.'},400);
 if(pathname==='/api/catalog-sync'){
  let next;try{next=validateCatalog(body)}catch{return json({error:'Catálogo inválido.'},400)}
  await db.prepare("INSERT INTO records (kind,id,payload,updated_at) VALUES ('setting','public-catalog',?,?) ON CONFLICT(kind,id) DO UPDATE SET payload=excluded.payload,updated_at=excluded.updated_at WHERE json_extract(excluded.payload,'$.sourceVersion')>=json_extract(records.payload,'$.sourceVersion')").bind(JSON.stringify(next),next.updatedAt).run();
  const saved=await readCatalog(db);return json({ok:true,sourceVersion:saved.sourceVersion,updatedAt:saved.updatedAt});
 }
 return json(quoteCart(await readCatalog(db),body.items));
 }catch(e){if(e instanceof BusinessError)return json({error:e.message},e.status);console.error('Storefront error',e.message);return json({error:'No se pudo completar la consulta.'},500)}
}
