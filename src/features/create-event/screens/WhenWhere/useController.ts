import {
  useNavigation,
  type NavigationProp,
} from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useLanguage } from '../../../../app/localization';
import type { CreateEventStackParamList } from '../../../../navigation/types';
import { formatDateShort, formatTime } from '../../../../utils/format';
import { useCreateEventContext } from '../../CreateEventProvider';
import type { EventLocation } from '../../components/LocationPickerModal';
import {
  combineDateAndMinutes,
  MS_PER_DAY,
  minutesOfDay,
  startOfDay,
  timezoneLabel,
  TIMEZONE_OPTIONS,
} from '../../components/dateTime';
import { wizardSteps } from '../steps';

export type ActivePicker =
  | 'date'
  | 'start'
  | 'end'
  | 'timezone'
  | 'location'
  | null;

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

  const dateLabel = draft.startAt
    ? formatDateShort(draft.startAt, language)
    : undefined;
  const startLabel = draft.startAt
    ? formatTime(draft.startAt, language)
    : undefined;
  const endLabel = draft.endAt
    ? formatTime(draft.endAt, language)
    : undefined;
  const tzLabel = timezoneLabel(draft.timezone);

  const dateValue = useMemo(
    () => (draft.startAt ? new Date(draft.startAt) : new Date()),
    [draft.startAt],
  );
  const endValue = useMemo(
    () => (draft.endAt ? new Date(draft.endAt) : new Date()),
    [draft.endAt],
  );

  const onPickDate = useCallback(
    (picked: Date) => {
      const dayTs = startOfDay(picked.getTime());
      const startMinutes = draft.startAt
        ? minutesOfDay(draft.startAt)
        : DEFAULT_START_MINUTES;
      const endMinutes = draft.endAt
        ? minutesOfDay(draft.endAt)
        : DEFAULT_END_MINUTES;
      const startAt = combineDateAndMinutes(dayTs, startMinutes);
      let endAt = combineDateAndMinutes(dayTs, endMinutes);
      if (endAt <= startAt) {
        endAt += MS_PER_DAY;
      }
      update({ startAt, endAt });
    },
    [draft.endAt, draft.startAt, update],
  );

  const onPickStart = useCallback(
    (picked: Date) => {
      const minutes = picked.getHours() * 60 + picked.getMinutes();
      const dayTs = draft.startAt
        ? startOfDay(draft.startAt)
        : startOfDay(Date.now());
      const startAt = combineDateAndMinutes(dayTs, minutes);
      let endAt =
        draft.endAt ?? combineDateAndMinutes(dayTs, DEFAULT_END_MINUTES);
      if (endAt <= startAt) {
        endAt = startAt + 3 * 60 * 60 * 1000;
      }
      update({ startAt, endAt });
    },
    [draft.endAt, draft.startAt, update],
  );

  const onPickEnd = useCallback(
    (picked: Date) => {
      const minutes = picked.getHours() * 60 + picked.getMinutes();
      const dayTs = draft.startAt
        ? startOfDay(draft.startAt)
        : startOfDay(Date.now());
      let endAt = combineDateAndMinutes(dayTs, minutes);
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

  const onConfirmLocation = useCallback(
    (location: EventLocation) => {
      update({
        venueName: draft.venueName.trim() || location.label,
        areaAddress: location.address,
        latitude: location.lat,
        longitude: location.lng,
      });
    },
    [draft.venueName, update],
  );

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
    timezoneOptions: TIMEZONE_OPTIONS,
    dateLabel,
    startLabel,
    endLabel,
    tzLabel,
    dateValue,
    startValue: dateValue,
    endValue,
    hasCoordinates: draft.latitude !== null && draft.longitude !== null,
    onPickDate,
    onPickStart,
    onPickEnd,
    onSelectTimezone,
    onConfirmLocation,
    setVenue,
    setAddress,
    goBack,
    goNext,
  };
}
