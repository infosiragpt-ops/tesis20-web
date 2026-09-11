# Biblioteca Nido: interacción 3D

## Controles

- Arrastrar la sala en ambos sentidos recorre los libros con inercia limitada y ajuste al libro más cercano. Las tarjetas inferiores comparten el foco con la escena.
- Rueda vertical, pellizco de dos dedos y botones de zoom: 80–155 %. La rueda horizontal recorre la biblioteca. Abrir/cerrar el libro restablece la vista.
- Señalar una figura muestra su nombre. Tocarla reproduce su sonido, un giro completo y un estallido luminoso. Las figuras del libro también responden.
- Ratón: mano ilustrada y estela dorada. Táctil: destellos al tocar, sin cursor permanente.
- Con movimiento reducido se conservan navegación, zoom y nombres, pero se omiten estela, aleteo, saltos, giro y explosión.
- En teléfonos verticales, escena y transcripción tienen áreas separadas. El texto se puede desplazar sin ocultar los personajes.
- En la mesa, arrastrar la tapa hacia la izquierda la abre de forma gradual (siguiendo al dedo); al soltar pasada casi la mitad del recorrido, o con un tirón rápido, el libro termina de abrirse. Un toque sobre el libro cerrado también lo abre. El botón «Abrir el libro» sigue disponible. Una pista junto al borde de la tapa y una leve elevación periódica de la esquina invitan al gesto.
- Arrastrar el libro hacia arriba, en la mesa o durante la lectura, lo devuelve a la repisa; el aviso en pantalla cambia cuando ya se puede soltar. Un gesto corto vuelve a la pose de partida con un rebote suave.
- En lectura, arrastrar la tapa abierta hacia la derecha la cierra. Escape, la cancelación táctil y un segundo dedo cancelan el gesto; el pellizco conserva el zoom. Mientras el libro vuela, se abre o se cierra no se aceptan gestos.

## Implementación y límites

Escena y figuras originales en Three.js. Hyper3D MCP no estuvo disponible y no se utilizó Blender. Los fondos ilustrados siguen siendo texturas, mientras que todos los personajes del reparto tienen geometría volumétrica e interacción. No se duplican los personajes como recortes en las ilustraciones del lector.

`library-gestures.js` centraliza escala, límites e inercia. `toy-feedback.js` mantiene una cartela orientada a cámara y 48 partículas reutilizadas. `MagicCursor.jsx` limita la estela a 150 partículas, sin actualizaciones de React por fotograma. Se liberan figuras y materiales al cambiar la escena. El zoom, las flechas y las tarjetas conservan controles de teclado.

El sonido sigue requiriendo la primera interacción del visitante por las restricciones de reproducción automática del navegador. No se cambia el proveedor de narración ni se incluyen credenciales en este cambio.

La distribución compacta los manifiestos sin cambiar sus datos y omite los sidecars de alineación duplicados, que solo usa el generador y permanecen en las fuentes. Se conservan todos los MP3, tiempos por palabra y portadas; el control de distribución comprueba los manifiestos y cada archivo de audio. Estas interacciones no amplían el presupuesto vigente de producción.

## Verificación

CI ejecuta las pruebas de límites/inercia/escala/cobertura del reparto y de los gestos del libro (intención, progreso y umbral de confirmación), además de compilación, currículo y presupuesto. La batería general mantiene tres fallos previos ajenos a Nido en `thesis-search.test.mjs`; no forman parte de esta modificación.

Prueba de interfaz antes de publicar: escritorio 1440×900 y móvil 390×844, arrastre en ambos sentidos, carrusel inferior, no apertura accidental al arrastrar, pellizco, zoom, nombres, giro 360°, apertura, cambio de página y regreso. Verificar también movimiento reducido, ausencia de desbordamiento y consola de la compilación de producción.

Para manipulación directa del libro: comprobar tapa parcial y retorno al soltar antes del umbral, apertura completa, cierre desde lectura, regreso desde lectura y mesa, cancelación, pellizco y botones. Las posiciones de arrastre no causan renders de React por fotograma. Las cargas asíncronas usan un identificador de solicitud para no reabrir un libro ya devuelto ni aplicar una página al cuento equivocado.
