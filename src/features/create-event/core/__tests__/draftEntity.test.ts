import {
  createEmptyDraft,
  draftToCreateInput,
  isDraftEmpty,
  resolveDraftTheme,
} from '../draftEntity';

describe('draft entity', () => {
  it('creates an empty draft', () => {
    const draft = createEmptyDraft('d1');
    expect(isDraftEmpty(draft)).toBe(true);
    expect(draft.themeKey).toBe('generic');
  });

  it('resolves theme from category when not overridden', () => {
    const draft = { ...createEmptyDraft('d1'), category: 'wedding' as const };
    expect(resolveDraftTheme(draft)).toBe('wedding');
  });

  it('keeps an explicitly chosen theme', () => {
    const draft = {
      ...createEmptyDraft('d1'),
      category: 'wedding' as const,
      themeKey: 'travel' as const,
    };
    expect(resolveDraftTheme(draft)).toBe('travel');
  });

  it('returns null create input for incomplete drafts', () => {
    expect(draftToCreateInput(createEmptyDraft('d1'))).toBeNull();
  });

  it('builds a create input from a complete draft', () => {
    const start = Date.now() + 86_400_000;
    const input = draftToCreateInput({
      ...createEmptyDraft('d1'),
      title: '  Dinner  ',
      description: '  Come hungry ',
      category: 'dinner',
      startAt: start,
      endAt: start + 3600_000,
      venueName: ' Zooba ',
      areaAddress: ' Zamalek ',
    });
    expect(input).not.toBeNull();
    expect(input?.title).toBe('Dinner');
    expect(input?.venueName).toBe('Zooba');
    expect(input?.themeKey).toBe('dinner');
  });
});
