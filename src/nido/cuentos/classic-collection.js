import part1 from './collection/texts-1.json' with { type: 'json' };
import part2 from './collection/texts-2.json' with { type: 'json' };
import part3 from './collection/texts-3.json' with { type: 'json' };
import part4 from './collection/texts-4.json' with { type: 'json' };
import part5 from './collection/texts-5.json' with { type: 'json' };
import { fixedRanges, sentenceRanges, storyTokens } from './collection-layout.js';
import { directClassic } from './classic-direction.js';

// Authorized full text with the same studio voice plan as the original books.
// Device speech remains only as a fallback when a clip is missing. These
// editions still do not promise quizzes/souvenirs.

// Nido already ships illustrated studio editions of these stories
// (`caperucita` and `pulgarcito` in cuentos-data / PULGARCITO). Publishing
// the classic JSON twins put two Caperucitas and two Pulgarcitos on the shelf.
const UNPUBLISHED_CLASSICS = new Set(['pulgarcito', 'caperucita-original']);

// Ediciones con escenas dirigidas página a página (classic-direction.js):
// su reparto de 10 o 15 hojas ya cae en frases completas y se conserva.
const FIXED_LAYOUT = new Set(['perla-dragon', 'tres-deseos', 'princesa-guisante']);

// La voz de estudio se grabó con el reparto fijo de 65 palabras y un rótulo
// «Parte N» por hoja. Cada página nueva suena como uno o varios tramos de
// esas grabaciones: `from`/`to` indexan las marcas de tiempo del clip (rótulo
// incluido), así no hay que volver a grabar nada. El rótulo sólo se oye en
// la primera hoja, donde es el título del cuento.
function recordedTitle(item, index) {
  return index ? `Parte ${index + 1}` : item.title;
}

function voiceSegments([start, end], recorded, leads) {
  const segments = [];
  recorded.forEach(([from, to], clip) => {
    const first = Math.max(start, from);
    const last = Math.min(end, to);
    if (first >= last) return;
    const withTitle = clip === 0 && first === 0;
    segments.push({ clip, from: withTitle ? 0 : leads[clip] + first - from, to: leads[clip] + last - from });
  });
  return segments;
}

export const CLASSIC_COLLECTION = [...part1, ...part2, ...part3, ...part4, ...part5]
  .filter(item => !UNPUBLISHED_CLASSICS.has(item.id))
  .map(item => {
  const { tokens } = storyTokens(item.paragraphs);
  const recorded = fixedRanges(item.paragraphs);
  const ranges = FIXED_LAYOUT.has(item.id) ? recorded : sentenceRanges(item.paragraphs);
  const text = ([start, end]) => tokens.slice(start, end).join(' ');
  const voicePages = recorded.map((range, index) => ({ t: recordedTitle(item, index), x: text(range) }));
  const leads = voicePages.map(page => page.t.split(/\s+/).length);
  const direction = directClassic(item, ranges.map(text));
  return {
    id: `clasico-${item.id}`,
    title: item.title,
    hero: item.title,
    edition: 'Texto de la web',
    source: item.source,
    warning: item.warning,
    tagline: item.note || 'Texto de la página indicada, sin resumir. Para compartir en familia.',
    set: item.set === 'sea-day' ? 'ocean-day' : item.set,
    wallTheme: item.wallTheme,
    accent: item.accent,
    cover: item.cover,
    cameo: item.cameo,
    names: direction.names,
    pages: direction.pages.map((page, index) => ({ ...page, voice: voiceSegments(ranges[index], recorded, leads) })),
    // Páginas tal como se grabaron (plan de voz) y a qué hoja nueva lleva cada
    // una, para que el progreso guardado con el reparto anterior no se pierda.
    voicePages,
    legacyPageMap: recorded.map(([start]) => ranges.findIndex(([from, to]) => start >= from && start < to)),
    quiz: [],
  };
});
