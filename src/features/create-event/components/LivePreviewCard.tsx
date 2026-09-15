import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, View } from 'react-native';

import { AppBadge } from '../../../design-system/atoms/Badge';
import { AppIcon } from '../../../design-system/atoms/Icon';
import { AppText } from '../../../design-system/atoms/Text';
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
          <AppBadge
            label={t(categoryLabelKey(draft.category)).toUpperCase()}
            tone="primary"
          />
        ) : null}
        <AppText variant="subheading" numberOfLines={2}>
          {draft.title.trim() || t('create.eventTitle')}
        </AppText>
        <View style={styles.metaRow}>
          <AppIcon name="calendar" size={14} color="textMuted" />
          <AppText
            variant="caption"
            color="textMuted"
            numberOfLines={1}
            style={styles.metaText}
          >
            {dateLabel ?? t('create.dateTBD')}
          </AppText>
        </View>
        <View style={styles.metaRow}>
          <AppIcon name="location" size={14} color="textMuted" />
          <AppText
            variant="caption"
            color="textMuted"
            numberOfLines={1}
            style={styles.metaText}
          >
            {locationLabel ?? t('create.locationTBD')}
          </AppText>
        </View>
        {draft.description.trim() ? (
          <AppText variant="caption" color="textMuted" numberOfLines={2}>
            {draft.description.trim()}
          </AppText>
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
