import part1 from './collection/texts-1.json' with { type: 'json' };
import part2 from './collection/texts-2.json' with { type: 'json' };
import part3 from './collection/texts-3.json' with { type: 'json' };
import part4 from './collection/texts-4.json' with { type: 'json' };
import part5 from './collection/texts-5.json' with { type: 'json' };
import { paginateStory } from './collection-layout.js';
import { directClassic } from './classic-direction.js';

// Authorized full text with the same studio voice plan as the original books.
// Device speech remains only as a fallback when a clip is missing. These
// editions still do not promise quizzes/souvenirs.

// Nido already ships illustrated studio editions of these stories
// (`caperucita` and `pulgarcito` in cuentos-data / PULGARCITO). Publishing
// the classic JSON twins put two Caperucitas and two Pulgarcitos on the shelf.
const UNPUBLISHED_CLASSICS = new Set(['pulgarcito', 'caperucita-original']);

export const CLASSIC_COLLECTION = [...part1, ...part2, ...part3, ...part4, ...part5]
  .filter(item => !UNPUBLISHED_CLASSICS.has(item.id))
  .map(item => {
  const texts = paginateStory(item.paragraphs);
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
    ...directClassic(item, texts),
    quiz: [],
  };
});
