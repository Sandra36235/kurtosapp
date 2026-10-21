export const money=n=>'Bs '+(n/100).toFixed(2);
export function shippingCents(value){if(value===''||value==null)return null;const km=Number(value);if(!Number.isFinite(km)||km<=0||km>50)throw Error('La distancia debe ser mayor a 0 y hasta 50 km.');return Math.round(km*400)}
export function withinMap(lat,lng){return Number.isFinite(lat)&&Number.isFinite(lng)&&lat>=-17.5&&lat<=-17.2&&lng>=-66.3&&lng<=-66}
export function createMessage({quote,customer,phone,service,address,reference,note,destination,distance,open,code}){
 const clean=(v,n)=>String(v||'').trim().slice(0,n);
 customer=clean(customer,80);phone=clean(phone,20);address=clean(address,200);reference=clean(reference,200);note=clean(note,400);
 if(!customer||!/^\+?[0-9 ()-]{7,20}$/.test(phone)||phone.replace(/\D/g,'').length<7)throw Error('Completa tu nombre y un celular válido.');
 if(!quote?.items?.length)throw Error('Agrega un Kurto a tu pedido.');
 const delivery=service==='delivery';if(delivery&&(!address||!destination||!withinMap(destination.lat,destination.lng)))throw Error('Completa la dirección y marca un punto de entrega en Cochabamba.');
 const fee=delivery?shippingCents(distance):0;
 return [`¡Hola KURTOS! Quiero hacer este pedido.`, `Referencia: ${code}`,open?'':'Fuera de horario: consultar para la próxima apertura.',``,`Cliente: ${customer}`,`Celular: ${phone}`,``,...quote.items.flatMap(l=>[`${l.quantity} × ${l.name}${l.variant?' · '+l.variant:''} — ${money(l.subtotal)}`,l.kind==='custom'?l.description:'',l.note?'Nota: '+l.note:''].filter(Boolean)),``,`Productos: ${money(quote.total)}`,delivery?'Entrega: DELIVERY':'Entrega: RETIRO EN LOCAL',...(delivery?[`Dirección: ${address}`,reference?'Referencia: '+reference:'',`Ubicación: https://www.google.com/maps?q=${destination.lat.toFixed(6)},${destination.lng.toFixed(6)}`,fee===null?'Envío por confirmar: Bs 4 por km de recorrido por calles.':`Recorrido indicado por el cliente: ${Number(distance).toFixed(2)} km. Envío estimado: ${money(fee)} (Bs 4/km).`]:['Retiro en el local de zona norte, Cochabamba. Envío: Bs 0.00.']),fee===null?`Subtotal sin envío: ${money(quote.total)}`:`Total${delivery?' estimado':''}: ${money(quote.total+fee)}`,note?'Observaciones: '+note:'',``,`Por favor, confirmar disponibilidad${delivery?', cobertura y costo de envío':''}, hora de ${delivery?'entrega':'retiro'} y forma de pago.`].filter(x=>x!==null).join('\n');
}
