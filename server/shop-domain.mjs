import { INITIAL_PRODUCTS, CUSTOM } from './catalog.mjs';
import { priceItems, execute } from './domain.mjs';
export const SHOP = {
 name:'KURTOS', whatsapp:'59165761716', city:'Cochabamba', zone:'Cercado · Zona norte',
 location:{lat:-17.369493,lng:-66.1602265}, maps:'https://maps.app.goo.gl/LjzhG8JaA7JTW9U28',
 ratePerKm:400, timezone:'America/La_Paz', hours:'Martes a domingo · 10:00 a 19:00'
};
export function isOpen(now=new Date()){
 const p=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:SHOP.timezone,weekday:'short',hour:'numeric',minute:'numeric',hourCycle:'h23'}).formatToParts(now).map(x=>[x.type,x.value]));
 return p.weekday!=='Mon'&&Number(p.hour)>=10&&Number(p.hour)<19;
}
export function initialCatalog(){return {products:structuredClone(INITIAL_PRODUCTS),customPricing:structuredClone(CUSTOM),sourceVersion:-1,updatedAt:null}}
// Only product availability, prices and ingredient tariffs cross the private/public boundary.
export function catalogSnapshot(state,version){return {products:state.product.map(({id,price,enabled})=>({id,price,enabled})),customPricing:state.setting.find(x=>x.id==='custom-pricing')?.pricing||CUSTOM,sourceVersion:version}}
export function validateCatalog(input){
 if(!Number.isSafeInteger(input.sourceVersion)||input.sourceVersion<0||!Array.isArray(input.products)||input.products.length!==INITIAL_PRODUCTS.length)throw Error('Catálogo inválido.');
 const state={product:structuredClone(INITIAL_PRODUCTS),setting:[],event:[],shift:[]};
 const ids=new Set();for(const p of input.products){if(ids.has(p.id)||typeof p.enabled!=='boolean')throw Error('Producto inválido.');ids.add(p.id);execute(state,'product',p,{id:'catalog-sync'});}
 execute(state,'pricing',{pricing:input.customPricing},{id:'catalog-sync'});
 return {products:state.product,customPricing:state.setting.find(x=>x.id==='custom-pricing').pricing,sourceVersion:input.sourceVersion,updatedAt:new Date().toISOString()};
}
export function quoteCart(catalog,items){const priced=priceItems({product:catalog.products,setting:[{id:'custom-pricing',pricing:catalog.customPricing}]},items);return {items:priced,total:priced.reduce((n,l)=>n+l.subtotal,0)}}
export function shippingEstimate(km){if(!Number.isFinite(km)||km<=0||km>50)throw Error('Distancia inválida.');return Math.round(km*SHOP.ratePerKm)}
