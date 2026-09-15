import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useLanguage } from '../../../../app/localization';
import { formatDateShort } from '../../../../utils/format';
import type { RSVPStatus } from '../../core/entity';
import { useEvent } from '../../core/hooks';
import { coverSource } from '../../core/media';
import { groupGuests } from '../../guestPresenter';

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

  const tabs = useMemo(
    () => [
      { key: 'going' as const, label: t('event.going') },
      { key: 'maybe' as const, label: t('event.maybe') },
      { key: 'declined' as const, label: t('event.declined') },
    ],
    [t],
  );

  const dateLabel = event ? formatDateShort(event.startAt, language) : '';
  const cover = event ? coverSource(event.coverKey) : undefined;

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
    dateLabel,
    cover,
    goBack,
  };
}
