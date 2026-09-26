/**
 * Unicode bidi helpers for mixing Arabic and Latin text in one line.
 * Only plain control characters, so they work on Hermes and in any <Text>.
 */
export const LRM = '\u200E';
export const RLM = '\u200F';
const LRI = '\u2066';
const FSI = '\u2068';
const PDI = '\u2069';

/** Always renders left-to-right, e.g. "$120k" inside Arabic text (never "120k$"). */
export function ltrIsolate(text: string): string {
  return `${LRI}${text}${PDI}`;
}

/** Isolates user text (names) so its direction can't reorder its neighbours. */
export function autoIsolate(text: string): string {
  return `${FSI}${text}${PDI}`;
}

/**
 * Isolates every string value of i18n interpolation params, e.g. names in
 * "{{name}} فاز", so a Latin name can't flip the sentence to LTR.
 * Numbers are left alone (they already follow the surrounding text).
 */
export function isolateValues<T extends Record<string, unknown>>(values: T): T {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(values)) {
    out[key] = typeof value === 'string' && value ? autoIsolate(value) : value;
  }
  return out as T;
}

/**
 * Mark forcing the paragraph direction of the UI language, so a line that
 * starts with an Arabic name still lays out LTR in the English UI and vice versa.
 */
export function directionMark(language: string): string {
  return language === 'ar' ? RLM : LRM;
}

/** "name: value" with the name isolated and the value kept LTR. */
export function labelValueLine(
  label: string,
  value: string,
  language: string,
): string {
  return `${directionMark(language)}${autoIsolate(label)}: ${ltrIsolate(value)}`;
}
