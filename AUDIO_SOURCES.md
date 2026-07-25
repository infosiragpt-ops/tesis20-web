# Voz unificada de Tesis20

Actualización realizada el 15 de julio de 2026. Los siete audios fueron regenerados con una sola voz masculina profesional para ofrecer una experiencia consistente y natural en toda la plataforma.

## Configuración común

- Voz: Alex Neural, hombre, español de Perú (`es-PE-AlexNeural`).
- Velocidad: ritmo natural ligeramente pausado (`-2%`).
- Formato: MP3 mono, 44.1 kHz y 128 kbps.
- Normalización: objetivo de -16 LUFS, con resultados verificados entre -16.1 y -16.4 LUFS.
- Reproducción: archivos locales, sin dependencia del sitio público.

| Uso | Archivo local | Guion local | Duración verificada |
| --- | --- | --- | --- |
| Presentación general | `public/assets/audio/tesis20-presentacion.mp3` | `audio-scripts/presentacion.txt` | 1:00 |
| Artículo científico | `public/assets/audio/servicio-articulo-cientifico.mp3` | `audio-scripts/articulo-cientifico.txt` | 0:54 |
| Tesis I – Proyecto | `public/assets/audio/servicio-tesis-1-proyecto.mp3` | `audio-scripts/tesis-i-proyecto.txt` | 0:56 |
| Tesis II – De titulación | `public/assets/audio/servicio-tesis-2-titulacion.mp3` | `audio-scripts/tesis-ii-titulacion.txt` | 0:57 |
| Trabajo de suficiencia profesional | `public/assets/audio/servicio-suficiencia-profesional.mp3` | `audio-scripts/suficiencia-profesional.txt` | 0:55 |
| IBM SPSS Statistics | `public/assets/audio/servicio-ibm-spss-statistics.mp3` | `audio-scripts/ibm-spss-statistics.txt` | 0:55 |
| Simulación de sustentación | `public/assets/audio/servicio-simulacion-sustentacion.mp3` | `audio-scripts/simulacion-sustentacion.txt` | 0:50 |

Los guiones describen únicamente los servicios, beneficios y precios publicados en la plataforma. Los reproductores de las seis tarjetas de servicios usan archivos reales y nunca muestran estados simulados de `00:00`.

## Regeneración y respaldo

El comando `./scripts/generate_male_audio.sh` vuelve a producir las siete pistas con la configuración aprobada. Antes de reemplazarlas crea automáticamente una copia completa en `backups/audio-before-male-voice-AAAAMMDD-HHMMSS/`.

## Referencia histórica

Antes de esta unificación, cinco pistas provenían de la página pública de Tesis20 y utilizaban voces, ritmos y niveles distintos. Esos archivos fueron reemplazados por las versiones uniformes indicadas arriba. IBM SPSS Statistics y Simulación de sustentación recibieron guiones nuevos basados en el contenido visible de sus respectivas tarjetas.

## Voz profesional de Tesis20 Nido

Los juegos de `/nido` usan un catálogo independiente de narraciones locales:

- Proveedor de generación: ElevenLabs.
- Modelo por defecto: `eleven_multilingual_v2`.
- Voz femenina por defecto: «Jhenny Cozy» (`EDitztUwd7lban76PAZs`), tierna, cálida y con la entonación más viva de las candidatas medidas.
- Cobertura: todo el catálogo (29 rutas escritas a mano + 500 juegos generados, con locución compartida por texto), 219 líneas de Misión del Bosque y 11 frases de celebración, con archivos deduplicados por texto y perfil de edad.
- Entrega: MP3 mono de 64 kbps normalizado a -16 LUFS desde `/assets/nido/audio/generated/`; la clave nunca llega al navegador.
- Respaldo: si un archivo no está disponible, la interfaz intenta la voz del dispositivo y siempre conserva la consigna visible.

Los perfiles cambian el ritmo y la redacción para `2–3`, `4–5` y `6` años: la velocidad baja a 0,84 para los más pequeños y sube a 0,99 para los de seis. Los sonidos de acierto y error son archivos locales independientes para responder de inmediato.

### Por qué esta voz

La elección se midió, no se opinó. Frente a ocho candidatas, «Jhenny Cozy» resultó la de entonación más viva (variación de tono 0,29 y energía 0,63), justo lo que pide una maestra entusiasta para niños de 2 a 7 años, manteniendo la dicción intacta con `stability` 0,4 y `style` 0,45. Los perfiles por edad ajustan la velocidad (0,82 / 0,94 / 0,99) para que los más pequeños escuchen pausado y los de seis, fluido.

Para regenerar:

```bash
ELEVENLABS_API_KEY=... npm run audio:nido
```

La variable debe configurarse únicamente en un entorno seguro y nunca con el prefijo `VITE_`. El script reanuda por hash, nivela cada locución con `ffmpeg` (`loudnorm=I=-16:TP=-1.5:LRA=11`), la valida con `ffprobe` y actualiza `public/assets/nido/audio/manifest.json` solo después de completar el catálogo. Con `NIDO_TTS_LIMIT=4` genera un ensayo corto sin tocar el manifiesto ni los audios en uso.
