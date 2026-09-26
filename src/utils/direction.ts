/**
 * Layout-direction helpers.
 *
 * Strategy: the app uses native RTL. `LanguageProvider` calls
 * `I18nManager.allowRTL/forceRTL` and restarts the app when the language
 * changes, so Yoga already mirrors `flexDirection: 'row'`, start/end,
 * margin/padding/left/right and horizontal ScrollViews by itself.
 *
 * Because of that, code must NOT flip things by hand as well:
 * - no `isRTL ? 'row-reverse' : 'row'`
 * - no `textAlign: isRTL ? 'right' : 'left'` (native RTL turns 'right' into
 *   the physical left edge, i.e. it flips twice)
 * Use `textAlign: 'left'` (Text) / `'start'` (TextInput) for the leading
 * edge. The only things native RTL does not mirror are transforms (icons
 * drawn with a direction) and raw horizontal scroll offsets; helpers below.
 */

/** Icons whose glyph points somewhere and must be mirrored in RTL. */
export const DIRECTIONAL_ICONS: ReadonlySet<string> = new Set([
  'back', // chevron pointing to the previous screen
  'navigation', // paper plane "continue / send" pointing forward
  'logout', // arrow leaving through the door
]);

export type IconMirrorOptions = {
  /** Glyph name, used to look up DIRECTIONAL_ICONS. */
  name: string;
  isRTL: boolean;
  /**
   * Use the `back` chevron as a forward arrow / list chevron: points right in
   * LTR and left in RTL.
   */
  forward?: boolean;
  /** Overrides DIRECTIONAL_ICONS for this glyph. */
  rtlMirror?: boolean;
};

/**
 * Whether an icon needs `scaleX: -1`. Glyphs are drawn for LTR, so a
 * directional glyph flips in RTL; a `forward` chevron is the `back` glyph
 * reversed, so it flips in LTR instead.
 */
export function shouldMirrorIcon({
  name,
  isRTL,
  forward = false,
  rtlMirror,
}: IconMirrorOptions): boolean {
  if (forward) {
    return !isRTL;
  }
  const directional = rtlMirror ?? DIRECTIONAL_ICONS.has(name);
  return directional && isRTL;
}

type ScrollMetrics = {
  contentOffset: { x: number };
  contentSize: { width: number };
  layoutMeasurement: { width: number };
};

/**
 * Horizontal scroll events report the physical offset from the left edge.
 * In RTL the first item sits at the right, so convert to a logical offset
 * measured from the start (same math FlatList uses internally).
 */
export function logicalScrollOffset(
  { contentOffset, contentSize, layoutMeasurement }: ScrollMetrics,
  isRTL: boolean,
): number {
  if (!isRTL) {
    return contentOffset.x;
  }
  return Math.max(
    0,
    contentSize.width - layoutMeasurement.width - contentOffset.x,
  );
}

/**
 * The native layout direction only changes after a restart. When the stored
 * language and the running direction disagree (first launch after a
 * reinstall, a restored backup, a forceRTL that did not stick), the UI would
 * render Arabic text in an LTR layout until the next cold start.
 */
export function needsDirectionRestart(
  languageIsRTL: boolean,
  nativeIsRTL: boolean,
): boolean {
  return languageIsRTL !== nativeIsRTL;
}
