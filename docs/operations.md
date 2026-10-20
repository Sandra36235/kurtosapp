# Operación de ventas y caja

La aplicación está preparada para un local y una caja abierta a la vez. Los importes se guardan en centavos de boliviano. Los horarios se muestran en America/La_Paz.

## Recorrido diario

1. **Abrir caja:** indicar responsable, saldo inicial contado y observación opcional. El sistema impide abrir dos turnos simultáneamente.
2. **Vender:** elegir productos del menú, sus variantes y cantidades, o abrir el personalizador 3D. Agregar observaciones por producto o por pedido.
3. **Cobrar:** se recalcula el total en el servidor. En efectivo se ingresa el dinero recibido y se calcula el cambio. En QR o tarjeta se exige referencia y confirmación manual de haber recibido el pago. No hay una conexión bancaria ni un cargo automático.
4. **Preparar:** las ventas cobradas aparecen en Preparación. Avanzan de En preparación a Listo para entregar y después a Entregado.
5. **Registrar movimientos:** los ingresos y retiros adicionales exigen monto y motivo. No se contabilizan como ventas.
6. **Devolver:** desde el comprobante de una venta del turno abierto puede registrarse una devolución completa. El cajero debe devolver el dinero por el medio original y confirmar el hecho. La venta se conserva con el motivo de devolución; no se borra.
7. **Cerrar caja:** primero entregar o devolver todos los pedidos del turno. Registrar el efectivo contado. El sistema guarda el esperado, el contado, la diferencia y las observaciones. Un cierre permanece registrado.

## Cálculos

`efectivo esperado = saldo inicial + ventas netas en efectivo + ingresos adicionales − retiros`

Las ventas por QR y tarjeta no aumentan el efectivo esperado. Una devolución reduce las ventas netas del mismo medio original. Para una devolución en efectivo o un retiro se verifica el efectivo disponible.

## Menú y tarifas

El menú inicial reproduce nombres, ingredientes y precios de la imagen suministrada: Magnum 26, Oreo 25, Coconut 26, Coffee 25, Top 26, Clásico 22, Crema 15 y Dulce 7 bolivianos. Clásico y Top permiten elegir sabores; Dulce permite elegir su relleno.

Menú y precios permite cambiar importes y disponibilidad. La tarifa del personalizado también se puede ajustar: base, extras de cono, relleno, helado y precio por topping. **Revisar esta tarifa antes de operar:** sus valores iniciales provienen del prototipo, no del menú de productos terminados. Los cambios nunca alteran ventas anteriores.

## Recuperación ante una respuesta incierta

Cada escritura lleva un identificador de operación. Los reintentos del mismo cobro devuelven el resultado original. Si se pierde la conexión al confirmar, el navegador conserva el cobro pendiente y ofrece **Verificar cobro**, reutilizando su identificador. No se debe volver a cobrar al cliente mientras se resuelve ese estado.

Si se cambió el precio o el turno de caja mientras se cobraba, el servidor rechaza el total o el turno anterior y exige revisar el pedido.

## Comprobantes, historial y respaldo

Los comprobantes imprimibles son internos; la aplicación no emite facturas fiscales. El historial muestra las ventas recientes y todas las del turno abierto. El archivo JSON exportado incluye los registros completos de productos, turnos, ventas, movimientos, actividad y tarifas. No contiene un mecanismo automático de restauración.

En ejecución local, la base completa está en `data/kurtos.sqlite`. Respaldar la base con el proceso detenido o con una herramienta de respaldo de SQLite; no copiar solamente el archivo principal mientras hay escrituras WAL en curso. El archivo de datos está excluido de Git. En el sitio alojado se utiliza una base D1 independiente; los datos de prueba locales no se publican.

## Alcance

Esta entrega cubre caja, pedidos, menú, personalización, registro manual de cobros, devoluciones completas del turno y cierre. No incluye integración bancaria, facturación fiscal, pagos divididos, devoluciones de turnos cerrados, inventario ni varias sucursales.

El sitio mantiene su acceso privado de propietario. El nombre de responsable de caja es un registro del turno, no un sistema de usuarios y permisos por empleado. El servidor local escucha únicamente en 127.0.0.1; antes de exponerlo públicamente fuera del alojamiento privado se debe añadir autenticación y HTTPS.
