import type { AppLanguage } from '../../../app/localization';

export type LocalizedText = {
  en: string;
  ar: string;
};

export function localizeText(
  value: LocalizedText | string | undefined | null,
  language: AppLanguage,
): string {
  if (!value) {
    return '';
  }
  if (typeof value === 'string') {
    return value;
  }
  return value[language] || value.en || value.ar || '';
}
