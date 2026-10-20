# KURTOS · Ventas y caja

Aplicación para un local con una caja abierta a la vez. Incluye menú, personalizador 3D, registro de cobros, preparación de pedidos y conciliación de caja.

## Ejecutar localmente

Requiere **Node.js 22.13 o superior** (recomendado: Node 24).

```sh
npm ci
npm run dev
```

Abrir **http://127.0.0.1:4173**. Las migraciones se aplican automáticamente a la base local al iniciar. La base persistente se guarda en `data/kurtos.sqlite`, excluida de Git. Las variables `PORT` y `DATABASE_PATH` permiten usar otro puerto y archivo.

```sh
npm run check
npm test
npm run build
```

`npm test` utiliza bases temporales independientes y no modifica datos operativos. `npm run build` genera el Worker en `dist/server/index.js`, con todos los recursos estáticos integrados. La app ya necesita un servidor y base de datos: no basta con abrir su HTML ni servir únicamente archivos estáticos.

## Funciones

- Apertura de caja con responsable y saldo inicial en efectivo.
- Menú con los ocho productos y precios de la referencia del negocio.
- Variantes de sabores y rellenos, cantidades y observaciones.
- Personalizador 3D integrado en el pedido de venta.
- Cobro en efectivo con cambio, o QR/tarjeta con confirmación y referencia manual.
- Total recalculado en el servidor e idempotencia de cobros.
- Pedidos: en preparación → listo → entregado.
- Ingresos y retiros de efectivo con motivo.
- Devoluciones completas durante el turno abierto, conservando la venta original.
- Cierre con efectivo esperado, contado, diferencia y resumen por medio de pago.
- Historial, comprobantes internos imprimibles y exportación de registros.
- Edición de precios, disponibilidad y tarifa del personalizado.
- SQLite local y D1 en el sitio alojado, con migraciones versionadas.

## Documentación

- [Cómo operar la caja y las ventas](docs/operations.md).
- [Arquitectura, persistencia y API](docs/architecture.md).
- [Guía visual aprobada](docs/references/kurtos-aprobado.png).
- [Menú original](docs/references/menu-original.png).
- [Aplicación publicada](https://cono-studio-quyi.sandraabasto.chatgpt.site/).

## Consideraciones de operación

**Revisar las tarifas de personalizados antes de operar**: los importes iniciales de ingredientes provienen del prototipo. Los precios iniciales del menú terminado proceden de la imagen suministrada.

QR y tarjeta son registros manuales; no hay conexión bancaria ni cargos automáticos. Los comprobantes son internos, no facturas fiscales. No se incluyen inventario, pagos divididos, usuarios por empleado, varias cajas/sucursales ni devoluciones de turnos cerrados.

El nombre del responsable identifica el turno y no autentica a un empleado. El sitio conserva acceso privado del propietario. El servidor local escucha solo en 127.0.0.1; antes de exponerlo públicamente en otro entorno se necesita autenticación y HTTPS.

## Desarrollo y publicación

`apps/pos` contiene el punto de venta; `apps/configurator`, el visor 3D; `server`, las reglas y adaptadores; `db` y `drizzle`, el esquema y migraciones; `worker`, la entrada alojada; `tests`, las pruebas del negocio.

El despliegue Sites usa el binding D1 `DB`. Su configuración de cuenta y credenciales no están incluidas en GitHub. Los datos locales y alojados están separados y los datos de prueba nunca se copian al despliegue. GitHub todavía no tiene un despliegue automático configurado.

Three.js 0.170.0 está incluido y conserva su [licencia MIT](apps/configurator/vendor/THREE-LICENSE.txt). Las fuentes de Google Fonts cuentan con respaldos del sistema. Las dependencias npm son herramientas de desarrollo y compilación; el Worker no requiere paquetes en tiempo de ejecución.
