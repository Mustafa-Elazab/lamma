import {
  useNavigation,
  type NavigationProp,
} from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useLanguage } from '../../../../app/localization';
import type { CreateEventStackParamList } from '../../../../navigation/types';
import { formatDateLong, formatTime } from '../../../../utils/format';
import { themeSource, type EventThemeKey } from '../../../events';
import { useCreateEventContext } from '../../CreateEventProvider';
import { resolveDraftTheme } from '../../core/draftEntity';

const THEME_KEYS: EventThemeKey[] = [
  'wedding',
  'birthday',
  'dinner',
  'travel',
  'generic',
];

export function useChooseThemeController() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const navigation =
    useNavigation<NavigationProp<CreateEventStackParamList>>();
  const { draft, update } = useCreateEventContext();

  const selected = resolveDraftTheme(draft);

  const themes = useMemo(
    () =>
      THEME_KEYS.map(key => ({
        key,
        label: t(`themeNames.${key}`),
        image: themeSource(key),
      })),
    [t],
  );

  const dateLabel = draft.startAt
    ? `${formatDateLong(draft.startAt, language)}  ·  ${formatTime(
        draft.startAt,
        language,
      )}`
    : undefined;
  const locationLabel = draft.venueName
    ? `${draft.venueName}, ${draft.areaAddress.split(',')[0]}`
    : undefined;

  const setTheme = useCallback(
    (themeKey: EventThemeKey) => update({ themeKey }),
    [update],
  );

  const goBack = useCallback(() => navigation.goBack(), [navigation]);
  const goNext = useCallback(
    () => navigation.navigate('Preview'),
    [navigation],
  );

  return {
    t,
    draft,
    themes,
    selected,
    dateLabel,
    locationLabel,
    heroImage: themeSource(selected),
    setTheme,
    goBack,
    goNext,
  };
}
