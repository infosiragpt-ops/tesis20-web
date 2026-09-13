# Tesis20 Nido — registro de recursos visuales

Este archivo evita incorporar personajes o imágenes sin procedencia verificable.
No se autoriza el uso de Disney ni de otra franquicia reconocible sin una
licencia comercial aportada y archivada por Tesis20.

## Recursos creados para el proyecto

### Portada de «Pulgarcito»

- Fuente: imagen `77c621cc-75e5-4339-8414-ff899a312d3d.png` aportada por Luis el 12 de septiembre de 2026 para este cuento.
- Destino: `public/assets/nido/cuentos/covers/pulgarcito-v1.avif`.
- Tratamiento: compresión y cambio de tamaño proporcional para la web, sin recorte ni texto, sombreado o marcas añadidas. `cover.preserve` conserva también los textos de la ilustración en el libro y las miniaturas.
- Texto: adaptación infantil en diez escenas del relato completo aportado por Luis. Conserva las aventuras del caballo, los viajeros, el caracol, los ladrones, la vaca y el lobo; omite detalles gráficos de violencia.
- Figuras: geometría original en Three.js para Pulgarcito, sus padres, el caballo, la vaca y el caracol/concha. El lobo reutiliza la figura existente de la biblioteca.
- Narración: 160 archivos nuevos con la voz Jhenny Cozy ya utilizada en Nido, normalizados a -16 LUFS y verificados por decodificación completa con ffmpeg; 993 audios previos reutilizados sin eliminación. Las diez páginas incluyen marcas de tiempo por palabra.
- No se atribuye a la imagen una licencia o un generador que no haya indicado el usuario.

### `celebration-festival-v1.jpg`

- Ruta: `public/assets/nido/worlds/celebration-festival-v1.jpg`
- Fecha: 2026-07-25
- Método: herramienta integrada de generación de imágenes de OpenAI; conversión
  local a JPEG de 1600 × 900, calidad 84.
- Uso: fondo diferido de la pantalla de ruta completada.
- Revisión: composición original, sin texto, marcas ni personajes de franquicia.
- Archivo fuente generado:
  `call_jiYoqvNdeZ8HHysPxhyKTihd.png`.

Prompt de producción:

> Use case: illustration-story
>
> Asset type: landscape celebration backdrop for a preschool educational game
> route-completion screen
>
> Primary request: Create an original, premium 3D clay-and-soft-toy diorama
> called a joyful learning festival. A magical burst of colorful confetti, tiny
> wrapped candies, balloons, ribbons, stars, and glowing sparkles rises around a
> small celebratory stage. The feeling is warm, safe, energetic, and highly
> captivating for children ages 2–6.
>
> Scene/backdrop: whimsical indoor-outdoor playroom festival with soft rounded
> architecture and a dreamy garden visible beyond; leave the central 45%
> visually calm and open so the app can overlay its own penguin mascot and
> reward text.
>
> Style/medium: polished tactile clay animation / handcrafted toy photography,
> professional children’s educational app art, original characters and shapes
> only.
>
> Composition/framing: wide 16:9 composition, decorative celebration
> concentrated around edges and upper corners, clear central negative space,
> readable at small sizes.
>
> Lighting/mood: bright soft studio lighting with magical warm rim light,
> jubilant and welcoming, no harsh contrast.
>
> Color palette: coral #ff6f61, sunshine gold #ffc94d, mint #46b982, sky blue
> #4b8ff7, violet #9873e7, cream and navy accents.
>
> Materials/textures: felt, matte clay, smooth painted wood, soft paper confetti.
>
> Constraints: no people, no copyrighted characters, no brand resemblance, no
> logos, no words, no letters, no numbers, no watermark; all decorative objects
> fully formed and child-safe; professional coherent anatomy and perspective.
>
> Avoid: Disney, Pixar, recognizable franchises, clutter in the center, scary
> imagery, photorealistic children, illegible text.

### Stickers SVG de animales y fantasía

- Rutas:
  `src/nido/stickers/sticker-animals.jsx` y
  `src/nido/stickers/sticker-animals-extended.jsx`.
- Método: SVG original dibujado como código para Tesis20 Nido.
- Dependencias externas: ninguna imagen incrustada.
- Cobertura añadida: tortuga, león, oveja, panda, mono, ardilla, rana, oso
  polar, unicornio, dragón, pato, león alado y ave de tres cabezas.

### Retratos SVG de familia

- Ruta: `src/nido/stickers/sticker-people.jsx`.
- Método: SVG original parametrizado y dibujado como código para Tesis20 Nido.
- Dependencias externas: ninguna imagen incrustada.
- Cobertura: mamá, papá, hermana, hermano, abuela, abuelo, tía, tío y
  primo/prima, con peinados, colores y accesorios diferenciados.

## Recursos anteriores que requieren completar procedencia

Los siguientes archivos ya existían en el repositorio y no conservan autor,
licencia, prompt, identificador de generación ni metadatos de procedencia. No se
debe afirmar una licencia concreta hasta que Tesis20 documente el archivo
original o lo sustituya por una creación con trazabilidad:

- `public/assets/nido/worlds/logic-world-v1.jpg`
- `public/assets/nido/worlds/math-world-v1.jpg`
- `public/assets/nido/worlds/attention-world-v1.jpg`
- `public/assets/nido/worlds/speech-world-v1.jpg`
- `public/assets/nido/worlds/english-world-v2.jpg`
- `public/assets/nido/activities/english-world-v1.jpg`
- `public/assets/nido/activities/teddy-with-bow-v1.jpg`
- `public/assets/nido/activities/teddy-without-bow-v1.jpg`

## Iconografía de interfaz

La aplicación utiliza `@phosphor-icons/react`. Su licencia debe mantenerse
junto con las demás licencias de terceros del repositorio. Los glifos no se
presentan como personajes ni como arte propio de Tesis20.

## Colección de 35 textos autorizados — 12 de septiembre de 2026

- El usuario confirmó en esta conversación que tiene autorización para copiar
  los textos de los 35 enlaces de cuentosinfantiles.net que proporcionó.
  Esto no se extiende a una licencia de las imágenes del sitio.
- `src/nido/cuentos/collection/texts-{1,2,3,4,5}.json` conserva para cada
  edición el enlace solicitado, los párrafos, fecha, autorización comunicada
  y SHA-256 del cuerpo completo tras normalizar espacios. La prueba de
  integridad verifica que paginar no elimina ni modifica palabras.
- Se importa el cuerpo del relato, no publicidad, comentarios ni navegación.
  Heidi conserva el capítulo 1 publicado en su enlace (no toda la novela).
  Bambi conserva el relato de la primera página, sin mezclar la versión
  alternativa a la que enlaza. Estas limitaciones se muestran al abrirlos.
- Son ediciones de lectura, no adaptaciones para preescolar: conservan los
  finales y situaciones del texto autorizado, con aviso de lectura acompañada.
  No incluyen locuciones, cuestionarios ni modelos 3D nuevos a medida.
  Las ediciones narradas anteriores conservan sus identificadores y progreso.

### Ilustraciones de las portadas

- Se reutilizan las portadas locales aprobadas de Pulgarcito y Caperucita.
  Las otras 33 imágenes están en `public/assets/nido/cuentos/collection/`.
- Proceden de Wikimedia Commons, Project Gutenberg y The Metropolitan Museum
  of Art. Cada `cover.credit` en los JSON anteriores registra obra, autor,
  licencia indicada por la fuente, ficha, URL del archivo y transformación.
  Los créditos también son visibles en «Sobre esta edición y su portada».
- Las fichas seleccionadas indican dominio público o CC0. Cuando Gutenberg
  declara dominio público en Estados Unidos, se conserva esa precisión.
  No se presenta una licencia universal ni se atribuyen estas ilustraciones
  históricas a Tesis20 o a cuentosinfantiles.net.
- Se conservó la imagen completa, reducida como máximo a 640 × 900 píxeles
  y convertida a AVIF. El marco y título en español se componen en el libro;
  las ilustraciones no son reproducciones de portadas comerciales actuales.
  Algunas son ilustraciones temáticas, no escenas de la versión textual exacta.
- El presupuesto específico mantiene los textos diferidos bajo 350 KiB y
  las 33 portadas bajo 2.5 MiB; no aumenta los límites del motor ni de la
  carga inicial del sitio. Solo se solicitan portadas cercanas o seleccionadas.
