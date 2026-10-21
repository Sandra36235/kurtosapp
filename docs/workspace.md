# Operación del local: pedidos, cocina, mesas y caja

La administración privada abre el espacio de trabajo nuevo. No requiere cuentas de clientes: la tienda pública sigue guardando el pedido y el enlace de WhatsApp contiene solamente `consultar mi pedido #NUMERO`.

## Reglas de preparación y pago

- Web delivery o retiro: Nuevo → Contactar y confirmar → Verificar pago → En cola → Preparando → Listo. Delivery continúa En reparto → Finalizado; retiro termina al entregar.
- Para llevar, tomado en el local: crear pedido → cobrar y verificar el importe completo → En cola → Preparando → Listo → Entregado.
- Consumo en mesa: abrir una de las 6 mesas → agregar rondas → cocinar y servir → cobrar → cerrar cuenta y liberar la mesa. Cada ronda tiene su propia preparación. Se pueden agregar más rondas durante la visita y el saldo se acumula.
- El servidor impide preparar pedidos no presenciales sin el pago completo. Un abono o un QR sin verificar no habilitan cocina. No basta cambiar una etiqueta en el navegador.
- Preparación y saldo son independientes. Cobrar una mesa no la libera ni marca su comida servida. Para liberar hay que resolver el saldo, devoluciones y rondas pendientes.

## Espacios de trabajo

**Pedidos** reúne los pedidos para atender en tres columnas: nuevos, contacto y pago. En la tarjeta y el panel lateral se muestran nombre, productos, notas, dirección, hora y saldo. El enlace al WhatsApp del cliente permite coordinar manualmente; no se envían mensajes automáticamente. Para delivery se confirma la distancia por calles a Bs 4/km antes de cobrar. Las otras pestañas muestran reparto y finalizados/cancelados.

**Cocina** reúne las rondas de mesas y los pedidos completamente pagados para llevar, retiro y delivery. Se pueden arrastrar entre los pasos permitidos, usar sus botones o seleccionar varias rondas y avanzarlas juntas. La operación en lote es atómica: si una tarjeta cambió o no puede avanzar, ninguna del lote se mueve. Los pedidos de mesa se marcan servidos; los de retiro, entregados; delivery pasa a reparto.

**Mesas** comienza con Mesa 1 a Mesa 6. Muestra libres/ocupadas, tiempo, cuenta, saldo y rondas pendientes. Se pueden renombrar, pausar si están libres o añadir mesas. Agregar ronda permite elegir menú o usar el personalizador 3D. Retirar una ronda completa solo es posible antes de empezar a prepararla y requiere motivo. Para cambiar una ronda ya preparada hay que gestionar una cancelación con su motivo, sin borrar el historial.

**Caja** abre un turno con responsable y efectivo inicial. Permite cobros parciales y combinados (efectivo, QR, tarjeta). El efectivo registra recibido y cambio; QR y tarjeta requieren referencia y confirmación manual. Las referencias no pueden duplicarse. El total de medios debe ser positivo y no superar el saldo. Ninguna operación bancaria se ejecuta desde la app.

Los movimientos de ingreso/retiro de efectivo llevan motivo. El cierre compara el efectivo físico con lo esperado. Las cuentas y cocina pueden continuar al turno siguiente: cerrar caja no cierra mesas ni inventa cobros pendientes. Los cobros, incluidos abonos, afectan inmediatamente el turno en que se reciben. Las devoluciones afectan el turno en que se registran; los informes de turnos cerrados se conservan.

## Cancelaciones y devoluciones

Cancelar requiere motivo y conserva productos, historial y cobros. Si ya hubo dinero recibido, aparece un saldo a devolver. La devolución debe registrarse por el medio de cada pago original, no supera lo efectivamente cobrado y necesita caja abierta. El efectivo disponible debe cubrir lo que se devuelve. Registrar la devolución significa que se realizó físicamente o se verificó en el medio electrónico correspondiente.

La mesa cancelada permanece ocupada hasta resolver devoluciones y cerrar la cuenta. Los pedidos cancelados se consultan en Finalizados y cancelados. Las ventas de la versión anterior siguen visibles en Historial y sus pedidos pagados pendientes siguen visibles en Cocina.

## Persistencia y protección frente a duplicados

Los datos internos usan registros `order`, `table`, `collection` y `refund` dentro de la D1 privada existente. Cada pedido mantiene revisión, rondas, pagos y actividad. No se borra ni reinicia la base anterior. La escritura usa la misma revisión global y lote atómico del sistema anterior.

Los intentos de operación se guardan con una clave única. Si se pierde la respuesta, la franja de operación pendiente permite recuperar la misma operación sin duplicar cobros o pedidos. No se permiten nuevas mutaciones hasta resolverla. Los formularios y cobros requieren conexión; no se simula éxito offline.

La tienda mantiene el registro original del pedido web. La administración recibe páginas firmadas de hasta 3 pedidos, usando un cursor persistente, y crea una sola cuenta interna por número web. Verifica firma y vencimiento en el servidor, rechaza saltos del cursor e ignora lotes ya recibidos. No importa ventas, saldos ni secretos desde el navegador. La firma de catálogo no habilita importación. La preparación se administra en la base privada; el endpoint anterior de cambios de estado de la tienda se retira para evitar que salte las reglas de cobro.

Los pedidos web antiguos ya entregados se conservan como histórico sin inventar pagos. Los antiguos pendientes entran al nuevo circuito de confirmación y pago; revisar manualmente si previamente se cobró algo en la caja anterior. El sistema no puede asociar automáticamente ventas antiguas sin una referencia común.

La sincronización corre cada 20 segundos mientras la pantalla está visible, sin formularios en edición ni operaciones pendientes. Se puede forzar con Actualizar. El catálogo y la tienda pública mantienen su separación de acceso.

Historial muestra los pedidos recientes. Buscar número exacto permite recuperar cuentas antiguas fuera de la vista reciente. Exportar registros descarga todos los datos internos de caja, pedidos, mesas, cobros y devoluciones. Los originales web permanecen en la base de la tienda.
