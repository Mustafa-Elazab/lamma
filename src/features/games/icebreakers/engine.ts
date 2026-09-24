import type { GamePlayer, IcebreakerPrompt } from '../core/types';
import { nextIcebreakerPlayer } from './rotation';

export type IcebreakerRound = {
  round: number;
  player: GamePlayer;
  prompt: IcebreakerPrompt['prompt'];
  pickedPlayerIds: string[];
};

export function nextIcebreakerRound(params: {
  players: GamePlayer[];
  prompts: IcebreakerPrompt[];
  previous?: IcebreakerRound;
}): IcebreakerRound | null {
  const previousIds = params.previous?.pickedPlayerIds ?? [];
  const player = nextIcebreakerPlayer(params.players, previousIds);
  if (!player) {
    return null;
  }
  const round = (params.previous?.round ?? 0) + 1;
  const prompt = params.prompts[(round - 1) % params.prompts.length]
    ?.prompt ?? {
    en: '',
    ar: '',
  };
  const pickedPlayerIds =
    previousIds.includes(player.id) &&
    previousIds.length >= params.players.length
      ? [player.id]
      : [...previousIds, player.id];
  return { round, player, prompt, pickedPlayerIds };
}
