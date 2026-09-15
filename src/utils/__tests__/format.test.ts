import {
  formatDateLong,
  formatDateShort,
  formatTime,
  goingSummary,
  overflowLabel,
} from '../format';

// 2026-12-18 is a Friday at 20:00 local time.
const friday = new Date(2026, 11, 18, 20, 0, 0);
const morning = new Date(2026, 0, 5, 9, 5, 0);

describe('format helpers', () => {
  it('formats short dates in English', () => {
    expect(formatDateShort(friday, 'en')).toBe('Fri, 18 Dec');
  });

  it('formats short dates in Arabic', () => {
    expect(formatDateShort(friday, 'ar')).toBe('الجمعة, 18 ديسمبر');
  });

  it('formats long dates', () => {
    expect(formatDateLong(friday, 'en')).toBe('Friday, 18 December 2026');
  });

  it('formats 12-hour times with padded minutes', () => {
    expect(formatTime(friday, 'en')).toBe('8:00 PM');
    expect(formatTime(morning, 'en')).toBe('9:05 AM');
  });

  it('formats midnight as 12 AM', () => {
    expect(formatTime(new Date(2026, 0, 1, 0, 0, 0), 'en')).toBe('12:00 AM');
  });

  it('formats Arabic time period markers', () => {
    expect(formatTime(friday, 'ar')).toBe('8:00 م');
    expect(formatTime(morning, 'ar')).toBe('9:05 ص');
  });

  it('computes overflow labels', () => {
    expect(overflowLabel(186, 4)).toBe('+182');
    expect(overflowLabel(3, 4)).toBeNull();
    expect(overflowLabel(4, 4)).toBeNull();
  });

  it('builds going summaries', () => {
    expect(goingSummary(186, 'en')).toBe('186 going');
    expect(goingSummary(186, 'ar')).toBe('186 ذاهب');
  });
});
