# Tienda pública y delivery

Tienda: https://kurtos-delivery.sandraabasto.chatgpt.site

Caja privada: https://cono-studio-quyi.sandraabasto.chatgpt.site

## Cliente

Elige del menú o arma un Kurto en el personalizador 3D. Revisa el carrito, elige delivery o retiro y completa nombre y teléfono. Para delivery agrega dirección y referencia, y marca el destino en el mapa, usa la ubicación del dispositivo o introduce coordenadas. La cobertura se confirma por WhatsApp: no hay un polígono comercial exacto definido todavía.

El mapa se centra en Cochabamba, Cercado, zona norte. La salida usa el punto del enlace proporcionado por Sandra (Google Maps lo identifica como UPAL): -17.369493, -66.1602265. Verificar ese punto antes de anunciar la tienda a clientes.

La tarifa es Bs 4 por km **de recorrido por calles**, no de distancia recta. El botón de Google Maps abre la ruta desde el local al destino. El cliente puede copiar los kilómetros que ve allí para obtener una estimación; si los deja vacíos, el envío queda por confirmar. **La web no obtiene automáticamente la distancia vial** y nunca sustituye esa distancia por una línea recta. El envío se redondea a centavos; retiro no tiene costo. Para automatizar el cálculo hace falta conectar un servicio de rutas apto para uso comercial, con su credencial o infraestructura propia. No usamos servidores de demostración restringidos a uso no comercial.

El resumen abre un enlace a WhatsApp +591 65761716 con productos, cantidades, variantes, notas, ubicación, datos del cliente y subtotal/estimación. El cliente debe pulsar Enviar en WhatsApp. El enlace no confirma disponibilidad, no registra ventas y no cobra. La confirmación y el pago se coordinan en la conversación. Horario: martes a domingo de 10:00 a 19:00, America/La_Paz. Fuera de horario se permite consultar para la próxima apertura, con aviso explícito.

Solo el carrito se guarda en el navegador. El formulario de entrega vive en memoria y se pierde al recargar; la tienda no guarda datos del cliente en D1. OpenStreetMap provee el mapa y recibe las solicitudes de sus imágenes; Google Maps se abre solo al pulsar sus enlaces. WhatsApp recibe el texto cuando el cliente abre el enlace.

## Operación

1. Confirmar disponibilidad, dirección, cobertura y recorrido en Google Maps en WhatsApp.
2. Abrir caja y registrar productos y observaciones cuando corresponda confirmar el cobro. Seleccionar Delivery, ingresar recorrido confirmado (hasta dos decimales, 0.01–50 km) y dirección. Caja calcula productos + Bs 4/km en el servidor. Para retiro, seleccionar Para llevar / retiro.
3. Registrar el cobro efectivo/QR/tarjeta según el medio confirmado. La venta incluye el envío, conservado por separado en el comprobante, y afecta conciliación y devoluciones. Si se paga al repartidor, confirmar el cobro solo cuando se verifique la recepción del dinero.
4. Preparar y marcar listo/entregado. Los pedidos de WhatsApp se gestionan en WhatsApp: no existe bandeja automática ni integración con WhatsApp Business API.

Los cambios de precio y disponibilidad en Menú y precios intentan sincronizar la tienda automáticamente. Si falla, los cambios de caja permanecen guardados y el aviso indica que debe reintentarse con **Publicar menú en tienda**. Ese botón también sirve para una publicación manual. La tienda rechaza snapshots antiguos. El cliente vuelve a validar disponibilidad y precios al revisar el pedido.

## Arquitectura y desarrollo

- `npm run dev:shop`: tienda local, puerto de PORT o 4173, base independiente `data/shop.sqlite`.
- `npm run dev`: caja privada, base `data/kurtos.sqlite`. Ejecutar en puertos distintos para probar ambos.
- `npm run build:shop`: Worker público que integra únicamente apps/storefront y apps/configurator. `npm run build`: Worker privado con POS y configurador. Ambos construyen en dist; empaquetar cada destino inmediatamente después de su build.
- La tienda usa una base D1 propia con las migraciones existentes. Solo guarda un registro setting/public-catalog. Sus rutas públicas son GET /api/catalog y POST /api/quote; POST /api/catalog-sync requiere el secreto del servidor. No expone ni importa la API privada de caja ni sirve pos.js o pos.css.
- Configurar **CATALOG_SYNC_TOKEN** (secreto) idéntico en ambos sitios y **STOREFRONT_URL** en caja. Usar herramientas nativas de Sites; nunca poner el secreto en Git o código del navegador. Localmente se pueden pasar variables de entorno sin subirlas.
- La frontera de acceso privada la mantiene Sites: no hacer pública la caja. La tienda es un Site público separado. La sincronización solo transmite identificadores/precios/disponibilidad/tarifas y una revisión; nunca ventas, efectivo, operadores o clientes.
- El repositorio de GitHub guarda ambos destinos. Los repositorios de publicación de Sites son independientes y conservan cada identidad en su manifest local. Publicar ambos cuando cambien módulos compartidos.
