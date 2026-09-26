import { formatQuarterMileScore } from '../../features/games/quarter-mile/content/packs';
import {
  autoIsolate,
  directionMark,
  isolateValues,
  labelValueLine,
  ltrIsolate,
} from '../bidi';

describe('bidi helpers', () => {
  it('wraps prices in LRI…PDI so Arabic text shows "$120k"', () => {
    const price = ltrIsolate(formatQuarterMileScore(120, 'usd-k'));
    expect(price).toBe('\u2066$120k\u2069');
    expect(price.replace(/[\u2066-\u2069]/g, '')).toBe('$120k');
  });

  it('isolates names and forces the UI paragraph direction', () => {
    expect(autoIsolate('مصطفي')).toBe('\u2068مصطفي\u2069');
    expect(directionMark('en')).toBe('\u200E');
    expect(directionMark('ar')).toBe('\u200F');
    expect(labelValueLine('مصطفي', '$12k', 'en')).toBe(
      '\u200E\u2068مصطفي\u2069: \u2066$12k\u2069',
    );
  });

  it('isolates string interpolation values but keeps numbers', () => {
    expect(isolateValues({ name: 'Mostafa', count: 3, empty: '' })).toEqual({
      name: '\u2068Mostafa\u2069',
      count: 3,
      empty: '',
    });
  });
});
