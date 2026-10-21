const encoder=new TextEncoder();
const encoded=p=>encoder.encode(JSON.stringify({catalog:p.catalog,expiresAt:p.expiresAt}));
async function key(secret){return crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign','verify'])}
export async function signCatalog(catalog,secret){const packet={catalog,expiresAt:Date.now()+300000};const bytes=new Uint8Array(await crypto.subtle.sign('HMAC',await key(secret),encoded(packet)));return {...packet,signature:Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('')}}
export async function verifyCatalog(packet,secret){if(!secret||!packet?.catalog||!Number.isSafeInteger(packet.expiresAt)||packet.expiresAt<Date.now()||packet.expiresAt>Date.now()+300000||!/^\w{64}$/.test(packet.signature||''))return false;const bytes=Uint8Array.from(packet.signature.match(/../g),x=>parseInt(x,16));try{return await crypto.subtle.verify('HMAC',await key(secret),bytes,encoded(packet))}catch{return false}}
