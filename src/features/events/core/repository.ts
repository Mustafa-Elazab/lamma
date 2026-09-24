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
  venueName: string;
  areaAddress: string;
  latitude?: number | null;
  longitude?: number | null;
  visibility: LammaEvent['visibility'];
  /** Local file:// URI set when user picks a custom theme photo. The repository
   * is responsible for uploading this to remote storage before writing the event,
   * then replacing it with the download URL as coverImageUrl. */
  customThemeUri?: string | null;
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
