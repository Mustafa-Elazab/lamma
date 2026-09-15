import type { EventDraft } from './draftEntity';

export interface DraftRepository {
  list(): Promise<EventDraft[]>;
  get(id: string): Promise<EventDraft | null>;
  save(draft: EventDraft): Promise<void>;
  remove(id: string): Promise<void>;
}
