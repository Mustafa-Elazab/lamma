import type { QuarterMilePack } from '../../core/types';
import packs from './packs.json';

/**
 * Quarter Mile categories. Each item has a hidden "power" score (0–100);
 * the best total after the draft wins. Shared with scripts/quarter-mile-bank.js
 * so Firestore and the bundled fallback always match.
 */
export const QUARTER_MILE_PACKS: QuarterMilePack[] = packs;
