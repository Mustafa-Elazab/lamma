import type { IconName } from '../../../design-system/atoms/Icon';
import type { EventCategory } from '../../events';

export const CATEGORY_ORDER: EventCategory[] = [
  'birthday',
  'wedding',
  'engagement',
  'dinner',
  'trip',
  'gathering',
  'iftar',
  'other',
];

export const CATEGORY_ICON: Record<EventCategory, IconName> = {
  birthday: 'cake',
  wedding: 'ring',
  engagement: 'diamond',
  dinner: 'dinner',
  trip: 'airplane',
  gathering: 'group',
  iftar: 'mosque',
  other: 'more',
};

export function categoryLabelKey(category: EventCategory): string {
  return `categories.${category}`;
}
