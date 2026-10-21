import { catalogSnapshot } from './shop-domain.mjs';
import { signCatalog } from './catalog-signature.mjs';
export async function publishCatalog(store,env){
 if(!env.STOREFRONT_URL||!env.CATALOG_SYNC_TOKEN)return {ok:false,message:'La tienda todavía no está conectada.'};
 const target=new URL('/api/catalog-sync',env.STOREFRONT_URL);if(target.protocol!=='https:'&&target.hostname!=='127.0.0.1')return {ok:false,message:'Revisa la dirección de la tienda.'};
 const {state,version}=await store.load();
 // The browser transports an expiring signature over public menu data; the secret stays on servers.
 return {ok:false,message:'Menú listo para publicar.',relay:{url:target.href,body:await signCatalog(catalogSnapshot(state,version),env.CATALOG_SYNC_TOKEN)}};
}
