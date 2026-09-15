import type { TFunction } from 'i18next';

import type { EventCardData } from '../../design-system/organisms/EventCard';
import type { StackAvatar } from '../../design-system/organisms/AvatarStack';
import {
  formatDateShort,
  formatTime,
  goingSummary,
  type SupportedLocale,
} from '../../utils/format';
import { goingAttendees, type LammaEvent } from './core/entity';
import { eventCover } from './core/media';

type PresenterContext = {
  locale: SupportedLocale;
  t: TFunction;
};

const MULTI_DAY_THRESHOLD_MS = 20 * 60 * 60 * 1000;

function isMultiDay(event: LammaEvent): boolean {
  return event.endAt - event.startAt > MULTI_DAY_THRESHOLD_MS;
}

function dateAndTime(
  event: LammaEvent,
  locale: SupportedLocale,
): { dateLabel: string; timeLabel?: string } {
  if (!isMultiDay(event)) {
    return {
      dateLabel: formatDateShort(event.startAt, locale),
      timeLabel: formatTime(event.startAt, locale),
    };
  }
  return {
    dateLabel: `${formatDateShort(event.startAt, locale)} – ${formatDateShort(
      event.endAt,
      locale,
    )}`,
  };
}

function toStackAvatars(event: LammaEvent): StackAvatar[] {
  return goingAttendees(event)
    .slice(0, 6)
    .map(a => ({
      id: a.id,
      name: a.name,
      source: a.photoURL ? { uri: a.photoURL } : undefined,
    }));
}

function statusFor(
  event: LammaEvent,
  t: TFunction,
): EventCardData['status'] {
  if (event.isHosting) {
    return { label: t('home.hosting'), tone: 'primary', icon: 'crown' };
  }
  if (event.viewerRsvp === 'going') {
    return {
      label: t('event.going'),
      tone: 'success',
      icon: event.category === 'trip' ? 'airplane' : 'check',
    };
  }
  return undefined;
}

export function toFeaturedCard(
  event: LammaEvent,
  { locale, t }: PresenterContext,
): EventCardData {
  const { dateLabel, timeLabel } = dateAndTime(event, locale);
  return {
    id: event.id,
    title: event.title,
    coverImage: eventCover(event),
    dateLabel,
    timeLabel,
    locationLabel: `${event.venueName}, ${event.areaAddress.split(',')[0]}`,
    attendees: toStackAvatars(event),
    attendeeCount: event.goingCount,
    attendeeSummary: goingSummary(event.goingCount, locale),
    description: event.description,
    rsvpLabel: event.viewerRsvp === 'going' ? t('home.youreGoing') : undefined,
  };
}

export function toCompactCard(
  event: LammaEvent,
  { locale, t }: PresenterContext,
): EventCardData {
  const { dateLabel, timeLabel } = dateAndTime(event, locale);
  return {
    id: event.id,
    title: event.title,
    coverImage: eventCover(event),
    dateLabel,
    timeLabel,
    locationLabel: `${event.venueName}, ${event.areaAddress.split(',')[0]}`,
    attendees: toStackAvatars(event),
    attendeeCount: event.goingCount,
    attendeeSummary: goingSummary(event.goingCount, locale),
    status: statusFor(event, t),
  };
}
