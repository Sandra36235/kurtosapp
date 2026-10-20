# KURTOS

Repositorio inicial de la futura app de ventas KURTOS. Actualmente contiene el personalizador 3D de productos, desarrollado a partir de las referencias del negocio.

## Ejecutar

Requiere Node.js 20 o superior. No hace falta instalar dependencias para ejecutar esta versión.

```sh
npm run dev
```

Abrir **http://127.0.0.1:4173**. Para usar otro puerto: definir la variable de entorno `PORT`.

```sh
npm run check
```

El servidor incluido es para desarrollo local. Los archivos de `apps/configurator` se pueden servir desde cualquier hosting estático; no hay paso de compilación. Se debe abrir a través de HTTP, porque el visor utiliza módulos JavaScript.

## Incluye

- Elección progresiva: cono → relleno → helado → toppings.
- Modelo 3D con giro, zoom y rotación automática.
- Animaciones de aplicación del relleno, formación del helado y caída de toppings.
- Repetición de la preparación, navegación entre pasos y reinicio.
- Carrito de demostración persistido en el navegador.
- Vista adaptable a celular y controles accesibles por botones.
- Cono con la última corrección de altura, aproximadamente un 20 % más corto.

## Estructura

```text
apps/configurator/
  index.html       Interfaz y carga del personalizador
  app.js           Selecciones, pasos, precios de ejemplo y carrito local
  kurtos-3d.js     Geometría, materiales, interacción y animaciones
  style.css        Estilos de la interfaz
  viewer.css       Apariencia del visor 3D y adaptación móvil
  vendor/         Three.js 0.170.0 y sus controles (licencia incluida)
docs/
  integration.md  Contrato actual y puntos de integración con ventas
  references/     Guía visual aprobada y menú de referencia
scripts/
  serve.mjs       Servidor de desarrollo sin dependencias
```

## Estado de la app de ventas

**Esta versión todavía es un prototipo de configuración.** Los precios son ejemplos y el carrito se guarda únicamente en `localStorage`. No se crean pedidos reales ni se procesan pagos. El menú adjunto es una referencia del negocio; sus precios e ingredientes todavía no están conectados al catálogo de la interfaz.

Para convertirla en una app de ventas completa faltan catálogo administrable, precios y disponibilidad validados en servidor, pedidos persistentes, usuarios y permisos, cobros y el flujo de atención del negocio. La integración puede reutilizar el visor 3D sin trasladar la lógica comercial al navegador. Ver [contrato de integración](docs/integration.md).

## Referencias

- [Guía visual aprobada](docs/references/kurtos-aprobado.png).
- [Menú original del negocio](docs/references/menu-original.png).
- [Demo publicada](https://cono-studio-quyi.sandraabasto.chatgpt.site/).

El repositorio contiene el código fuente editable de la demo actual. Los cambios en GitHub no despliegan automáticamente el sitio de la demo: todavía no hay un flujo de despliegue conectado a este repositorio.

## Dependencias y recursos

Three.js está incluido en `vendor/` para que el visor funcione sin depender de un CDN. Sus archivos mantienen su [licencia MIT original](apps/configurator/vendor/THREE-LICENSE.txt). Las fuentes tipográficas se solicitan a Google Fonts; sin conexión se utilizan las fuentes de respaldo del sistema.
