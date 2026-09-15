import { initialsFrom } from '../Avatar';

describe('initialsFrom', () => {
  it('returns a placeholder when name is missing', () => {
    expect(initialsFrom()).toBe('?');
    expect(initialsFrom('')).toBe('?');
  });

  it('uses the first two words', () => {
    expect(initialsFrom('Mostafa Elazab')).toBe('ME');
    expect(initialsFrom('Sara Ahmed Ali')).toBe('SA');
  });

  it('handles a single word', () => {
    expect(initialsFrom('Mostafa')).toBe('M');
  });

  it('collapses extra whitespace', () => {
    expect(initialsFrom('  nour   ali ')).toBe('NA');
  });
});
