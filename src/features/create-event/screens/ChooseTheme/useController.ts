import {
  useNavigation,
  type NavigationProp,
} from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { useLanguage } from '../../../../app/localization';
import type { CreateEventStackParamList } from '../../../../navigation/types';
import { formatDateLong, formatTime } from '../../../../utils/format';
import { themeSource, type EventThemeKey } from '../../../events';
import { useCreateEventContext } from '../../CreateEventProvider';
import { resolveDraftTheme } from '../../core/draftEntity';
import { pickThemeImage } from '../../core/pickThemeImage';
import { wizardSteps } from '../steps';

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

  const steps = useMemo(() => wizardSteps(t), [t]);

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
    (themeKey: EventThemeKey) =>
      update({
        themeType: 'preset',
        themeKey,
        themeExplicit: true,
        customThemeUri: null,
      }),
    [update],
  );

  const pickCustomTheme = useCallback(async () => {
    try {
      const uri = await pickThemeImage();
      if (!uri) {
        return;
      }
      update({
        themeType: 'custom',
        themeExplicit: true,
        customThemeUri: uri,
      });
    } catch {
      Alert.alert(t('create.customTheme'), t('create.publishError'));
    }
  }, [t, update]);

  const selectedIsCustom = draft.themeType === 'custom';
  const selectedPreset = resolveDraftTheme(draft);

  const goBack = useCallback(() => navigation.goBack(), [navigation]);
  const goNext = useCallback(
    () => navigation.navigate('Preview'),
    [navigation],
  );

  return {
    t,
    draft,
    steps,
    themes,
    selected: selectedPreset,
    selectedIsCustom,
    dateLabel,
    locationLabel,
    setTheme,
    pickCustomTheme,
    goBack,
    goNext,
  };
}
