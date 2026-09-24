import { ICEBREAKER_PROMPTS } from '../../icebreakers/content/prompts';
import { TRIVIA_PACKS } from '../../trivia/content/packs';
import { scoreTriviaAnswer } from '../../trivia/scoring';
import { mafiosoRolePlan } from '../../mafioso/rules';

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

  it('creates a Mafioso role plan for the current player count', () => {
    expect(mafiosoRolePlan(6)).toHaveLength(6);
    expect(mafiosoRolePlan(6)).toContain('mafia');
    expect(mafiosoRolePlan(6).filter(r => r === 'mafia')).toHaveLength(2);
    expect(mafiosoRolePlan(6)).toContain('villager');
  });
});
