import { ICEBREAKER_PROMPTS } from '../../icebreakers/content/prompts';
import { nextIcebreakerRound } from '../../icebreakers/engine';
import {
  advanceMafiosoPhase,
  castMafiosoVote,
  createMafiosoState,
  revealMafiosoVote,
} from '../../mafioso/engine';
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

  it('creates host-authoritative Mafioso role assignments', () => {
    const state = createMafiosoState(players);
    expect(state.assignments).toHaveLength(players.length);
    expect(state.assignments.some(item => item.role === 'mafia')).toBe(true);
  });

  it('runs Mafioso vote and reveal state', () => {
    const state = createMafiosoState(players);
    const votePhase = [
      advanceMafiosoPhase,
      advanceMafiosoPhase,
      advanceMafiosoPhase,
    ].reduce(next => advanceMafiosoPhase(next), state);
    const voted = castMafiosoVote(
      castMafiosoVote(votePhase, 'p1', 'p2'),
      'p3',
      'p2',
    );
    const revealed = revealMafiosoVote(voted);

    expect(voted.votes).toEqual({ p1: 'p2', p3: 'p2' });
    expect(revealed.lastRevealedPlayerId).toBe('p2');
    expect(revealed.eliminatedPlayerIds).toContain('p2');
  });
});
