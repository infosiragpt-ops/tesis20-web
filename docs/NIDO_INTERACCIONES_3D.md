# Biblioteca Nido: interacción 3D

## Controles

- Arrastrar la sala en ambos sentidos recorre los libros con inercia limitada y ajuste al libro más cercano. Las tarjetas inferiores comparten el foco con la escena.
- Rueda vertical, pellizco de dos dedos y botones de zoom: 80–155 %. La rueda horizontal recorre la biblioteca. Abrir/cerrar el libro restablece la vista.
- Señalar una figura muestra su nombre. Tocarla reproduce su sonido, un giro completo y un estallido luminoso. Las figuras del libro también responden.
- Ratón: mano ilustrada y estela dorada. Táctil: destellos al tocar, sin cursor permanente.
- Con movimiento reducido se conservan navegación, zoom y nombres, pero se omiten estela, aleteo, saltos, giro y explosión.
- En teléfonos verticales, escena y transcripción tienen áreas separadas. El texto se puede desplazar sin ocultar los personajes.

## Implementación y límites

Escena y figuras originales en Three.js. Hyper3D MCP no estuvo disponible y no se utilizó Blender. Los fondos ilustrados siguen siendo texturas, mientras que todos los personajes del reparto tienen geometría volumétrica e interacción. No se duplican los personajes como recortes en las ilustraciones del lector.

`library-gestures.js` centraliza escala, límites e inercia. `toy-feedback.js` mantiene una cartela orientada a cámara y 48 partículas reutilizadas. `MagicCursor.jsx` limita la estela a 150 partículas, sin actualizaciones de React por fotograma. Se liberan figuras y materiales al cambiar la escena. El zoom, las flechas y las tarjetas conservan controles de teclado.

El sonido sigue requiriendo la primera interacción del visitante por las restricciones de reproducción automática del navegador. No se cambia el proveedor de narración ni se incluyen credenciales en este cambio.

## Verificación

CI ejecuta las cuatro pruebas de límites/inercia/escala/cobertura del reparto, además de compilación, currículo y presupuesto. La batería general mantiene tres fallos previos ajenos a Nido en `thesis-search.test.mjs`; no forman parte de esta modificación.

Prueba de interfaz antes de publicar: escritorio 1440×900 y móvil 390×844, arrastre en ambos sentidos, carrusel inferior, no apertura accidental al arrastrar, pellizco, zoom, nombres, giro 360°, apertura, cambio de página y regreso. Verificar también movimiento reducido, ausencia de desbordamiento y consola de la compilación de producción.
