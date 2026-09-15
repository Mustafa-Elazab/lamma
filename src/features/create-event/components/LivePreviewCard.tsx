import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, View } from 'react-native';

import { Badge } from '../../../design-system/atoms/Badge';
import { Icon } from '../../../design-system/atoms/Icon';
import { Text } from '../../../design-system/atoms/Text';
import { useTheme } from '../../../design-system/theme/ThemeProvider';
import type { Theme } from '../../../design-system/theme/tokens';
import { themeSource } from '../../events';
import { resolveDraftTheme, type EventDraft } from '../core/draftEntity';
import { categoryLabelKey } from './categoryMeta';

export type LivePreviewCardProps = {
  draft: EventDraft;
  dateLabel?: string;
  locationLabel?: string;
};

export function LivePreviewCard({
  draft,
  dateLabel,
  locationLabel,
}: LivePreviewCardProps): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();

  return (
    <View style={styles.card}>
      <Image
        source={themeSource(resolveDraftTheme(draft))}
        style={styles.cover}
      />
      <View style={styles.body}>
        {draft.category ? (
          <Badge
            label={t(categoryLabelKey(draft.category)).toUpperCase()}
            tone="primary"
          />
        ) : null}
        <Text variant="subheading" numberOfLines={2}>
          {draft.title.trim() || t('create.eventTitle')}
        </Text>
        <View style={styles.metaRow}>
          <Icon name="calendar" size={14} color="textMuted" />
          <Text
            variant="caption"
            color="textMuted"
            numberOfLines={1}
            style={styles.metaText}
          >
            {dateLabel ?? t('create.dateTBD')}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <Icon name="location" size={14} color="textMuted" />
          <Text
            variant="caption"
            color="textMuted"
            numberOfLines={1}
            style={styles.metaText}
          >
            {locationLabel ?? t('create.locationTBD')}
          </Text>
        </View>
        {draft.description.trim() ? (
          <Text variant="caption" color="textMuted" numberOfLines={2}>
            {draft.description.trim()}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    card: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
      ...theme.shadows.soft,
    },
    cover: { width: 120, height: '100%', minHeight: 150, resizeMode: 'cover' },
    body: { flex: 1, padding: theme.spacing.md, gap: theme.spacing.xs },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs },
    metaText: { flex: 1 },
  });
}
