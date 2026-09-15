import { createEmptyDraft, type EventDraft } from '../draftEntity';
import {
  canPublish,
  validateBasics,
  validateTitle,
  validateWhenWhere,
} from '../validators';

function fullDraft(): EventDraft {
  const start = Date.now() + 86_400_000;
  return {
    ...createEmptyDraft('d1'),
    title: 'Team Iftar',
    category: 'iftar',
    startAt: start,
    endAt: start + 3 * 60 * 60 * 1000,
    venueName: 'Home',
    areaAddress: 'Maadi, Cairo',
  };
}

describe('create-event validators', () => {
  it('validates titles', () => {
    expect(validateTitle('')).toBe('create.errorTitleRequired');
    expect(validateTitle('   ')).toBe('create.errorTitleRequired');
    expect(validateTitle('a'.repeat(61))).toBe('create.errorTitleTooLong');
    expect(validateTitle('Birthday')).toBeNull();
  });

  it('requires title and category in basics', () => {
    const empty = createEmptyDraft('d1');
    const result = validateBasics(empty);
    expect(result.valid).toBe(false);
    expect(result.errors.title).toBeDefined();
    expect(result.errors.category).toBeDefined();
  });

  it('requires date, venue and address in when/where', () => {
    const empty = createEmptyDraft('d1');
    const result = validateWhenWhere(empty);
    expect(result.valid).toBe(false);
    expect(result.errors.startAt).toBeDefined();
    expect(result.errors.venueName).toBeDefined();
    expect(result.errors.areaAddress).toBeDefined();
  });

  it('flags end times before start times', () => {
    const draft = fullDraft();
    draft.endAt = draft.startAt! - 1000;
    const result = validateWhenWhere(draft);
    expect(result.errors.endAt).toBe('create.errorEndBeforeStart');
  });

  it('allows publishing a complete draft', () => {
    expect(canPublish(fullDraft())).toBe(true);
    expect(canPublish(createEmptyDraft('d1'))).toBe(false);
  });
});
