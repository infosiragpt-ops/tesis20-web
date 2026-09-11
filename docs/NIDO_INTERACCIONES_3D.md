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

- Diorama de cada página en dos filas: personajes delante (el protagonista al centro y algo mayor, hasta tres en arco) y escenografía detrás, a los lados y más pequeña; todas las figuras giran ligeramente hacia el centro. Mientras la narradora lee, el protagonista «habla» con un gesto de cabeza por palabra y los demás personajes se giran a mirarlo y se mecen; al terminar vuelven al bamboleo tranquilo.
- Iluminación de entorno precalculada (RoomEnvironment) y sombras suaves: reflejos reales en tapas, vidrio y figuras sin coste por fotograma.
- Sonido: ambiente del escenario en bucle bajo la narración, efectos de interfaz grabados (pasar página, abrir, cerrar, acierto…) y la voz de cada figura al tocarla o al entrar en escena.

- Repisa: un protagonista de pie encima de cada libro (el del libro enfocado recibe la luz cálida y se anima) con las figuras decorativas intercaladas; ya no hay óvalo. El desplazamiento se acota al ancho visible para que la fila de libros llene la pantalla sin paredes vacías a los lados. La pared cambia de tema con cada cuento, también con «Los tres cerditos» (casitas y flores) y «Caperucita Roja» (hojas y corazones).
- Figuras articuladas: cada personaje declara en `userData` su cabeza, ojos, brazos, alas, cola, orejas y patas (`toys/*.js`). El escenario restaura su pose de reposo cada fotograma y las acciones sólo suman movimiento sobre ella. Catálogo de 21 acciones en `cuentos-acts.js` (mirar al cielo, escuchar, pensar, asentir, cantar, levantar los brazos, saludar, volar, saltar, nadar, olfatear, picotear, bailar, además de soplar, aullar, temblar, correr, caminar, construir, festejar y dormir). Cada página fija una acción sostenida por personaje (`acts`) y dispara ráfagas por palabra narrada (`cues`, con `hold` en ms para alargarlas); los diez cuentos las usan. Ojos de cuento (globo, iris y brillo) y parpadeo en todas las figuras, incluidas Caperucita, la abuelita y el cazador.
- Efectos por cuento: además de las voces de las figuras, 28 efectos grabados con ElevenLabs para los ocho relatos originales (canto del osito, luna que despierta, abejas, salto del bufeo, trueno lejano, estrella que cae, viento de arena, gota, tren que arranca, eco del silbato, olas, canto de la niña, ballena que emerge…) enlazados por palabra en `cues` o al abrir (`sfx`) y cerrar (`sfxEnd`) la página.
- Cuando la narradora nombra a un personaje presente en la página («Pipo», «Lolo», «Tito», «búho»…), su figura se ilumina con un aro de luz y un brillo cálido, da un saltito y toma la palabra: los demás se giran a mirarla. Las palabras que nombran a cada figura están en `names` de cada libro y se verifican en CI. Todas las figuras parpadean cada pocos segundos.

## Implementación y límites

Escena y figuras originales en Three.js. Hyper3D MCP no estuvo disponible y no se utilizó Blender. Los fondos ilustrados siguen siendo texturas, mientras que todos los personajes del reparto tienen geometría volumétrica e interacción. No se duplican los personajes como recortes en las ilustraciones del lector.

`library-gestures.js` centraliza escala, límites e inercia. `toy-feedback.js` mantiene una cartela orientada a cámara y 48 partículas reutilizadas. `MagicCursor.jsx` limita la estela a 150 partículas, sin actualizaciones de React por fotograma. Se liberan figuras y materiales al cambiar la escena. El zoom, las flechas y las tarjetas conservan controles de teclado.

El sonido sigue requiriendo la primera interacción del visitante por las restricciones de reproducción automática del navegador. No se cambia el proveedor de narración ni se incluyen credenciales en este cambio.

La distribución compacta los manifiestos sin cambiar sus datos y omite los sidecars de alineación duplicados, que solo usa el generador y permanecen en las fuentes. Se conservan todos los MP3, tiempos por palabra y portadas; el control de distribución comprueba los manifiestos y cada archivo de audio. Estas interacciones no amplían el presupuesto vigente de producción.

## Verificación

CI ejecuta las pruebas de límites/inercia/escala/cobertura del reparto y de los gestos del libro (intención, progreso y umbral de confirmación), la articulación de cada figura del reparto (cabeza, ojos, alas/cola/patas/brazos, altura y apoyo) y la cobertura de acciones y efectos por cuento (`toys-articulation.test.mjs`), además de compilación, currículo y presupuesto. La batería general mantiene tres fallos previos ajenos a Nido en `thesis-search.test.mjs`; no forman parte de esta modificación.

Prueba de interfaz antes de publicar: escritorio 1440×900 y móvil 390×844, arrastre en ambos sentidos, carrusel inferior, no apertura accidental al arrastrar, pellizco, zoom, nombres, giro 360°, apertura, cambio de página y regreso. Verificar también movimiento reducido, ausencia de desbordamiento y consola de la compilación de producción.

Para manipulación directa del libro: comprobar tapa parcial y retorno al soltar antes del umbral, apertura completa, cierre desde lectura, regreso desde lectura y mesa, cancelación, pellizco y botones. Las posiciones de arrastre no causan renders de React por fotograma. Las cargas asíncronas usan un identificador de solicitud para no reabrir un libro ya devuelto ni aplicar una página al cuento equivocado.
