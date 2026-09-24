import { ICEBREAKER_PROMPTS } from '../../icebreakers/content/prompts';
import { TRIVIA_PACKS } from '../../trivia/content/packs';
import { scoreTriviaAnswer } from '../../trivia/scoring';
import { IMPOSTER_CATEGORIES } from '../../imposter/words';

describe('game content', () => {
  it('ships at least 30 questions per trivia pack', () => {
    expect(TRIVIA_PACKS).toHaveLength(4);
    for (const pack of TRIVIA_PACKS) {
      expect(pack.questions.length).toBeGreaterThanOrEqual(30);
    }
  });

  it('ships playable trivia questions with real answer choices', () => {
    const ids = new Set<string>();

    for (const pack of TRIVIA_PACKS) {
      for (const question of pack.questions) {
        expect(ids.has(question.id)).toBe(false);
        ids.add(question.id);
        expect(question.options).toHaveLength(4);
        expect(question.correctIndex).toBeGreaterThanOrEqual(0);
        expect(question.correctIndex).toBeLessThan(question.options.length);
        expect(question.options.map(option => option.en)).not.toEqual([
          'Option A',
          'Option B',
          'Option C',
          'Option D',
        ]);
        expect(question.options[question.correctIndex]?.en).toBeTruthy();
      }
    }
  });

  it('ships at least 40 icebreaker prompts', () => {
    expect(ICEBREAKER_PROMPTS.length).toBeGreaterThanOrEqual(40);
  });

  it('scores faster correct trivia answers higher', () => {
    const fast = scoreTriviaAnswer({
      correct: true,
      answeredAtMs: 1_000,
      questionStartedAtMs: 0,
      timeLimitSeconds: 15,
    });
    const slow = scoreTriviaAnswer({
      correct: true,
      answeredAtMs: 10_000,
      questionStartedAtMs: 0,
      timeLimitSeconds: 15,
    });
    expect(fast).toBeGreaterThan(slow);
    expect(
      scoreTriviaAnswer({
        correct: false,
        answeredAtMs: 100,
        questionStartedAtMs: 0,
        timeLimitSeconds: 15,
      }),
    ).toBe(0);
  });

  it('ships a bilingual Imposter word bank with enough words per category', () => {
    for (const category of IMPOSTER_CATEGORIES) {
      expect(category.name.en && category.name.ar).toBeTruthy();
      expect(category.words.length).toBeGreaterThanOrEqual(8);
      const ids = new Set(category.words.map(word => word.id));
      expect(ids.size).toBe(category.words.length);
      for (const word of category.words) {
        expect(word.word.en && word.word.ar).toBeTruthy();
      }
    }
  });
});

describe('quarter mile packs', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { QUARTER_MILE_PACKS } = require('../../quarter-mile/content/packs');
  it('ships cars plus sports categories with unique, bilingual items', () => {
    const packs = QUARTER_MILE_PACKS as import('../types').QuarterMilePack[];
    expect(packs.map(p => p.id)).toEqual(
      expect.arrayContaining(['german-cars', 'football-stars', 'ufc-fighters']),
    );
    const ids = packs.flatMap(p => p.items.map(i => i.id));
    expect(new Set(ids).size).toBe(ids.length);
    packs.forEach(pack => {
      expect(pack.items.length).toBeGreaterThanOrEqual(14);
      pack.items.forEach(item => {
        expect(item.name.en).toBeTruthy();
        expect(item.name.ar).toBeTruthy();
        expect(item.score).toBeGreaterThan(0);
        expect(item.score).toBeLessThanOrEqual(100);
      });
    });
  });
});
