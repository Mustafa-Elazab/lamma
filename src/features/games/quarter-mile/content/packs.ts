import type { QuarterMilePack } from '../../core/types';
// NOTE: the JSON file must NOT share this module's basename. Metro resolves
// extensions in the order js, jsx, json, ts, tsx, so a sibling `packs.json`
// shadowed `packs.ts` at runtime: every named import from './packs' was
// undefined on device (while Jest and tsc, which try .ts first, were fine).
import packs from './quarterMilePacks.json';

/**
 * Quarter Mile categories. Each item has a hidden score (a 0–100 power rating,
 * or an approximate price in $k for packs with unit "usd-k");
 * the best total after the draft wins. Shared with scripts/quarter-mile-bank.js
 * so Firestore and the bundled fallback always match.
 */
export const QUARTER_MILE_PACKS = packs as QuarterMilePack[];

/** Trims trailing zeros from a fixed-point string: "1.50" -> "1.5", "3.00" -> "3". */
function trimFixed(value: number, digits: number): string {
  const fixed = value.toFixed(digits);
  if (fixed.indexOf('.') === -1) {
    return fixed;
  }
  return fixed.replace(/0+$/, '').replace(/\.$/, '');
}

/**
 * Formats a score for display: a price for priced packs ("$57k", "$1.25M"),
 * a plain number otherwise. Never throws: undefined, null, NaN or non-numeric
 * input renders as "—". Uses only Hermes-safe APIs (no Intl / toLocaleString
 * options, replaceAll or Array#at).
 */
export function formatQuarterMileScore(
  score: number | string | null | undefined,
  unit?: QuarterMilePack['unit'] | null,
): string {
  const value = typeof score === 'string' ? Number(score) : score;
  if (typeof value !== 'number' || !isFinite(value)) {
    return '—';
  }
  if (unit !== 'usd-k') {
    return trimFixed(value, 2);
  }
  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(value);
  if (abs >= 1000) {
    return `${sign}$${trimFixed(abs / 1000, 2)}M`;
  }
  return `${sign}$${trimFixed(abs, 1)}k`;
}

/**
 * Looks up the display unit of the pack being played. Safe to call in the
 * lobby before a game starts (no pack id) or with a missing pack list.
 */
export function quarterMilePackUnit(
  packList: readonly QuarterMilePack[] | null | undefined,
  packId: string | null | undefined,
): QuarterMilePack['unit'] | undefined {
  if (!packId || !Array.isArray(packList)) {
    return undefined;
  }
  for (const pack of packList) {
    if (pack && pack.id === packId) {
      return pack.unit;
    }
  }
  return undefined;
}
