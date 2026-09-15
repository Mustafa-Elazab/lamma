import {
  useNavigation,
  type NavigationProp,
} from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useLanguage } from '../../../../app/localization';
import type { CreateEventStackParamList } from '../../../../navigation/types';
import { formatDateLong, formatTime } from '../../../../utils/format';
import { useCreateEventContext } from '../../CreateEventProvider';
import {
  combineDateAndMinutes,
  generateDateOptions,
  generateTimeOptions,
  MS_PER_DAY,
  minutesOfDay,
  startOfDay,
  timezoneLabel,
  TIMEZONE_OPTIONS,
} from '../../components/dateTime';
import { wizardSteps } from '../steps';

export type ActivePicker = 'date' | 'start' | 'end' | 'timezone' | null;

const DEFAULT_START_MINUTES = 20 * 60;
const DEFAULT_END_MINUTES = 23 * 60;

export function useWhenWhereController() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const navigation =
    useNavigation<NavigationProp<CreateEventStackParamList>>();
  const { draft, update, whenWhere } = useCreateEventContext();
  const [picker, setPicker] = useState<ActivePicker>(null);

  const steps = useMemo(() => wizardSteps(t), [t]);
  const dateOptions = useMemo(
    () => generateDateOptions(language),
    [language],
  );
  const timeOptions = useMemo(
    () => generateTimeOptions(language),
    [language],
  );

  const dateLabel = draft.startAt
    ? formatDateLong(draft.startAt, language)
    : undefined;
  const startLabel = draft.startAt
    ? formatTime(draft.startAt, language)
    : undefined;
  const endLabel = draft.endAt
    ? formatTime(draft.endAt, language)
    : undefined;
  const tzLabel = timezoneLabel(draft.timezone);

  const onSelectDate = useCallback(
    (value: string) => {
      const dateTs = Number(value);
      const startMinutes = draft.startAt
        ? minutesOfDay(draft.startAt)
        : DEFAULT_START_MINUTES;
      const endMinutes = draft.endAt
        ? minutesOfDay(draft.endAt)
        : DEFAULT_END_MINUTES;
      const startAt = combineDateAndMinutes(dateTs, startMinutes);
      let endAt = combineDateAndMinutes(dateTs, endMinutes);
      if (endAt <= startAt) {
        endAt += MS_PER_DAY;
      }
      update({ startAt, endAt });
    },
    [draft.endAt, draft.startAt, update],
  );

  const onSelectStart = useCallback(
    (value: string) => {
      const minutes = Number(value);
      const dateTs = draft.startAt ? startOfDay(draft.startAt) : startOfDay(Date.now());
      const startAt = combineDateAndMinutes(dateTs, minutes);
      let endAt = draft.endAt ?? combineDateAndMinutes(dateTs, DEFAULT_END_MINUTES);
      if (endAt <= startAt) {
        endAt = startAt + 3 * 60 * 60 * 1000;
      }
      update({ startAt, endAt });
    },
    [draft.endAt, draft.startAt, update],
  );

  const onSelectEnd = useCallback(
    (value: string) => {
      const minutes = Number(value);
      const dateTs = draft.startAt ? startOfDay(draft.startAt) : startOfDay(Date.now());
      let endAt = combineDateAndMinutes(dateTs, minutes);
      if (draft.startAt && endAt <= draft.startAt) {
        endAt += MS_PER_DAY;
      }
      update({ endAt });
    },
    [draft.startAt, update],
  );

  const onSelectTimezone = useCallback(
    (value: string) => update({ timezone: value }),
    [update],
  );

  const setVenue = useCallback(
    (venueName: string) => update({ venueName }),
    [update],
  );
  const setAddress = useCallback(
    (areaAddress: string) => update({ areaAddress }),
    [update],
  );

  const useCurrentLocation = useCallback(() => {
    update({
      venueName: draft.venueName || t('create.useCurrentLocation'),
      areaAddress: draft.areaAddress || 'Cairo, Egypt',
    });
  }, [draft.areaAddress, draft.venueName, t, update]);

  const goBack = useCallback(() => navigation.goBack(), [navigation]);
  const goNext = useCallback(() => {
    if (whenWhere.valid) {
      navigation.navigate('ChooseTheme');
    }
  }, [navigation, whenWhere.valid]);

  return {
    t,
    draft,
    steps,
    whenWhere,
    picker,
    setPicker,
    dateOptions,
    timeOptions,
    timezoneOptions: TIMEZONE_OPTIONS,
    dateLabel,
    startLabel,
    endLabel,
    tzLabel,
    onSelectDate,
    onSelectStart,
    onSelectEnd,
    onSelectTimezone,
    setVenue,
    setAddress,
    useCurrentLocation,
    goBack,
    goNext,
  };
}
