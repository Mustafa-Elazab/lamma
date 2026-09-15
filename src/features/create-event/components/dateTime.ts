import {
  formatDateLong,
  formatTime,
  type SupportedLocale,
} from '../../../utils/format';
import type { PickerOption } from './OptionPickerModal';

export const MS_PER_DAY = 24 * 60 * 60 * 1000;
export const MS_PER_MINUTE = 60 * 1000;

export function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function minutesOfDay(ts: number): number {
  const d = new Date(ts);
  return d.getHours() * 60 + d.getMinutes();
}

export function combineDateAndMinutes(dateTs: number, minutes: number): number {
  return startOfDay(dateTs) + minutes * MS_PER_MINUTE;
}

export function generateDateOptions(
  locale: SupportedLocale,
  count = 90,
): PickerOption[] {
  const today = startOfDay(Date.now());
  return Array.from({ length: count }, (_, i) => {
    const ts = today + i * MS_PER_DAY;
    return { label: formatDateLong(ts, locale), value: String(ts) };
  });
}

export function generateTimeOptions(
  locale: SupportedLocale,
  stepMinutes = 30,
): PickerOption[] {
  const options: PickerOption[] = [];
  for (let minutes = 0; minutes < 24 * 60; minutes += stepMinutes) {
    const ts = combineDateAndMinutes(startOfDay(Date.now()), minutes);
    options.push({ label: formatTime(ts, locale), value: String(minutes) });
  }
  return options;
}

export const TIMEZONE_OPTIONS: PickerOption[] = [
  { label: 'Eastern European Time (EET)', value: 'Africa/Cairo' },
  { label: 'Gulf Standard Time (GST)', value: 'Asia/Dubai' },
  { label: 'Arabia Standard Time (AST)', value: 'Asia/Riyadh' },
  { label: 'Central European Time (CET)', value: 'Europe/Paris' },
  { label: 'Greenwich Mean Time (GMT)', value: 'Etc/GMT' },
];

export function timezoneLabel(value: string): string {
  return (
    TIMEZONE_OPTIONS.find(tz => tz.value === value)?.label ?? value
  );
}
