import type { ImageSourcePropType } from 'react-native';

import {
  eventCoverImages,
  eventThemeImages,
  type EventCoverKey as AssetCoverKey,
} from '../../../assets';
import type { EventCoverKey, EventThemeKey } from './entity';

export function coverSource(key: EventCoverKey): ImageSourcePropType {
  return eventCoverImages[key as AssetCoverKey];
}

export function themeSource(key: EventThemeKey): ImageSourcePropType {
  return eventThemeImages[`theme_${key}`];
}
