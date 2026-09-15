import type { TFunction } from 'i18next';

import { buildSeedEvents } from '../testFixtures';
import { toCompactCard, toFeaturedCard } from '../presenters';

const t = ((key: string) => key) as unknown as TFunction;

describe('event presenters', () => {
  const events = buildSeedEvents();
  const wedding = events.find(e => e.id === 'evt_wedding_mohamed_sara')!;
  const birthday = events.find(e => e.id === 'evt_birthday_mostafa')!;
  const trip = events.find(e => e.id === 'evt_trip_sinai')!;

  it('builds a featured card with going summary and rsvp label', () => {
    const card = toFeaturedCard(wedding, { locale: 'en', t });
    expect(card.title).toBe('Mohamed & Sara Wedding');
    expect(card.attendeeSummary).toBe('186 going');
    expect(card.rsvpLabel).toBe('home.youreGoing');
    expect(card.dateLabel).toContain('18 Dec');
    expect(card.timeLabel).toBe('8:00 PM');
  });

  it('marks hosted events with a hosting status', () => {
    const card = toCompactCard(birthday, { locale: 'en', t });
    expect(card.status?.icon).toBe('crown');
    expect(card.status?.label).toBe('home.hosting');
  });

  it('shows a date range and airplane status for multi-day trips', () => {
    const card = toCompactCard(trip, { locale: 'en', t });
    expect(card.timeLabel).toBeUndefined();
    expect(card.dateLabel).toContain('–');
    expect(card.status?.icon).toBe('airplane');
  });
});
