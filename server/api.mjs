import { Store } from './store.mjs';
import { publicState, priceItems, BusinessError } from './domain.mjs';
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export async function api(request,db){try{if(!db)return json({error:'La base de datos no está disponible.'},503);const url=new URL(request.url);if(!['GET','POST'].includes(request.method))return json({error:'Método no permitido.'},405);if(request.method==='POST'){const origin=request.headers.get('Origin');if(origin&&origin!==url.origin)return json({error:'Origen no permitido.'},403);if(!request.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'Se requiere JSON.'},415)}
const store=new Store(db);await store.init();
if(request.method==='GET'&&url.pathname==='/api/state'){const {state}=await store.load();return json(publicState(state))}
if(request.method==='GET'&&url.pathname==='/api/export'){const {state}=await store.load(true);return json({exportedAt:new Date().toISOString(),currency:'BOB',data:{products:state.product,shifts:state.shift,sales:state.sale,movements:state.movement,events:state.event,settings:state.setting}})}
if(request.method!=='POST')return json({error:'Ruta no encontrada.'},404);
const raw=await request.text();if(raw.length>65536)return json({error:'El pedido es demasiado grande.'},413);let body;try{body=JSON.parse(raw)}catch{return json({error:'JSON inválido.'},400)}if(!body||typeof body!=='object'||Array.isArray(body))return json({error:'Datos inválidos.'},400);
if(url.pathname==='/api/quote'){const {state}=await store.load();const items=priceItems(state,body.items);return json({items,total:items.reduce((n,x)=>n+x.subtotal,0)})}
const routes={'/api/shifts/open':'open','/api/shifts/close':'close','/api/sales':'sale','/api/sales/status':'status','/api/sales/refund':'refund','/api/movements':'movement','/api/products':'product','/api/pricing':'pricing'};const action=routes[url.pathname];if(!action)return json({error:'Ruta no encontrada.'},404);return json({result:await store.command(action,body,request.headers.get('Idempotency-Key'))});
}catch(error){if(error instanceof BusinessError)return json({error:error.message},error.status);console.error('POS API error',error);return json({error:'No se pudo completar la operación. Actualiza la vista antes de reintentar.'},500)}}
