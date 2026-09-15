import type { TFunction } from 'i18next';

export function wizardSteps(t: TFunction): string[] {
  return [
    t('create.stepBasics'),
    t('create.whenWhere'),
    t('create.themes'),
    t('create.preview'),
  ];
}

export const WIZARD_STEP = {
  basics: 0,
  whenWhere: 1,
  theme: 2,
  preview: 3,
} as const;
