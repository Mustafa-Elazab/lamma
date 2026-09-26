import {
  letterSpacingFor,
  logicalScrollOffset,
  needsDirectionRestart,
  shouldMirrorIcon,
} from '../direction';

describe('shouldMirrorIcon', () => {
  it('mirrors directional glyphs only in RTL', () => {
    expect(shouldMirrorIcon({ name: 'back', isRTL: true })).toBe(true);
    expect(shouldMirrorIcon({ name: 'back', isRTL: false })).toBe(false);
    expect(shouldMirrorIcon({ name: 'navigation', isRTL: true })).toBe(true);
    expect(shouldMirrorIcon({ name: 'logout', isRTL: true })).toBe(true);
  });

  it('never mirrors symmetric glyphs', () => {
    expect(shouldMirrorIcon({ name: 'search', isRTL: true })).toBe(false);
    expect(shouldMirrorIcon({ name: 'check', isRTL: false })).toBe(false);
  });

  it('points a forward chevron right in LTR and left in RTL', () => {
    // The back glyph points left, so "forward" flips it in LTR only.
    expect(shouldMirrorIcon({ name: 'back', isRTL: false, forward: true })).toBe(
      true,
    );
    expect(shouldMirrorIcon({ name: 'back', isRTL: true, forward: true })).toBe(
      false,
    );
  });

  it('lets callers opt out or in explicitly', () => {
    expect(
      shouldMirrorIcon({ name: 'back', isRTL: true, rtlMirror: false }),
    ).toBe(false);
    expect(
      shouldMirrorIcon({ name: 'share', isRTL: true, rtlMirror: true }),
    ).toBe(true);
  });
});

describe('logicalScrollOffset', () => {
  const metrics = (x: number) => ({
    contentOffset: { x },
    contentSize: { width: 1080 },
    layoutMeasurement: { width: 360 },
  });

  it('returns the raw offset in LTR', () => {
    expect(logicalScrollOffset(metrics(0), false)).toBe(0);
    expect(logicalScrollOffset(metrics(360), false)).toBe(360);
  });

  it('measures from the right edge in RTL', () => {
    // First page sits at the far right: physical x = 720.
    expect(logicalScrollOffset(metrics(720), true)).toBe(0);
    expect(logicalScrollOffset(metrics(360), true)).toBe(360);
    expect(logicalScrollOffset(metrics(0), true)).toBe(720);
  });

  it('never goes negative on overscroll', () => {
    expect(logicalScrollOffset(metrics(800), true)).toBe(0);
  });
});

describe('needsDirectionRestart', () => {
  it('restarts only when language and native direction disagree', () => {
    expect(needsDirectionRestart(true, false)).toBe(true);
    expect(needsDirectionRestart(false, true)).toBe(true);
    expect(needsDirectionRestart(true, true)).toBe(false);
    expect(needsDirectionRestart(false, false)).toBe(false);
  });
});

describe('letterSpacingFor', () => {
  it('keeps tracking for Latin and drops it for cursive Arabic', () => {
    expect(letterSpacingFor(2, false)).toBe(2);
    expect(letterSpacingFor(2, true)).toBe(0);
  });
});
