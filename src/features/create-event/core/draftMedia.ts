import type { ImageSourcePropType } from 'react-native';

import { themeSource } from '../../events';
import { resolveDraftTheme, type EventDraft } from './draftEntity';

export function draftThemeSource(draft: EventDraft): ImageSourcePropType {
  if (draft.customThemeUri) {
    return { uri: draft.customThemeUri };
  }
  return themeSource(resolveDraftTheme(draft));
}
