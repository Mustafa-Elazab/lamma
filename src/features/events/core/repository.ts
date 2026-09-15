import type {
  EventCategory,
  EventListFilter,
  LammaEvent,
  RSVPStatus,
} from './entity';

export type EventPage = {
  events: LammaEvent[];
  nextCursor: string | null;
};

export type HomeFeed = {
  featured: LammaEvent | null;
  page: EventPage;
};

export type CreateEventInput = {
  title: string;
  description: string;
  category: EventCategory;
  themeKey: LammaEvent['themeKey'];
  startAt: number;
  endAt: number;
  timezone: string;
  venueName: string;
  areaAddress: string;
  visibility: LammaEvent['visibility'];
};

export interface EventRepository {
  getHomeFeed(params: {
    filter: EventListFilter;
    cursor?: string | null;
    limit?: number;
  }): Promise<HomeFeed>;
  getEvent(id: string): Promise<LammaEvent | null>;
  listPublicEvents(params: {
    query?: string;
    category?: EventCategory | null;
    cursor?: string | null;
    limit?: number;
  }): Promise<EventPage>;
  setRsvp(eventId: string, status: RSVPStatus): Promise<LammaEvent>;
  createEvent(input: CreateEventInput): Promise<LammaEvent>;
}
