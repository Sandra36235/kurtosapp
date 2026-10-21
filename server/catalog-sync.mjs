import { catalogSnapshot } from './shop-domain.mjs';
export async function publishCatalog(store,env){
 if(!env.STOREFRONT_URL||!env.CATALOG_SYNC_TOKEN)return {ok:false,message:'La tienda todavía no está conectada.'};
 try{const target=new URL('/api/catalog-sync',env.STOREFRONT_URL);if(target.protocol!=='https:'&&target.hostname!=='127.0.0.1')throw Error('URL inválida');const {state,version}=await store.load();const response=await fetch(target,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+env.CATALOG_SYNC_TOKEN},body:JSON.stringify(catalogSnapshot(state,version)),signal:AbortSignal.timeout(10000),redirect:'error'});if(!response.ok)throw Error('Sin respuesta');const result=await response.json();if(result.sourceVersion<version)throw Error('Versión pendiente');return {ok:true,message:'Menú actualizado en la tienda pública.',updatedAt:result.updatedAt};
 }catch{return {ok:false,message:'Guardado en caja. Falta actualizar la tienda: usa «Publicar menú en tienda» para reintentar.'}}
}
