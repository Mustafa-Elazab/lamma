import type { ImageSourcePropType } from 'react-native';

import {
  eventCoverImages,
  eventThemeImages,
  type EventCoverKey as AssetCoverKey,
} from '../../../assets';
import type { EventCoverKey, EventThemeKey, LammaEvent } from './entity';

export function coverSource(key: EventCoverKey): ImageSourcePropType {
  return eventCoverImages[key as AssetCoverKey];
}

export function themeSource(key: EventThemeKey): ImageSourcePropType {
  return eventThemeImages[`theme_${key}`];
}

/**
 * Resolves the best available cover for an event: a real uploaded cover photo
 * when present, then the category cover art, finally the theme art. Guarantees a
 * non-empty image source so covers always render on cards and detail screens.
 */
export function eventCover(
  event: Pick<LammaEvent, 'coverImageUrl' | 'coverKey' | 'themeKey'>,
): ImageSourcePropType {
  if (event.coverImageUrl) {
    return { uri: event.coverImageUrl };
  }
  if (event.themeKey) {
    const theme = themeSource(event.themeKey);
    if (theme) {
      return theme;
    }
  }
  return (
    eventCoverImages[event.coverKey as AssetCoverKey] ??
    eventThemeImages.theme_generic
  );
}
