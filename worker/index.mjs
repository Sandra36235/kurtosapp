import { api } from '../server/api.mjs';
import { assets } from './assets.generated.mjs';
const decoded=new Map();
export default { async fetch(request,env){const url=new URL(request.url);if(url.pathname.startsWith('/api/'))return api(request,env.DB);if(!['GET','HEAD'].includes(request.method))return new Response('Método no permitido',{status:405});let key=url.pathname;if(key.endsWith('/'))key+='index.html';const asset=assets[key];if(!asset)return new Response('No encontrado',{status:404});let bytes=decoded.get(key);if(!bytes){bytes=Uint8Array.from(atob(asset.body),c=>c.charCodeAt(0));decoded.set(key,bytes)}return new Response(request.method==='HEAD'?null:bytes,{headers:{'Content-Type':asset.type,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'}})}};
