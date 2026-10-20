# Arquitectura de ventas

- `apps/pos`: interfaz de ventas, caja, cola de preparación, historial, edición de precios y comprobantes.
- `apps/configurator`: personalizador 3D. En modo `?pos=1` envía `kurtos:add` a su ventana contenedora; no crea una venta por sí mismo.
- `server/catalog.mjs`: menú inicial, variantes y tarifa inicial del personalizado.
- `server/domain.mjs`: validación comercial, precios, conciliación y transiciones de pedido.
- `server/store.mjs`: persistencia compartida entre SQLite y D1.
- `server/api.mjs`: API HTTP, validación de origen, límites de solicitud y errores.
- `server/sqlite.mjs` y `server/local.mjs`: adaptador SQLite, migraciones y servidor local.
- `db/schema.ts` y `drizzle/`: esquema y migraciones SQL versionadas.
- `worker/index.mjs`: adaptador alojado con binding D1 `DB`.
- `scripts/build.mjs`: incorpora recursos estáticos al Worker y compila una salida ESM.

## Persistencia y concurrencia

Cada producto, turno, venta, movimiento, evento, configuración y resultado idempotente se guarda como un registro JSON separado en la tabla `records`. No se almacena toda la aplicación en un único documento. La tabla `revision` permite una comparación y actualización de versión para cada operación comercial.

Una operación lee una instantánea, valida las reglas y utiliza un lote SQL atómico: primero actualiza la versión solo si sigue vigente y luego guarda sus registros condicionados a un token único. Si otra operación ganó la carrera, se vuelve a leer y validar. Un lote fallido se revierte por completo. Esto protege la apertura única, la numeración, el cierre y los cobros concurrentes.

El identificador de idempotencia se guarda junto al resultado y al contenido de la operación. No puede reutilizarse para un pedido distinto. Los montos se recalculan desde el catálogo y las tarifas del servidor; se rechaza un total cotizado que haya cambiado.

La vista operativa carga las últimas 500 ventas, todos los registros del turno abierto, movimientos recientes y actividad reciente. Los cierres conservan su resumen; los registros anteriores no se eliminan. La numeración se guarda separadamente del historial visible y los identificadores idempotentes se consultan directamente.

Para ampliar a varias cajas, empleados o inventario se deberán introducir entidades, permisos y consultas específicas; la política actual permite una sola caja abierta. La tabla de registros y sus reglas son la base inicial, no un ERP multicaja.

## API

Lecturas: `GET /api/state`, `GET /api/export`.

Cotización: `POST /api/quote` con `{ items }`.

Escrituras (JSON y cabecera `Idempotency-Key`):

- `POST /api/shifts/open`: responsable, saldo inicial y nota.
- `POST /api/shifts/close`: turno, efectivo contado y nota.
- `POST /api/sales`: turno, líneas, total cotizado, pago, cliente y entrega.
- `POST /api/sales/status`: venta y siguiente estado.
- `POST /api/sales/refund`: venta, motivo y confirmación de devolución manual.
- `POST /api/movements`: turno, ingreso/retiro, monto y motivo.
- `POST /api/products`: precio y disponibilidad de un producto existente.
- `POST /api/pricing`: tarifa por ingredientes del personalizado.

Las solicitudes mutantes de otro origen se rechazan. En el alojamiento la protección de acceso pertenece al sitio privado; no se incluyen contraseñas ni tokens de hosting en GitHub.

## Despliegue

SQLite local y D1 alojada usan las mismas reglas y migraciones, pero bases independientes. El despliegue Sites declara `d1: "DB"` y aplica las migraciones antes de publicar el Worker. La configuración específica del sitio queda fuera del repositorio de GitHub.

El Worker contiene sus recursos estáticos y no depende de un servidor de archivos adicional. Three.js está incluido localmente; únicamente las fuentes tienen una solicitud externa y fuentes de respaldo.
