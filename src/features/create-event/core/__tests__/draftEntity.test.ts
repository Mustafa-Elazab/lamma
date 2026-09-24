import {
  createEmptyDraft,
  draftToCreateInput,
  isDraftEmpty,
  normalizeDraft,
  resolveDraftTheme,
} from '../draftEntity';

describe('draft entity', () => {
  it('creates an empty draft', () => {
    const draft = createEmptyDraft('d1');
    expect(isDraftEmpty(draft)).toBe(true);
    expect(draft.themeKey).toBe('generic');
    expect(draft.themeExplicit).toBe(false);
    expect(draft.themeType).toBe('preset');
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
      themeExplicit: true,
    };
    expect(resolveDraftTheme(draft)).toBe('travel');
  });

  it('keeps the last preset (generic) instead of falling back to the first', () => {
    const draft = {
      ...createEmptyDraft('d1'),
      category: 'wedding' as const,
      themeKey: 'generic' as const,
      themeExplicit: true,
      themeType: 'preset' as const,
    };
    expect(resolveDraftTheme(draft)).toBe('generic');
  });

  it('does not treat a custom photo as the first preset', () => {
    const draft = {
      ...createEmptyDraft('d1'),
      category: 'wedding' as const,
      themeType: 'custom' as const,
      customThemeUri: 'file:///tmp/theme.jpg',
      themeExplicit: true,
    };
    expect(resolveDraftTheme(draft)).toBe('generic');
    expect(draftToCreateInput({
      ...draft,
      title: 'Dinner',
      description: '',
      startAt: Date.now() + 86_400_000,
      endAt: Date.now() + 90_000_000,
      venueName: 'Zooba',
      areaAddress: 'Zamalek',
    })?.customThemeUri).toBe('file:///tmp/theme.jpg');
  });

  it('hydrates older drafts that lack themeExplicit', () => {
    const hydrated = normalizeDraft({
      id: 'old',
      category: 'wedding',
      themeKey: 'travel',
    });
    expect(hydrated.themeExplicit).toBe(true);
    expect(resolveDraftTheme(hydrated)).toBe('travel');
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
