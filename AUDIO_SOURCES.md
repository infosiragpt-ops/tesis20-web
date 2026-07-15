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
