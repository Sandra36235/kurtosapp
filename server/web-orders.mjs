import { signOrderBatch } from './order-feed.mjs';
import { BusinessError } from './domain.mjs';
import { quoteCart, isOpen } from './shop-domain.mjs';
import { withinMap, shippingCents } from '../apps/storefront/order.mjs';
const fail=(s,status=400)=>{throw new BusinessError(s,status)};
const clean=(v,n)=>typeof v==='string'?v.trim().slice(0,n):'';
export const webOrderStates={pending:'Por confirmar',accepted:'Aceptado',preparing:'En preparación',ready:'Listo',delivered:'Entregado',cancelled:'Cancelado'};
export function normalizeOrder(body){
 const customer=clean(body.customer,80),phone=clean(body.phone,20),service=body.service;
 if(!customer||!/^\+?[0-9 ()-]{7,20}$/.test(phone)||phone.replace(/\D/g,'').length<7)fail('Completa tu nombre y un celular válido.');
 if(!['delivery','pickup'].includes(service))fail('Elige delivery o retiro en local.');
 if(!Array.isArray(body.items)||body.items.length<1||body.items.length>30)fail('Agrega entre 1 y 30 productos al pedido.');
 const address=service==='delivery'?clean(body.address,200):'',reference=service==='delivery'?clean(body.reference,200):'';
 let destination=null,km=null;
 if(service==='delivery'){
  if(!address||!body.destination||!withinMap(body.destination.lat,body.destination.lng))fail('Completa la dirección y marca un punto de entrega en Cochabamba.');
  destination={lat:Number(body.destination.lat.toFixed(6)),lng:Number(body.destination.lng.toFixed(6))};
  if(body.distance!==''&&body.distance!==null&&body.distance!==undefined){km=Number(body.distance);if(!Number.isFinite(km)||km<=0||km>50||Math.abs(km*100-Math.round(km*100))>0.00001)fail('Ingresa los kilómetros con hasta dos decimales.');}
 }
 if(!Number.isSafeInteger(body.quotedTotal)||body.quotedTotal<0)fail('Revisa el total del pedido.');
 const items=body.items.map(l=>({kind:l.kind==='custom'?'custom':'menu',productId:typeof l.productId==='string'?l.productId:'',quantity:l.quantity,variant:clean(l.variant,120),note:clean(l.note,240),...(l.kind==='custom'?{config:l.config}:{})}));
 return {customer,phone,service,address,reference,destination,distance:km,note:clean(body.note,400),items,quotedTotal:body.quotedTotal};
}
const receipt=row=>({number:10000+row.id,status:row.status,createdAt:row.created_at});
function order(row){return {...JSON.parse(row.payload),...receipt(row),version:row.version,updatedAt:row.updated_at}}
async function hash(value){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),x=>x.toString(16).padStart(2,'0')).join('')}
export async function createWebOrder(db,catalog,body,key){
 if(typeof key!=='string'||!/^[-a-zA-Z0-9_]{20,100}$/.test(key))fail('Falta la referencia de confirmación.');
 const input=normalizeOrder(body),fingerprint=await hash(JSON.stringify(input));
 const prior=await db.prepare('SELECT * FROM web_orders WHERE request_key=?').bind(key).first();
 if(prior){if(prior.request_hash!==fingerprint)fail('Esta confirmación corresponde a otro pedido. Recupera el pedido anterior.',409);return receipt(prior)}
 const quote=quoteCart(catalog,input.items);if(quote.total!==input.quotedTotal)fail('El precio cambió. Revisa el nuevo total antes de confirmar.',409);if(quote.total>10000000)fail('El pedido supera el máximo permitido.');
 const now=new Date().toISOString(),estimated=input.service==='pickup'?0:input.distance===null?null:shippingCents(input.distance);
 const saved={...input,items:quote.items,productsTotal:quote.total,shipping:{estimateKm:input.distance,estimatedAmount:estimated,confirmed:input.service==='pickup',amount:input.service==='pickup'?0:null},total:input.service==='pickup'?quote.total:null,submittedOutsideHours:!isOpen(),history:[{status:'pending',at:now}]};
 await db.prepare("INSERT INTO web_orders (request_key,request_hash,payload,status,version,created_at,updated_at) VALUES (?,?,?,'pending',0,?,?) ON CONFLICT(request_key) DO NOTHING").bind(key,fingerprint,JSON.stringify(saved),now,now).run();
 const row=await db.prepare('SELECT * FROM web_orders WHERE request_key=?').bind(key).first();if(!row||row.request_hash!==fingerprint)fail('La confirmación cambió. Revisa el pedido guardado.',409);return receipt(row);
}
export async function recoverWebOrder(db,key){if(typeof key!=='string'||!/^[-a-zA-Z0-9_]{20,100}$/.test(key))fail('Referencia inválida.');const row=await db.prepare('SELECT id,status,created_at FROM web_orders WHERE request_key=?').bind(key).first();if(!row)fail('El pedido aún no está registrado. Reintenta la confirmación.',404);return receipt(row)}
export async function manageWebOrders(db,action,body,secret){
 if(action==='feed'){const after=body.after||0;if(!Number.isSafeInteger(after)||after<0)fail('Cursor inválido.');const rows=await db.prepare('SELECT * FROM web_orders WHERE id>? ORDER BY id LIMIT 4').bind(after).all();const page=rows.results.slice(0,3);const batch={after,orders:page.map(order),cursor:page.at(-1)?.id||after,more:rows.results.length>3};return {packet:await signOrderBatch(batch,secret)}}
 if(action==='status')fail('Gestiona preparación, pagos y cancelaciones desde la nueva pizarra de administración.',409);
 if(action==='list'){
  const search=clean(body.search,30);if(search&&!/^#?\d+$/.test(search))fail('Busca por número de pedido.');
  const number=search?Number(search.replace('#',''))-10000:null;
  const rows=await (number!==null?db.prepare('SELECT * FROM web_orders WHERE id=?').bind(number):db.prepare("SELECT * FROM web_orders ORDER BY CASE WHEN status IN ('pending','accepted','preparing','ready') THEN 0 ELSE 1 END, id DESC LIMIT 200")).all();
  const counts=await db.prepare("SELECT status,COUNT(*) total FROM web_orders WHERE status IN ('pending','accepted','preparing','ready') GROUP BY status").all();
  return {orders:rows.results.map(order),counts:Object.fromEntries(counts.results.map(r=>[r.status,r.total]))};
 }
 if(action!=='status')fail('Operación inválida.');
 if(!Number.isSafeInteger(body.number)||!Number.isSafeInteger(body.version)||!Object.hasOwn(webOrderStates,body.status))fail('Pedido o estado inválido.');
 const row=await db.prepare('SELECT * FROM web_orders WHERE id=?').bind(body.number-10000).first();if(!row)fail('Pedido no encontrado.',404);
 const saved=JSON.parse(row.payload),next={pending:'accepted',accepted:'preparing',preparing:'ready',ready:'delivered'};
 // An already applied retry is safe; another transition is always checked against its revision.
 if(row.version===body.version+1&&row.status===body.status)return {order:order(row)};
 if(row.version!==body.version)fail('El pedido cambió en otra ventana. Actualiza la bandeja.',409);
 const cancel=body.status==='cancelled';if(cancel){if(['cancelled','delivered'].includes(row.status))fail('Este pedido ya está cerrado.',409);const reason=clean(body.reason,240);if(!reason)fail('Indica el motivo de cancelación.');saved.cancelReason=reason;}
 else if(next[row.status]!==body.status)fail('No puedes saltar pasos de preparación.',409);
 if(body.status==='accepted'&&saved.service==='delivery'){
  const km=body.km;if(!Number.isFinite(km)||km<=0||km>50||Math.abs(km*100-Math.round(km*100))>0.00001)fail('Confirma el recorrido por calles, con hasta dos decimales.');
  saved.shipping={...saved.shipping,confirmed:true,confirmedKm:km,amount:Math.round(km*400)};saved.total=saved.productsTotal+saved.shipping.amount;
 }
 const now=new Date().toISOString();saved.history.push({status:body.status,at:now,...(cancel?{reason:saved.cancelReason}:{})});
 const changed=await db.prepare('UPDATE web_orders SET payload=?,status=?,version=version+1,updated_at=? WHERE id=? AND version=?').bind(JSON.stringify(saved),body.status,now,row.id,row.version).run();if(changed.meta.changes!==1)fail('Otra persona actualizó este pedido. Actualiza la bandeja.',409);
 return {order:order(await db.prepare('SELECT * FROM web_orders WHERE id=?').bind(row.id).first())};
}
