import AsyncStorage from '@react-native-async-storage/async-storage';

import type { EventDraft } from './draftEntity';
import type { DraftRepository } from './draftRepository';

const STORAGE_KEY = 'lamma.drafts';

type DraftMap = Record<string, EventDraft>;

async function readAll(): Promise<DraftMap> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as DraftMap) : {};
}

async function writeAll(map: DraftMap): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export class LocalDraftRepository implements DraftRepository {
  async list(): Promise<EventDraft[]> {
    const map = await readAll();
    return Object.values(map).sort((a, b) => b.updatedAt - a.updatedAt);
  }

  async get(id: string): Promise<EventDraft | null> {
    const map = await readAll();
    return map[id] ?? null;
  }

  async save(draft: EventDraft): Promise<void> {
    const map = await readAll();
    map[draft.id] = { ...draft, updatedAt: Date.now() };
    await writeAll(map);
  }

  async remove(id: string): Promise<void> {
    const map = await readAll();
    delete map[id];
    await writeAll(map);
  }
}
