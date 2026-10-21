# Flujo actualizado

La administración usa ahora la pizarra de Pedidos y la cocina unificada. Ver [workspace.md](workspace.md) para la operación vigente. Los estados de preparación y cobros se gestionan en la base privada, después de importar el original web con firma. La gestión anterior de estados de la tienda ya no permite avanzar a preparación.

# Pedidos de la tienda y delivery

Tienda: https://kurtos-delivery.sandraabasto.chatgpt.site

Administración privada: https://cono-studio-quyi.sandraabasto.chatgpt.site

## Cliente

Elige del menú o arma un Kurto en 3D, revisa el carrito y elige delivery o retiro. Completa nombre y celular. Para delivery agrega dirección, referencia y punto del mapa. Revisa el resumen y pulsa **Confirmar pedido**.

El servidor valida disponibilidad, variantes y precios y guarda el pedido en D1 antes de entregar un número único, comenzando con #10001. No se usa un número aleatorio del navegador. Si falla la conexión, se reintenta la misma confirmación con su identificador y se recupera el número original, sin crear otro pedido. Los intentos pendientes se conservan temporalmente en la sesión del navegador para recuperarlos tras recargar; se limpian al confirmar. El botón del último pedido conserva solo su número y fecha en esa sesión.

Después de guardar aparece **Consultar mi pedido por WhatsApp**. El texto es exactamente `consultar mi pedido #10001` (con el número real). No incluye nombre, productos, dirección, importes o datos de contacto. El cliente debe enviar la consulta en WhatsApp; no se envían mensajes automáticamente.

El local ya tiene los detalles en la bandeja interna. Confirmar el pedido no cobra ni promete disponibilidad. El número no habilita una consulta pública de los datos del cliente.

## Operación

En la administración, abrir **Pedidos web**. La insignia indica los pendientes de aceptación. Se actualiza cada 20 segundos cuando no hay una ventana de gestión o un campo en edición; también tiene actualización manual. Muestra los activos y recientes (hasta 200), permite filtrar y buscar por número exacto para recuperar pedidos anteriores.

**Ver y gestionar pedido** muestra productos, cantidades, variantes, configuraciones 3D, notas, nombre, teléfono, dirección y enlace al punto de entrega. Los estados se conservan en base de datos: Por confirmar → Aceptado → En preparación → Listo → Entregado. Cancelar requiere un motivo y conserva el historial. No se pueden saltar pasos ni cancelar un pedido entregado. Las revisiones evitan que dos ventanas sobrescriban cambios simultáneos.

Para aceptar delivery, confirmar el recorrido por calles en Google Maps e introducir los kilómetros con hasta dos decimales. La tarifa es Bs 4/km y se guarda separada de los productos. Mientras el envío no está confirmado, el total definitivo queda pendiente; la distancia ingresada por el cliente solo produce una estimación. Retiro no tiene costo de envío.

El cobro se registra por separado en la caja existente, con productos, servicio Delivery, recorrido confirmado y dirección, según lo acordado y verificado con el cliente. **Los estados de la bandeja no crean ventas ni registran pagos**. Para retiro, seleccionar Para llevar / retiro. Las ventas siguen afectando caja, conciliación y devoluciones mediante sus operaciones existentes.

Horario: martes a domingo, 10:00–19:00, America/La_Paz. Fuera de horario se pueden enviar pedidos para consultar la próxima apertura y se identifican internamente como recibidos fuera de horario.

## Mapa y tarifas

Mapa de Cochabamba, Cercado, zona norte. La salida es el punto del enlace enviado por Sandra, identificado en Google Maps como UPAL: -17.369493, -66.1602265. La cobertura se confirma con el cliente; todavía no hay un polígono comercial exacto definido.

La distancia es el recorrido **por calles**, no una línea recta. El cliente puede abrir Google Maps y copiar los kilómetros para estimar Bs 4/km, o dejarlos pendientes. La web no obtiene automáticamente esa distancia vial. Automatizarla requiere un proveedor apto para uso comercial y sus credenciales o infraestructura propia.

## Datos y acceso

- La tabla `web_orders` en la D1 de la tienda guarda el pedido, clave/hash de confirmación únicos, estado, revisión, fecha e historial. La numeración es 10000 + id autoincremental; puede haber saltos, nunca duplicados.
- `POST /api/orders` crea el pedido. `POST /api/orders/recover` permite recuperar solo número, estado y fecha usando la clave de confirmación aleatoria del cliente. No hay consulta pública por número ni listado público.
- `POST /api/orders/manage` requiere una autorización HMAC de la caja privada, con finalidad específica, acción, datos y vencimiento de un minuto. El navegador transporta esa autorización; el secreto permanece en los servidores. CORS acepta únicamente el origen de la administración. Una firma de catálogo no sirve para consultar pedidos.
- La caja emite esas autorizaciones desde `/api/storefront/orders`, dentro del Site privado. No se hace pública la caja ni sus APIs de ventas o efectivo. La tienda pública sirve únicamente storefront y configurador.
- Configurar `CATALOG_SYNC_TOKEN` (secreto idéntico en ambos sitios) y `STOREFRONT_URL` en caja. `POS_ORIGIN` en tienda permite cambiar su origen autorizado; por defecto usa la URL privada publicada. Configurar valores con las herramientas nativas de Sites, nunca en Git o en el navegador.
- Los datos del cliente ahora se guardan para atender su pedido; el formulario lo informa antes de confirmar. OpenStreetMap recibe las solicitudes de imágenes del mapa. Google Maps y WhatsApp se abren solo al pulsar sus enlaces.
- Los precios y disponibilidad se sincronizan desde Menú y precios al guardar, o con Publicar menú en tienda. La tienda valida precios nuevamente al confirmar; los pedidos ya guardados conservan su precio original.
- La exportación de caja contiene las ventas y registros de su propia base; no incluye automáticamente la tabla de pedidos de la D1 de la tienda.

## Desarrollo

`npm run dev:shop` inicia la tienda y aplica migraciones a `data/shop.sqlite`; `npm run dev` inicia caja y usa `data/kurtos.sqlite`. Ejecutar en puertos distintos. Para la bandeja local, configurar `POS_ORIGIN`, `STOREFRONT_URL` y un secreto de prueba igual en ambos procesos. Nunca usar datos reales en pruebas.

`npm run build:shop` genera el Worker público; `npm run build` genera el privado. Ambos usan `dist`, por lo que se empaquetan por separado. Publicar ambos destinos cuando cambien módulos compartidos. Las migraciones generadas se aplican antes de publicar y no deben editarse una vez aplicadas.

El repositorio GitHub guarda ambos destinos; cada checkout de Sites conserva su propia identidad en `.openai/hosting.json`. No copiar bases locales ni secretos a esos checkouts.
