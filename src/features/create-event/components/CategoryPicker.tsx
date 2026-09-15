import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { AppChip } from '../../../design-system/atoms/Chip';
import { useTheme } from '../../../design-system/theme/ThemeProvider';
import type { Theme } from '../../../design-system/theme/tokens';
import type { EventCategory } from '../../events';
import { CATEGORY_ICON, CATEGORY_ORDER, categoryLabelKey } from './categoryMeta';

export type CategoryPickerProps = {
  value: EventCategory | null;
  onChange: (category: EventCategory) => void;
};

export function CategoryPicker({
  value,
  onChange,
}: CategoryPickerProps): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();

  return (
    <View style={styles.grid}>
      {CATEGORY_ORDER.map(category => (
        <AppChip
          key={category}
          label={t(categoryLabelKey(category))}
          icon={CATEGORY_ICON[category]}
          selected={value === category}
          onPress={() => onChange(category)}
        />
      ))}
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
  });
}
