import { ICEBREAKER_PROMPTS } from '../../icebreakers/content/prompts';
import { nextIcebreakerRound } from '../../icebreakers/engine';
import {
  allImposterVotesIn,
  castImposterVote,
  createImposterRound,
  imposterGuess,
  revealImposterVote,
  startImposterVote,
} from '../../imposter/engine';
import {
  advanceTriviaQuestion,
  answerTriviaQuestion,
  createTriviaRound,
  revealTriviaQuestion,
  triviaWinner,
} from '../../trivia/engine';
import { TRIVIA_PACKS } from '../../trivia/content/packs';
import type { GamePlayer, IcebreakerPrompt } from '../types';

const players: GamePlayer[] = [
  { id: 'p1', name: 'One', connected: true, isHost: true },
  { id: 'p2', name: 'Two', connected: true, isHost: false },
  { id: 'p3', name: 'Three', connected: true, isHost: false },
  { id: 'p4', name: 'Four', connected: true, isHost: false },
];

const prompts: IcebreakerPrompt[] = ICEBREAKER_PROMPTS.map((prompt, index) => ({
  id: `prompt-${index + 1}`,
  prompt: { en: prompt, ar: prompt },
}));

describe('game engines', () => {
  it('runs trivia question scoring and exposes the winner prize flow data', () => {
    const round = createTriviaRound({
      pack: TRIVIA_PACKS[0],
      players,
      settings: { questionCount: 5, prize: 'Winner picks music' },
      now: 0,
    });
    const question = round.questions[0];
    const answered = answerTriviaQuestion(
      round,
      'p2',
      question.correctIndex,
      1_000,
    );
    const revealed = revealTriviaQuestion(answered);
    expect(revealed.phase).toBe('reveal');
    expect(triviaWinner(revealed)?.playerId).toBe('p2');
    expect(revealed.settings.prize).toBe('Winner picks music');
    expect(advanceTriviaQuestion(revealed, 2_000).currentIndex).toBe(1);
  });

  it('rotates icebreaker players before repeating them', () => {
    const first = nextIcebreakerRound({ players, prompts });
    const second = nextIcebreakerRound({
      players,
      prompts,
      previous: first ?? undefined,
    });
    expect(first?.player.id).toBe('p1');
    expect(second?.player.id).toBe('p2');
    expect(first?.prompt.en).toBe(ICEBREAKER_PROMPTS[0]);
  });

  it('deals one imposter and one shared word to everyone in the round', () => {
    const state = createImposterRound({ players });
    expect(state.playerIds).toHaveLength(4);
    expect(state.playerIds).toContain(state.imposterId);
    expect(state.phase).toBe('clues');
    expect(state.word.en).toBeTruthy();
  });

  it('players win when they vote out the imposter and the guess is wrong', () => {
    const base = startImposterVote(createImposterRound({ players, rng: () => 0 }));
    const imp = base.imposterId;
    const others = base.playerIds.filter(id => id !== imp);
    let state = base;
    others.forEach(id => {
      state = castImposterVote(state, id, imp);
    });
    state = castImposterVote(state, imp, others[0]!);
    expect(castImposterVote(state, others[0]!, others[1]!).votes).toEqual(state.votes);
    expect(castImposterVote(base, imp, imp).votes).toEqual({});
    expect(allImposterVotesIn(state, base.playerIds)).toBe(true);
    const guessing = revealImposterVote(state);
    expect(guessing.phase).toBe('guess');
    expect(guessing.guessOptions?.some(o => o.id === base.wordId)).toBe(true);
    const wrong = guessing.guessOptions!.find(o => o.id !== base.wordId)!;
    const done = imposterGuess(guessing, imp, wrong.id);
    expect(done.winner).toBe('players');
    others.forEach(id => expect(done.scores[id]).toBe(1));
    expect(imposterGuess(guessing, imp, base.wordId).winner).toBe('imposter');
  });

  it('imposter wins on a tie or when an innocent player is voted out', () => {
    const base = startImposterVote(createImposterRound({ players, rng: () => 0 }));
    const imp = base.imposterId;
    const [a, b, c] = base.playerIds.filter(id => id !== imp) as [string, string, string];
    const tie = revealImposterVote(
      castImposterVote(castImposterVote(base, a, b), b, a),
    );
    expect(tie.tie).toBe(true);
    expect(tie.winner).toBe('imposter');
    const wrong = revealImposterVote(
      castImposterVote(castImposterVote(castImposterVote(base, a, c), b, c), imp, c),
    );
    expect(wrong.votedOutId).toBe(c);
    expect(wrong.winner).toBe('imposter');
    expect(wrong.scores[imp]).toBe(2);
  });

  it('never repeats a word across rounds and keeps scores', () => {
    const first = createImposterRound({ players });
    const second = createImposterRound({ players, previous: first });
    expect(second.round).toBe(2);
    expect(`${second.categoryId}:${second.wordId}`).not.toBe(
      `${first.categoryId}:${first.wordId}`,
    );
  });
});
