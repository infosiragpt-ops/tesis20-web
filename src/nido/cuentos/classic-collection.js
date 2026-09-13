import part1 from './collection/texts-1.json' with { type: 'json' };
import part2 from './collection/texts-2.json' with { type: 'json' };
import part3 from './collection/texts-3.json' with { type: 'json' };
import part4 from './collection/texts-4.json' with { type: 'json' };
import part5 from './collection/texts-5.json' with { type: 'json' };
import { paginateStory } from './collection-layout.js';

// Texto reproducido con autorización confirmada por el usuario. Las ediciones
// largas son de lectura: no se anuncian audios o quizzes que no existen.
const subjects = [
  [/\blobo\b/i, 'lobo'], [/\boveja\b/i, 'oveja'], [/\bbúho\b/i, 'buho'],
  [/\bmariposa\b/i, 'mariposa'], [/\bpez\b/i, 'pez'], [/\bballena\b/i, 'ballena'],
  [/\bcaballo\b/i, 'caballo'], [/\bvaca\b/i, 'vaca'], [/\bzorro\b/i, 'zorro'],
  [/\boso\b/i, 'oso'], [/\bcaracol\b/i, 'caracol'],
];

export const CLASSIC_COLLECTION = [...part1, ...part2, ...part3, ...part4, ...part5].map(item => {
  const texts = paginateStory(item.paragraphs);
  return {
    id: `clasico-${item.id}`,
    title: item.title,
    hero: item.title,
    edition: 'Texto de la web',
    narration: 'reading-only',
    source: item.source,
    warning: item.warning,
    tagline: item.note || 'Texto de la página indicada, sin resumir. Para compartir en familia.',
    set: item.set === 'sea-day' ? 'ocean-day' : item.set,
    wallTheme: item.wallTheme,
    accent: item.accent,
    cover: item.cover,
    cameo: item.cameo,
    pages: texts.map((x, index) => ({
      t: index === 0 ? item.title : 'Continúa el cuento',
      x,
      light: item.light || 'day',
      cast: subjects.filter(([pattern]) => pattern.test(x)).map(([, id]) => id).slice(0, 2),
      props: item.props,
    })),
    quiz: [],
  };
});
