import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  collection,
  getDoc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  doc,
  type DocumentData,
} from '@react-native-firebase/firestore';

import type { IconName } from '../../../assets/icons';
import { reportError } from '../../../services/crashReporting';
import { appLogger } from '../../../services/logger';
import type {
  GameContent,
  GameDefinition,
  GameId,
  GameSyncType,
  IcebreakerPrompt,
  MafiosoClue,
  MafiosoRoleContent,
  TriviaQuestion,
} from './types';
import type { LocalizedText } from './localized';

const GAMES_COLLECTION = 'games';
const CACHE_KEY = 'lamma.games.content.v3';

type SnapshotLike = { id: string; data: () => unknown };

function localized(value: unknown, fallback = ''): LocalizedText {
  if (value && typeof value === 'object') {
    const record = value as Partial<LocalizedText>;
    return {
      en: String(record.en ?? record.ar ?? fallback),
      ar: String(record.ar ?? record.en ?? fallback),
    };
  }
  return { en: String(value ?? fallback), ar: String(value ?? fallback) };
}

function numberValue(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function stringValue<T extends string>(value: unknown, fallback: T): T {
  return typeof value === 'string' && value ? (value as T) : fallback;
}

function mapGameDoc(snapshot: SnapshotLike): GameDefinition {
  const data = (snapshot.data() ?? {}) as DocumentData;
  return {
    id: snapshot.id as GameId,
    name: localized(data.name, snapshot.id),
    shortDescription: localized(data.description),
    icon: stringValue<IconName>(data.icon, 'comment'),
    minPlayers: numberValue(data.minPlayers, 2),
    maxPlayers: numberValue(data.maxPlayers, 12),
    syncType: stringValue<GameSyncType>(data.syncType, 'host-led'),
    accent: stringValue<GameDefinition['accent']>(data.accent, 'mint'),
  };
}

function mapMafiosoRole(snapshot: SnapshotLike): MafiosoRoleContent {
  const data = (snapshot.data() ?? {}) as DocumentData;
  return {
    id: snapshot.id,
    label: localized(data.label, snapshot.id),
    description: localized(data.description),
  };
}

function mapTriviaQuestion(snapshot: SnapshotLike): TriviaQuestion {
  const data = (snapshot.data() ?? {}) as DocumentData;
  const options = Array.isArray(data.options)
    ? data.options.map(option => localized(option))
    : [];
  return {
    id: snapshot.id,
    prompt: localized(data.prompt),
    options,
    correctIndex: numberValue(data.correctIndex, 0),
    category: typeof data.category === 'string' ? data.category : undefined,
    packId: stringValue(data.packId, 'general'),
  };
}

async function getOrderedSubcollection(
  path: string[],
): Promise<SnapshotLike[]> {
  const ref = collection(getFirestore(), path.join('/'));
  const snapshot = await getDocs(query(ref, orderBy('order', 'asc')));
  return snapshot.docs as SnapshotLike[];
}

async function readCachedGames(): Promise<GameContent[] | null> {
  const cached = await AsyncStorage.getItem(CACHE_KEY);
  if (!cached) {
    return null;
  }
  return JSON.parse(cached) as GameContent[];
}

async function writeCachedGames(content: GameContent[]): Promise<void> {
  await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(content));
}

export async function getCachedGameContent(): Promise<GameContent[] | null> {
  try {
    return await readCachedGames();
  } catch (error) {
    appLogger.error(
      '[games.content] Failed to read cached game content',
      error,
    );
    return null;
  }
}

export async function fetchGameContent(): Promise<GameContent[]> {
  try {
    const gamesSnapshot = await getDocs(
      query(
        collection(getFirestore(), GAMES_COLLECTION),
        orderBy('order', 'asc'),
      ),
    );
    const games = await Promise.all(
      (gamesSnapshot.docs as SnapshotLike[]).map(async gameDoc => {
        const definition = mapGameDoc(gameDoc);
        const content: GameContent = { definition };

        if (definition.id === 'mafioso') {
          const [phaseDocs, roleDocs] = await Promise.all([
            getOrderedSubcollection([
              GAMES_COLLECTION,
              definition.id,
              'phases',
            ]),
            getOrderedSubcollection([GAMES_COLLECTION, definition.id, 'roles']),
          ]);
          const clueDocs = await getOrderedSubcollection([
            GAMES_COLLECTION,
            definition.id,
            'clues',
          ]).catch(() => [] as SnapshotLike[]);
          content.mafioso = {
            phases: phaseDocs.map(snapshot =>
              localized((snapshot.data() as DocumentData).label, snapshot.id),
            ),
            roles: roleDocs.reduce<Record<string, MafiosoRoleContent>>(
              (next, snapshot) => ({
                ...next,
                [snapshot.id]: mapMafiosoRole(snapshot),
              }),
              {},
            ),
            clues: clueDocs.map<MafiosoClue>(snapshot => ({
              id: snapshot.id,
              text: localized(
                (snapshot.data() as DocumentData).text ??
                  (snapshot.data() as DocumentData).prompt,
                snapshot.id,
              ),
            })),
          };
        }

        if (definition.id === 'quarter-mile') {
          const [packDocs, itemDocs] = await Promise.all([
            getOrderedSubcollection([GAMES_COLLECTION, definition.id, 'packs']),
            getOrderedSubcollection([GAMES_COLLECTION, definition.id, 'items']),
          ]);
          const items = itemDocs.map(snapshot => {
            const data = (snapshot.data() ?? {}) as DocumentData;
            return {
              id: snapshot.id,
              name: localized(data.name, snapshot.id),
              score: numberValue(data.score, 50),
              packId: stringValue(data.packId, 'german-cars'),
            };
          });
          content.quarterMilePacks = packDocs.map(snapshot => {
            const data = (snapshot.data() ?? {}) as DocumentData;
            const id = snapshot.id;
            return {
              id,
              name: localized(data.name, id),
              items: items
                .filter(item => item.packId === id)
                .map(({ id: itemId, name, score }) => ({
                  id: itemId,
                  name,
                  score,
                })),
            };
          });
        }

        if (definition.id === 'trivia-time') {
          const [packDocs, questionDocs] = await Promise.all([
            getOrderedSubcollection([GAMES_COLLECTION, definition.id, 'packs']),
            getOrderedSubcollection([
              GAMES_COLLECTION,
              definition.id,
              'questions',
            ]),
          ]);
          const questions = questionDocs.map(mapTriviaQuestion);
          content.triviaPacks = packDocs.map(snapshot => {
            const data = (snapshot.data() ?? {}) as DocumentData;
            const id = snapshot.id;
            return {
              id,
              name: localized(data.name, id),
              questions: questions.filter(question => question.packId === id),
            };
          });
        }

        if (definition.id === 'icebreakers') {
          const promptDocs = await getOrderedSubcollection([
            GAMES_COLLECTION,
            definition.id,
            'prompts',
          ]);
          content.icebreakerPrompts = promptDocs.map<IcebreakerPrompt>(
            snapshot => ({
              id: snapshot.id,
              prompt: localized((snapshot.data() as DocumentData).prompt),
            }),
          );
        }

        return content;
      }),
    );
    await writeCachedGames(games);
    return games;
  } catch (error) {
    const cached = await getCachedGameContent();
    if (cached?.length) {
      appLogger.error(
        '[games.content] Firestore failed; using cached content',
        error,
      );
      return cached;
    }
    reportError(error, 'games.content');
    throw error;
  }
}

export async function fetchOneGameContent(
  gameId: GameId,
): Promise<GameContent | null> {
  const cached = await getCachedGameContent();
  const cachedGame = cached?.find(item => item.definition.id === gameId);
  try {
    const gameSnapshot = await getDoc(
      doc(getFirestore(), GAMES_COLLECTION, gameId),
    );
    if (!gameSnapshot.exists()) {
      return cachedGame ?? null;
    }
    const all = await fetchGameContent();
    return (
      all.find(item => item.definition.id === gameId) ?? cachedGame ?? null
    );
  } catch (error) {
    if (cachedGame) {
      appLogger.error(
        '[games.content] Firestore game failed; using cache',
        error,
        {
          gameId,
        },
      );
      return cachedGame;
    }
    throw error;
  }
}
