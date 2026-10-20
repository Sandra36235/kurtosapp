# Integración del personalizador con la app de ventas

## Responsabilidades actuales

`apps/configurator/app.js` controla las elecciones y el carrito local de demostración. `kurtos-3d.js` se encarga únicamente de la presentación del producto y escucha el evento `kurtos:change` en `window`.

Cada vez que cambia una elección se publica una copia del estado en `window.kurtosConfig` y se emite el evento con el mismo estado en `event.detail`. El visor también lee la copia inicial al cargar, por lo que no depende de recibir el primer evento.

```js
{
  step: 0,                    // 0: cono, 1: relleno, 2: helado, 3: toppings
  unlocked: 0,                // Último paso habilitado
  choices: [null, null, null], // Índices elegidos: cono, relleno, helado
  toppings: []                // Índices de toppings seleccionados
}
```

El contrato actual usa índices de la lista `groups` de `app.js`. **Si se cambian esas listas o su orden, también debe actualizarse su correspondencia en el visor.** Para un catálogo administrable, conviene sustituirlos por identificadores estables de ingredientes y definir una correspondencia explícita a materiales y modelos.

## Preparación visual

Los pasos futuros permanecen bloqueados hasta completar el actual. El visor muestra solo las capas correspondientes al paso visible. Las elecciones siguientes se conservan al retroceder, y reaparecen al regresar a esos pasos. El relleno, el helado y los toppings se animan al cambiar su selección; el botón de repetición sirve nuevamente la combinación completa.

El modelo y los materiales son procedurales. La guía visual aprobada sirve como referencia de apariencia; no es un modelo 3D importado. No es necesario regenerar imágenes para cambiar opciones existentes.

## Pedidos y precios

Actualmente el carrito de ejemplo utiliza la clave `kurtos-cart` de `localStorage`, con registros `{ name, detail, price }`. No representa una orden confirmada. Los precios de la interfaz son ejemplos y no deben utilizarse para cobrar.

La integración comercial debe enviar identificadores de producto, ingredientes y cantidades al servidor. El servidor debe verificar disponibilidad, recalcular precios desde su catálogo y crear la orden. El resumen de texto del carrito actual no debe ser la fuente de verdad de una venta.

## Trabajo pendiente para ventas reales

- Catálogo y variantes con identificadores estables, precios y disponibilidad.
- Reglas de combinaciones, extras, cantidades e impuestos según el negocio.
- Órdenes persistentes, estados de preparación e historial.
- Usuarios, permisos y panel de administración.
- Integración de cobros y confirmación de pagos en servidor.
- Flujo de entrega o retiro, comprobantes e inventario según el alcance acordado.

Estos puntos están documentados como próximos módulos; no están implementados en esta versión.

## Publicación

El código del personalizador puede servirse como aplicación independiente o integrarse en una interfaz mayor. Las rutas actuales de los módulos y recursos son relativas a su `index.html`. Conservar esa relación al mover el módulo o adaptar las rutas al sistema de compilación de la futura app.

Este repositorio no contiene credenciales de la demo, configuración de su cuenta de hosting ni un proceso automático de despliegue. Publicar desde GitHub requerirá elegir y configurar el entorno correspondiente.
