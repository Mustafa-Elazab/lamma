import type { QuarterMilePack } from '../../core/types';
import packs from './packs.json';

/**
 * Quarter Mile categories. Each item has a hidden score (a 0–100 power rating,
 * or an approximate price in $k for packs with unit "usd-k");
 * the best total after the draft wins. Shared with scripts/quarter-mile-bank.js
 * so Firestore and the bundled fallback always match.
 */
export const QUARTER_MILE_PACKS = packs as QuarterMilePack[];

/** Formats a score for display: a price for priced packs, a plain number otherwise. */
export function formatQuarterMileScore(
  score: number,
  unit?: QuarterMilePack['unit'],
): string {
  if (unit !== 'usd-k') {
    return String(score);
  }
  if (score >= 1000) {
    const millions = score / 1000;
    return `$${Number.isInteger(millions) ? millions : millions.toFixed(2).replace(/0$/, '')}M`;
  }
  return `$${score}k`;
}
