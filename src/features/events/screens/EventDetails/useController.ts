import {
  useNavigation,
  type NavigationProp,
} from '@react-navigation/native';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { useLanguage } from '../../../../app/localization';
import type { AppStackParamList } from '../../../../navigation/types';
import {
  formatDateLong,
  formatTime,
  goingSummary,
} from '../../../../utils/format';
import { goingAttendees, type RSVPStatus } from '../../core/entity';
import { useEvent, useRsvpMutation } from '../../core/hooks';
import { themeSource } from '../../core/media';

export function useEventDetailsController(eventId: string) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const query = useEvent(eventId);
  const rsvp = useRsvpMutation();

  const event = query.data ?? null;

  const setRsvp = useCallback(
    (status: RSVPStatus) => {
      rsvp.mutate({ eventId, status });
    },
    [eventId, rsvp],
  );

  const goBack = useCallback(() => navigation.goBack(), [navigation]);
  const openGuests = useCallback(
    () => navigation.navigate('GuestList', { eventId }),
    [eventId, navigation],
  );
  const openShare = useCallback(
    () => navigation.navigate('ShareInvite', { eventId }),
    [eventId, navigation],
  );

  const heroImage = event ? themeSource(event.themeKey) : undefined;
  const dateLabel = event ? formatDateLong(event.startAt, language) : '';
  const timeRange = event
    ? `${formatTime(event.startAt, language)} — ${formatTime(
        event.endAt,
        language,
      )}`
    : '';
  const goingStack = event ? goingAttendees(event).slice(0, 7) : [];
  const goingLabel = event
    ? t('event.peopleGoing', { count: event.goingCount })
    : '';
  const attendeeSummary = event ? goingSummary(event.goingCount, language) : '';

  return {
    t,
    event,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    heroImage,
    dateLabel,
    timeRange,
    goingStack,
    goingLabel,
    attendeeSummary,
    setRsvp,
    goBack,
    openGuests,
    openShare,
  };
}
