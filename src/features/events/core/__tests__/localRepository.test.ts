import { LocalEventRepository, __resetEventStore } from '../localRepository';

describe('LocalEventRepository', () => {
  beforeEach(() => {
    __resetEventStore();
  });

  it('returns a featured event and a list for the upcoming feed', async () => {
    const repo = new LocalEventRepository();
    const feed = await repo.getHomeFeed({ filter: 'upcoming' });
    expect(feed.featured).not.toBeNull();
    expect(feed.featured?.viewerRsvp).toBe('going');
    expect(feed.page.events.every(e => e.id !== feed.featured?.id)).toBe(true);
  });

  it('only returns hosted events for the hosting feed', async () => {
    const repo = new LocalEventRepository();
    const feed = await repo.getHomeFeed({ filter: 'hosting' });
    const all = [
      ...(feed.featured ? [feed.featured] : []),
      ...feed.page.events,
    ];
    expect(all.length).toBeGreaterThan(0);
    expect(all.every(e => e.isHosting)).toBe(true);
  });

  it('updates goingCount when RSVP changes', async () => {
    const repo = new LocalEventRepository();
    const before = await repo.getEvent('evt_wedding_mohamed_sara');
    const startCount = before?.goingCount ?? 0;
    const declined = await repo.setRsvp('evt_wedding_mohamed_sara', 'declined');
    expect(declined.goingCount).toBe(startCount - 1);
    const going = await repo.setRsvp('evt_wedding_mohamed_sara', 'going');
    expect(going.goingCount).toBe(startCount);
  });

  it('creates a hosted event at the top of the store', async () => {
    const repo = new LocalEventRepository();
    const created = await repo.createEvent({
      title: 'New Gathering',
      description: 'A test gathering',
      category: 'gathering',
      themeKey: 'generic',
      startAt: Date.now() + 86_400_000,
      endAt: Date.now() + 90_000_000,
      timezone: 'Africa/Cairo',
      venueName: 'My Place',
      areaAddress: 'Cairo',
      visibility: 'private',
    });
    expect(created.isHosting).toBe(true);
    expect(created.viewerRsvp).toBe('going');
    const fetched = await repo.getEvent(created.id);
    expect(fetched?.title).toBe('New Gathering');
  });

  it('filters public events by query in discover', async () => {
    const repo = new LocalEventRepository();
    const page = await repo.listPublicEvents({ query: 'sinai' });
    expect(page.events.length).toBe(1);
    expect(page.events[0].id).toBe('evt_trip_sinai');
  });

  it('excludes private events from discover', async () => {
    const repo = new LocalEventRepository();
    const page = await repo.listPublicEvents({});
    expect(page.events.every(e => e.visibility === 'public')).toBe(true);
  });
});
