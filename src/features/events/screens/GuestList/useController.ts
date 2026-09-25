import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useLanguage } from '../../../../app/localization';
import { formatDateShort } from '../../../../utils/format';
import type { RSVPStatus } from '../../core/entity';
import { useEvent } from '../../core/hooks';
import { eventCover } from '../../core/media';
import { countGroupPeople, groupGuests } from '../../guestPresenter';

type GuestTab = Extract<RSVPStatus, 'going' | 'maybe' | 'declined'>;

export function useGuestListController(eventId: string) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const navigation = useNavigation();
  const query = useEvent(eventId);
  const [tab, setTab] = useState<GuestTab>('going');

  const event = query.data ?? null;
  const groups = useMemo(
    () => (event ? groupGuests(event, tab) : null),
    [event, tab],
  );

  const tabCount = groups ? countGroupPeople(groups) : 0;
  const isEmpty = Boolean(groups) && tabCount === 0;
  const copy = {
    going: {
      summary: t('guests.summaryGoing', { count: tabCount }),
      emptyTitle: t('guests.emptyGoingTitle'),
      emptyMessage: t('guests.emptyGoingMessage'),
    },
    maybe: {
      summary: t('guests.summaryMaybe', { count: tabCount }),
      emptyTitle: t('guests.emptyMaybeTitle'),
      emptyMessage: t('guests.emptyMaybeMessage'),
    },
    declined: {
      summary: t('guests.summaryDeclined', { count: tabCount }),
      emptyTitle: t('guests.emptyDeclinedTitle'),
      emptyMessage: t('guests.emptyDeclinedMessage'),
    },
  }[tab];
  const summaryLabel = copy.summary;
  const emptyTitle = copy.emptyTitle;
  const emptyMessage = copy.emptyMessage;

  const tabs = useMemo(
    () => [
      { key: 'going' as const, label: t('event.going') },
      { key: 'maybe' as const, label: t('event.maybe') },
      { key: 'declined' as const, label: t('event.declined') },
    ],
    [t],
  );

  const dateLabel = event ? formatDateShort(event.startAt, language) : '';
  const coverUrl = event?.coverImageUrl ?? null;
  const coverKey = event?.coverKey;
  const themeKey = event?.themeKey;
  const cover = useMemo(
    () =>
      coverKey && themeKey
        ? eventCover({ coverImageUrl: coverUrl, coverKey, themeKey })
        : undefined,
    [coverUrl, coverKey, themeKey],
  );

  const goBack = useCallback(() => navigation.goBack(), [navigation]);

  return {
    t,
    event,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    tab,
    setTab,
    tabs,
    groups,
    tabCount,
    isEmpty,
    summaryLabel,
    emptyTitle,
    emptyMessage,
    dateLabel,
    cover,
    goBack,
  };
}
