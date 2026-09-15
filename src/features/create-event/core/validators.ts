import { MAX_DESCRIPTION_LENGTH, MAX_TITLE_LENGTH, type EventDraft } from './draftEntity';

export type ValidationResult = {
  valid: boolean;
  errors: Partial<Record<string, string>>;
};

export function validateTitle(title: string): string | null {
  const trimmed = title.trim();
  if (trimmed.length === 0) {
    return 'create.errorTitleRequired';
  }
  if (trimmed.length > MAX_TITLE_LENGTH) {
    return 'create.errorTitleTooLong';
  }
  return null;
}

export function validateDescription(description: string): string | null {
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    return 'create.errorDescriptionTooLong';
  }
  return null;
}

export function validateBasics(draft: EventDraft): ValidationResult {
  const errors: Partial<Record<string, string>> = {};
  const titleError = validateTitle(draft.title);
  if (titleError) {
    errors.title = titleError;
  }
  const descriptionError = validateDescription(draft.description);
  if (descriptionError) {
    errors.description = descriptionError;
  }
  if (!draft.category) {
    errors.category = 'create.errorCategoryRequired';
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateWhenWhere(draft: EventDraft): ValidationResult {
  const errors: Partial<Record<string, string>> = {};
  if (draft.startAt === null) {
    errors.startAt = 'create.errorDateRequired';
  }
  if (draft.startAt !== null && draft.endAt !== null && draft.endAt <= draft.startAt) {
    errors.endAt = 'create.errorEndBeforeStart';
  }
  if (!draft.venueName.trim()) {
    errors.venueName = 'create.errorVenueRequired';
  }
  if (!draft.areaAddress.trim()) {
    errors.areaAddress = 'create.errorAddressRequired';
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

export function canPublish(draft: EventDraft): boolean {
  return validateBasics(draft).valid && validateWhenWhere(draft).valid;
}
