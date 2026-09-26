/**
 * Pure, locale-aware formatting helpers shared across features. Kept free of
 * React so they are trivially unit-testable.
 */

export type SupportedLocale = 'en' | 'ar';

const WEEKDAYS: Record<SupportedLocale, string[]> = {
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  ar: ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
};

const FULL_WEEKDAYS: Record<SupportedLocale, string[]> = {
  en: [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ],
  ar: ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
};

const FULL_MONTHS: Record<SupportedLocale, string[]> = {
  en: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  ar: [
    'يناير',
    'فبراير',
    'مارس',
    'أبريل',
    'مايو',
    'يونيو',
    'يوليو',
    'أغسطس',
    'سبتمبر',
    'أكتوبر',
    'نوفمبر',
    'ديسمبر',
  ],
};

const MONTHS: Record<SupportedLocale, string[]> = {
  en: [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ],
  ar: [
    'يناير',
    'فبراير',
    'مارس',
    'أبريل',
    'مايو',
    'يونيو',
    'يوليو',
    'أغسطس',
    'سبتمبر',
    'أكتوبر',
    'نوفمبر',
    'ديسمبر',
  ],
};

/** Arabic uses its own comma (U+060C) between weekday and date. */
function listComma(locale: SupportedLocale): string {
  return locale === 'ar' ? '\u060C' : ',';
}

function toDate(input: Date | number | string): Date {
  return input instanceof Date ? input : new Date(input);
}

/** "Fri, 18 Dec" */
export function formatDateShort(
  input: Date | number | string,
  locale: SupportedLocale = 'en',
): string {
  const date = toDate(input);
  const weekday = WEEKDAYS[locale][date.getDay()];
  const month = MONTHS[locale][date.getMonth()];
  return `${weekday}${listComma(locale)} ${date.getDate()} ${month}`;
}

/** "Friday, 18 December 2026" style long date. */
export function formatDateLong(
  input: Date | number | string,
  locale: SupportedLocale = 'en',
): string {
  const date = toDate(input);
  const weekday = FULL_WEEKDAYS[locale][date.getDay()];
  const month = FULL_MONTHS[locale][date.getMonth()];
  return `${weekday}${listComma(locale)} ${date.getDate()} ${month} ${date.getFullYear()}`;
}

/** "8:00 PM" (12-hour). */
export function formatTime(
  input: Date | number | string,
  locale: SupportedLocale = 'en',
): string {
  const date = toDate(input);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  const mm = minutes.toString().padStart(2, '0');
  if (locale === 'ar') {
    return `${displayHour}:${mm} ${period === 'PM' ? 'م' : 'ص'}`;
  }
  return `${displayHour}:${mm} ${period}`;
}

/** "Fri, 18 Dec · 8:00 PM" — the product's combined date + time copy. */
export function formatDateTime(
  input: Date | number | string,
  locale: SupportedLocale = 'en',
): string {
  return `${formatDateShort(input, locale)} · ${formatTime(input, locale)}`;
}

/**
 * Compresses a guest count for avatar stacks: values above `max` become
 * "+N" overflow labels.
 */
export function overflowLabel(total: number, shown: number): string | null {
  const remaining = total - shown;
  return remaining > 0 ? `+${remaining}` : null;
}

/** "186 going" / "١٨٦ ذاهب" summary. */
export function goingSummary(
  count: number,
  locale: SupportedLocale = 'en',
): string {
  if (locale === 'ar') {
    return `${count} ذاهب`;
  }
  return `${count} going`;
}
