import {
  QUARTER_MILE_PACKS,
  formatQuarterMileScore,
  quarterMilePackUnit,
} from '../content/packs';

describe('formatQuarterMileScore', () => {
  it('formats car prices in $k and $M', () => {
    expect(formatQuarterMileScore(57, 'usd-k')).toBe('$57k');
    expect(formatQuarterMileScore(999, 'usd-k')).toBe('$999k');
    expect(formatQuarterMileScore(1000, 'usd-k')).toBe('$1M');
    expect(formatQuarterMileScore(1250, 'usd-k')).toBe('$1.25M');
    expect(formatQuarterMileScore(1100, 'usd-k')).toBe('$1.1M');
    expect(formatQuarterMileScore(3000, 'usd-k')).toBe('$3M');
    expect(formatQuarterMileScore(12345, 'usd-k')).toBe('$12.35M');
    expect(formatQuarterMileScore(0, 'usd-k')).toBe('$0k');
    expect(formatQuarterMileScore(57.5, 'usd-k')).toBe('$57.5k');
    expect(formatQuarterMileScore(-40, 'usd-k')).toBe('-$40k');
  });

  it('shows plain numbers for rating packs (football, UFC, boxing)', () => {
    expect(formatQuarterMileScore(80)).toBe('80');
    expect(formatQuarterMileScore(80, undefined)).toBe('80');
    expect(formatQuarterMileScore(80, null)).toBe('80');
    expect(formatQuarterMileScore(245)).toBe('245');
    expect(formatQuarterMileScore(0)).toBe('0');
  });

  it('never throws for bad input', () => {
    const bad: unknown[] = [undefined, null, NaN, Infinity, 'abc', {}, [], true];
    bad.forEach(value => {
      expect(() =>
        formatQuarterMileScore(value as number, 'usd-k'),
      ).not.toThrow();
      expect(() => formatQuarterMileScore(value as number)).not.toThrow();
      expect(formatQuarterMileScore(value as number, 'usd-k')).toBe('—');
    });
    // Numeric strings (e.g. from Firestore) are still formatted.
    expect(formatQuarterMileScore('57' as unknown as number, 'usd-k')).toBe(
      '$57k',
    );
    // A pack object passed by mistake as the unit falls back to plain numbers.
    expect(
      formatQuarterMileScore(57, QUARTER_MILE_PACKS[0] as unknown as 'usd-k'),
    ).toBe('57');
  });
});

describe('quarterMilePackUnit (lobby helper)', () => {
  it('returns undefined in the lobby before a game starts', () => {
    expect(quarterMilePackUnit(QUARTER_MILE_PACKS, undefined)).toBeUndefined();
    expect(quarterMilePackUnit(QUARTER_MILE_PACKS, null)).toBeUndefined();
    expect(quarterMilePackUnit(undefined, 'cars')).toBeUndefined();
    expect(quarterMilePackUnit([], 'cars')).toBeUndefined();
    // Lobby render path: no game yet -> plain formatting, no throw.
    expect(
      formatQuarterMileScore(
        undefined,
        quarterMilePackUnit(QUARTER_MILE_PACKS, undefined),
      ),
    ).toBe('—');
  });

  it('finds the unit of the pack being played', () => {
    expect(quarterMilePackUnit(QUARTER_MILE_PACKS, 'cars')).toBe('usd-k');
    expect(
      quarterMilePackUnit(QUARTER_MILE_PACKS, 'football-stars'),
    ).toBeUndefined();
    const cars = QUARTER_MILE_PACKS.find(pack => pack.id === 'cars');
    const car = cars?.items.find(item => item.score < 1000);
    expect(car).toBeDefined();
    expect(
      formatQuarterMileScore(
        car?.score,
        quarterMilePackUnit(QUARTER_MILE_PACKS, 'cars'),
      ),
    ).toMatch(/^\$\d+(\.\d)?k$/);
  });

  it('bundles every pack (football, UFC, boxing, cars)', () => {
    const ids = QUARTER_MILE_PACKS.map(pack => pack.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        'cars',
        'football-stars',
        'ufc-fighters',
        'boxing-legends',
      ]),
    );
  });
});
