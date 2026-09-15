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
