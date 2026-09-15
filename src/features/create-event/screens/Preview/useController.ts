import {
  useNavigation,
  type NavigationProp,
} from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useLanguage } from '../../../../app/localization';
import type {
  AppStackParamList,
  CreateEventStackParamList,
} from '../../../../navigation/types';
import { formatDateTime, formatTime } from '../../../../utils/format';
import { themeSource, type EventVisibility } from '../../../events';
import { useCreateEventContext } from '../../CreateEventProvider';
import { resolveDraftTheme } from '../../core/draftEntity';
import { wizardSteps } from '../steps';

export function usePreviewController() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const navigation =
    useNavigation<NavigationProp<CreateEventStackParamList>>();
  const {
    draft,
    update,
    publish,
    publishable,
    isPublishing,
    publishError,
    reset,
  } =
    useCreateEventContext();

  const steps = useMemo(() => wizardSteps(t), [t]);

  // Product copy: "Fri, 18 Dec · 8:00 PM".
  const dateLabel = draft.startAt
    ? formatDateTime(draft.startAt, language)
    : t('create.dateTBD');
  const timeLabel =
    draft.startAt && draft.endAt
      ? `${formatTime(draft.startAt, language)} — ${formatTime(
          draft.endAt,
          language,
        )}`
      : '';
  const locationLabel = draft.venueName
    ? `${draft.venueName}, ${draft.areaAddress}`
    : t('create.locationTBD');

  const setVisibility = useCallback(
    (visibility: EventVisibility) => update({ visibility }),
    [update],
  );

  const goBack = useCallback(() => navigation.goBack(), [navigation]);

  const onPublish = useCallback(async () => {
    const event = await publish();
    if (!event) {
      return;
    }
    reset();
    const parent = navigation.getParent() as unknown as
      | NavigationProp<AppStackParamList>
      | undefined;
    parent?.reset({
      index: 1,
      routes: [
        { name: 'MainTabs' },
        { name: 'EventDetails', params: { eventId: event.id } },
      ],
    });
  }, [navigation, publish, reset]);

  return {
    t,
    draft,
    steps,
    heroImage: themeSource(resolveDraftTheme(draft)),
    dateLabel,
    timeLabel,
    locationLabel,
    publishable,
    isPublishing,
    publishError,
    setVisibility,
    goBack,
    onPublish,
  };
}
