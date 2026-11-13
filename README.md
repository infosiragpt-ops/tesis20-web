# Tesis20 Web

Sitio web profesional de Tesis20 para presentar servicios de asesoría académica, evidencias anonimizadas, resultados de calificaciones y un contrato general descargable.

## Funcionalidades principales

- Página de inicio responsive con identidad visual `#F5BD42`.
- Catálogo interactivo de diez servicios (seis con audio local), incluidos los servicios por universidad: suficiencia profesional (UPN) y proyecto de tesis, tesis de maestría y RSL (UCV).
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
- `/recursos` — Buscador híbrido de tesis: repositorios PE (OAI-PMH) + corpus global OpenAlex (disertaciones, ranking por relevancia y citas)

## Carga y rendimiento

- **Hero de Inicio prerenderizado.** `npm run build` renderiza `<Hero />` (`src/home-sections.jsx`) en Node
  (`scripts/home-hero-prerender.mjs`) y lo escribe en `dist/index.html`: titular, botón de WhatsApp y foto se
  ven con el primer pintado, antes de que cargue la app. Sus animaciones quedan en pausa hasta que React lo
  reemplaza por el mismo marcado, así el cambio no se nota. No uses `window`, estado ni efectos en `<Hero />`.
- **Foto del hero.** `hero-students-640.avif` (640w) y `hero-students.avif` (800w). El `srcset`/`sizes` vive en
  `HERO_PHOTO_SRCSET`/`HERO_PHOTO_SIZES` y debe coincidir con la precarga de `index.html` (lo valida `npm run quality`).
- **Páginas con chunk propio** (`/contrato`, `/recursos`, `/carreras`, `/docentes`): `src/route-modules.js` las
  precarga antes de montar y su HTML trae `modulepreload` + CSS. Sin eso la página monta con un `<main>` provisional
  y el pie salta (CLS ~0,9). Al añadir otra página diferida, regístrala en `route-modules.js` y en `routeAssets`
  de `scripts/generate-static-routes.mjs`.
- **Miniaturas en WebP** (`public/assets/thumbnails/`): se generan desde la captura completa al mismo ancho
  (calidad 88 en calificaciones, 84 en evidencias). El logo de cabecera y pie es `tesis20-logo.webp`.
- **Texto legible en móvil:** ningún texto de lectura baja de 12 px; rótulos y etiquetas, de 11 px.

## Catálogo de servicios

Cada servicio se declara en dos lugares que deben ir a la par: `services` en `src/App.jsx` (tarjetas, fichas y
buscador) y `services` en `scripts/generate-static-routes.mjs` (HTML por ruta, SEO y sitemap). Al añadir uno,
agrégalo también a `routeSpecs` en `scripts/quality-check.mjs` y a `SERVICE_DETAIL_PATH` en `src/observability.jsx`.
Los servicios sin audio simplemente omiten `audio`, `audioDuration` y `transcript`.

## Datos de la empresa, oficinas y contrato

- **RUC y oficinas** (pie de todas las páginas, preguntas frecuentes): `src/data/company.js`. Una oficina sin
  `street` se muestra solo con su ciudad y un enlace para coordinar la visita por WhatsApp; no inventes direcciones.
- **Representante, domicilio, contacto y JSON-LD de la organización** (`taxID`, `location` por oficina):
  `scripts/company-schema.mjs`. Solo se usa al generar el HTML, así esos datos no viajan en el JavaScript; la app
  conserva el nodo `Organization` que ya trae el HTML prerenderizado.
- **Contrato** (`/contrato`, Word y PDF): `src/data/contract-template.json` (`parties`, `signatures`, `offices`,
  `clauses`). Tras editarlo, regenera las descargas con `python3 scripts/generate_contract_docx.py` y
  `python3 scripts/generate_contract_pdf.py` (necesitan `python-docx`, `reportlab` y `pypdf`; el PDF debe salir en
  2 páginas) y sube el `?v=` de los enlaces en `src/contract-page.jsx` para que nadie reciba la copia en caché.
- `npm run quality` comprueba que los tres archivos digan lo mismo, que el RUC supere su dígito verificador y que
  cada página publique el RUC y las oficinas en el pie y en los datos estructurados.

## Aviso

Las evidencias públicas se muestran anonimizadas. El contrato incluido es un modelo general informativo y debe completarse y revisarse según el servicio concreto antes de firmarse.

## Verificación

```bash
npm run test:game   # pruebas unitarias: Nido, buscador de tesis y API (node --test)
npm run build       # compila y genera el HTML estático por ruta
npm run quality     # HTML, SEO, enlaces, CSP, PWA y presupuestos de peso
npm run check:nido  # currículo, retos y audios de Nido
```

CI (`.github/workflows/ci.yml`) ejecuta esa misma secuencia en cada PR y en main.
La API `api/thesis-search.js` (Vercel) corta la consulta al proveedor a los 8,5 s,
cachea 5 min por instancia además del CDN y responde 429/503 con `Retry-After`
cuando OpenAlex limita o falla.
