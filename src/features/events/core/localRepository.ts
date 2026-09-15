import {
  CATEGORY_TO_COVER,
  type EventListFilter,
  type LammaEvent,
  type RSVPStatus,
} from './entity';
import type {
  CreateEventInput,
  EventPage,
  EventRepository,
  HomeFeed,
} from './repository';

/**
 * Local viewer identity used by the `__DEV__` in-memory repository (only active
 * when `env.firebaseEnabled` is false). Production uses the real Firebase uid.
 */
const LOCAL_VIEWER = { id: 'local_viewer', name: 'You' };

let store: LammaEvent[] | null = null;

function getStore(): LammaEvent[] {
  if (!store) {
    store = [];
  }
  return store;
}

function paginate(
  events: LammaEvent[],
  cursor: string | null | undefined,
  limit: number,
): EventPage {
  const offset = cursor ? Number(cursor) : 0;
  const slice = events.slice(offset, offset + limit);
  const nextOffset = offset + limit;
  return {
    events: slice,
    nextCursor: nextOffset < events.length ? String(nextOffset) : null,
  };
}

/**
 * `__DEV__`-only in-memory event repository. Starts empty (no seeded data) and
 * is only used when `env.firebaseEnabled` is false. Events the user creates in
 * a dev session persist in memory for the lifetime of the process.
 */
export class LocalEventRepository implements EventRepository {
  async getHomeFeed(params: {
    filter: EventListFilter;
    cursor?: string | null;
    limit?: number;
  }): Promise<HomeFeed> {
    const limit = params.limit ?? 5;
    const now = Date.now();
    const all = getStore();

    let filtered: LammaEvent[];
    if (params.filter === 'upcoming') {
      filtered = all
        .filter(e => e.endAt >= now)
        .sort((a, b) => a.startAt - b.startAt);
    } else if (params.filter === 'hosting') {
      filtered = all
        .filter(e => e.isHosting)
        .sort((a, b) => a.startAt - b.startAt);
    } else {
      filtered = all
        .filter(e => e.endAt < now)
        .sort((a, b) => b.startAt - a.startAt);
    }

    const isFirstPage = !params.cursor;
    const featured =
      isFirstPage && params.filter === 'upcoming'
        ? filtered.find(e => e.viewerRsvp === 'going') ?? filtered[0] ?? null
        : null;

    const listSource = featured
      ? filtered.filter(e => e.id !== featured.id)
      : filtered;

    return { featured, page: paginate(listSource, params.cursor, limit) };
  }

  async getEvent(id: string): Promise<LammaEvent | null> {
    return getStore().find(e => e.id === id) ?? null;
  }

  async listPublicEvents(params: {
    query?: string;
    category?: LammaEvent['category'] | null;
    cursor?: string | null;
    limit?: number;
  }): Promise<EventPage> {
    const limit = params.limit ?? 8;
    const query = params.query?.trim().toLowerCase() ?? '';
    const filtered = getStore()
      .filter(e => e.visibility === 'public')
      .filter(e => (params.category ? e.category === params.category : true))
      .filter(e => {
        if (!query) {
          return true;
        }
        return (
          e.title.toLowerCase().includes(query) ||
          e.venueName.toLowerCase().includes(query) ||
          e.areaAddress.toLowerCase().includes(query) ||
          e.hostName.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => a.startAt - b.startAt);
    return paginate(filtered, params.cursor, limit);
  }

  async setRsvp(eventId: string, status: RSVPStatus): Promise<LammaEvent> {
    const events = getStore();
    const index = events.findIndex(e => e.id === eventId);
    if (index === -1) {
      throw new Error(`Event ${eventId} not found`);
    }
    const event = events[index];
    const wasGoing = event.viewerRsvp === 'going';
    const isGoing = status === 'going';
    const goingCount =
      event.goingCount + (isGoing ? 1 : 0) - (wasGoing ? 1 : 0);
    const updated: LammaEvent = {
      ...event,
      viewerRsvp: status,
      goingCount: Math.max(0, goingCount),
    };
    events[index] = updated;
    return updated;
  }

  async createEvent(input: CreateEventInput): Promise<LammaEvent> {
    const events = getStore();
    const id = `evt_${Date.now().toString(36)}`;
    const event: LammaEvent = {
      id,
      title: input.title,
      description: input.description,
      category: input.category,
      coverKey: CATEGORY_TO_COVER[input.category],
      themeKey: input.themeKey,
      startAt: input.startAt,
      endAt: input.endAt,
      timezone: input.timezone,
      venueName: input.venueName,
      areaAddress: input.areaAddress,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      hostId: LOCAL_VIEWER.id,
      hostName: LOCAL_VIEWER.name,
      hostPhoto: null,
      attendees: [],
      attendeeCount: 1,
      goingCount: 1,
      viewerRsvp: 'going',
      isHosting: true,
      visibility: input.visibility,
      updates: [],
      createdAt: Date.now(),
    };
    events.unshift(event);
    return event;
  }
}

/** Test helper to reset the in-memory store. */
export function __resetEventStore(): void {
  store = null;
}

/** Test/dev helper to seed the in-memory store with fixtures. */
export function __seedEventStore(events: LammaEvent[]): void {
  store = [...events];
}
