# Tesis20 Web

Sitio web profesional de Tesis20 para presentar servicios de asesoría académica, evidencias anonimizadas, resultados de calificaciones y un contrato general descargable.

## Funcionalidades principales

- Página de inicio responsive con identidad visual `#F5BD42`.
- Catálogo interactivo de seis servicios con audios locales.
- Galería de evidencias agrupadas y anonimizadas.
- Resultados de calificaciones en dos columnas para escritorio y una para celular.
- Contrato general de asesoría académica legible en la web y descargable en PDF.
- Navegación accesible, SEO básico y enlaces de orientación por WhatsApp.

## Desarrollo local

Requiere Node.js 20 o superior.

```bash
npm install
npm run dev -- --port 3000
```

Abrir `http://127.0.0.1:3000`.

## Compilación

```bash
npm run build
npm run preview -- --port 3000
```

## Rutas

- `/` — Inicio
- `/servicios` — Servicios
- `/evidencias` — Evidencias
- `/contrato` — Contrato general y descarga del PDF

## Aviso

Las evidencias públicas se muestran anonimizadas. El contrato incluido es un modelo general informativo y debe completarse y revisarse según el servicio concreto antes de firmarse.

