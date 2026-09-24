import type { GameDefinition, GameId } from './types';

export const GAME_REGISTRY: GameDefinition[] = [
  {
    id: 'imposter',
    name: { en: 'Imposter', ar: 'مين الدخيل؟' },
    shortDescription: {
      en: 'Everyone gets the same secret word except one. Give clues, vote, catch the imposter.',
      ar: 'الكل عارف نفس الكلمة إلا واحد. قول تلميح، صوّت، واكشف الدخيل.',
    },
    icon: 'shield',
    minPlayers: 3,
    maxPlayers: 12,
    syncType: 'host-led',
    accent: 'rose',
  },
  {
    id: 'trivia-time',
    name: { en: 'Trivia Time', ar: 'وقت التريفيا' },
    shortDescription: {
      en: 'Fast multiple-choice rounds with live scores and a prize.',
      ar: 'جولات أسئلة سريعة مع نتائج مباشرة وجائزة.',
    },
    icon: 'poll',
    minPlayers: 1,
    maxPlayers: 20,
    syncType: 'host-led',
    accent: 'sky',
  },
  {
    id: 'quarter-mile',
    name: { en: 'Quarter Mile', ar: 'ربع ميل' },
    shortDescription: {
      en: 'Take the known car or risk the hidden one — best garage wins.',
      ar: 'خد العربية الظاهرة أو غامض المخفية — أقوى جراج يفوز.',
    },
    icon: 'diamond',
    minPlayers: 2,
    maxPlayers: 2,
    syncType: 'host-led',
    accent: 'mint',
  },
  {
    id: 'icebreakers',
    name: { en: 'Lamma Icebreakers', ar: 'كسّارات جليد لمتة' },
    shortDescription: {
      en: 'Prompts rotate through the group for easy conversation.',
      ar: 'أسئلة تدور على المجموعة لفتح الكلام بسهولة.',
    },
    icon: 'comment',
    minPlayers: 2,
    maxPlayers: 30,
    syncType: 'host-led',
    accent: 'mint',
  },
];

export function gameById(id: GameId): GameDefinition {
  const game = GAME_REGISTRY.find(item => item.id === id);
  if (!game) {
    throw new Error(`Unknown game: ${id}`);
  }
  return game;
}
