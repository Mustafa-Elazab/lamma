import {
  useNavigation,
  type NavigationProp,
} from '@react-navigation/native';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { useLanguage } from '../../../../app/localization';
import { AppIcon } from '../../../../design-system/atoms/Icon';
import { AppText } from '../../../../design-system/atoms/Text';
import { AppEmptyState } from '../../../../design-system/molecules/EmptyState';
import { AppScreenHeader } from '../../../../design-system/molecules/ScreenHeader';
import { AppScreenTemplate } from '../../../../design-system/templates/ScreenTemplate';
import { useTheme } from '../../../../design-system/theme/ThemeProvider';
import type { Theme } from '../../../../design-system/theme/tokens';
import type { AppStackParamList } from '../../../../navigation/types';
import { useDeleteDraft, useDrafts } from '../../../create-event/core';
import { resolveDraftTheme } from '../../../create-event/core/draftEntity';
import { themeSource } from '../../../events';
import { formatDateShort } from '../../../../utils/format';

export function MyDraftsScreen(): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();
  const { language } = useLanguage();
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const { data: drafts = [] } = useDrafts();
  const deleteDraft = useDeleteDraft();

  return (
    <AppScreenTemplate
      edges={['top']}
      header={
        <AppScreenHeader
          title={t('drafts.title')}
          subtitle={t('drafts.subtitle')}
          onBack={() => navigation.goBack()}
        />
      }
    >
      {drafts.length === 0 ? (
        <AppEmptyState
          title={t('drafts.emptyTitle')}
          message={t('drafts.emptyMessage')}
          icon="draft"
          actionLabel={t('home.createEvent')}
          onAction={() => navigation.navigate('CreateEvent')}
        />
      ) : (
        drafts.map(draft => (
          <Pressable
            key={draft.id}
            style={styles.row}
            onPress={() =>
              navigation.navigate('CreateEvent', { draftId: draft.id })
            }
          >
            <Image
              source={themeSource(resolveDraftTheme(draft))}
              style={styles.cover}
            />
            <View style={styles.text}>
              <AppText variant="bodyStrong" numberOfLines={1}>
                {draft.title.trim() || t('drafts.untitled')}
              </AppText>
              <AppText variant="caption" color="textMuted">
                {t('drafts.lastEdited', {
                  when: formatDateShort(draft.updatedAt, language),
                })}
              </AppText>
            </View>
            <Pressable
              hitSlop={8}
              onPress={() => deleteDraft.mutate(draft.id)}
            >
              <AppIcon name="close" size={20} color="error" />
            </Pressable>
          </Pressable>
        ))
      )}
    </AppScreenTemplate>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.md,
    },
    cover: {
      width: 56,
      height: 56,
      borderRadius: theme.radius.sm,
      resizeMode: 'cover',
    },
    text: { flex: 1, gap: 2 },
  });
}
