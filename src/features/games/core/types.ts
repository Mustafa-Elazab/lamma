import type { IconName } from '../../../assets/icons';
import type { LocalizedText } from './localized';

export type GameId = 'imposter' | 'trivia-time' | 'icebreakers' | 'quarter-mile';
export type GameSyncType = 'host-led';

export type GamePlayer = {
  id: string;
  name: string;
  isHost: boolean;
  connected: boolean;
};

export type GameDefinition = {
  id: GameId;
  name: string | LocalizedText;
  shortDescription: string | LocalizedText;
  icon: IconName;
  minPlayers: number;
  maxPlayers: number;
  syncType: GameSyncType;
  accent: 'rose' | 'sky' | 'mint';
};

export type TriviaQuestion = {
  id: string;
  prompt: LocalizedText;
  options: LocalizedText[];
  correctIndex: number;
  category?: string;
  packId: string;
};

export type TriviaPack = {
  id: string;
  name: LocalizedText;
  questions: TriviaQuestion[];
};

export type IcebreakerPrompt = {
  id: string;
  prompt: LocalizedText;
};

export type QuarterMileItem = {
  id: string;
  name: LocalizedText;
  /** Relative power / score used to decide the winner. */
  score: number;
};

export type QuarterMilePack = {
  id: string;
  name: LocalizedText;
  items: QuarterMileItem[];
};

export type GameContent = {
  definition: GameDefinition;
  triviaPacks?: TriviaPack[];
  icebreakerPrompts?: IcebreakerPrompt[];
  quarterMilePacks?: QuarterMilePack[];
};

export type SessionPhase = 'idle' | 'lobby' | 'in-game' | 'ended';

export type GameSession = {
  id: string;
  gameId: GameId;
  code: string;
  phase: SessionPhase;
  hostId: string;
  players: GamePlayer[];
  gameState?: unknown;
  appliedActionIds?: string[];
  createdAt: number;
  updatedAt: number;
};

export type SessionTransport = 'nearby' | 'multipeer' | 'firestore-room-code';

export type GameSessionPlayerAction =
  | {
      id: string;
      kind: 'join';
      playerId: string;
      player: GamePlayer;
      createdAt: number;
    }
  | {
      id: string;
      kind: 'trivia-answer';
      playerId: string;
      optionIndex: number;
      questionIndex: number;
      answeredAtMs: number;
      createdAt: number;
    }
  | {
      id: string;
      kind: 'imposter-vote';
      playerId: string;
      targetPlayerId: string;
      round: number;
      createdAt: number;
    }
  | {
      id: string;
      kind: 'imposter-guess';
      playerId: string;
      wordId: string;
      round: number;
      createdAt: number;
    }
  | {
      id: string;
      kind: 'icebreaker-next';
      playerId: string;
      round: number;
      createdAt: number;
    }
  | {
      id: string;
      kind: 'quarter-mile-choice';
      playerId: string;
      turnIndex: number;
      choice: 'take' | 'leave';
      createdAt: number;
    }
  | {
      id: string;
      kind: 'connection';
      playerId: string;
      connected: boolean;
      createdAt: number;
    };
