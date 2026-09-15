import React, { useMemo } from 'react';
import { Image, Pressable, View } from 'react-native';

import { AppIcon } from '../../../../design-system/atoms/Icon';
import { AppText } from '../../../../design-system/atoms/Text';
import { AppEmptyState } from '../../../../design-system/molecules/EmptyState';
import { AppScreenHeader } from '../../../../design-system/molecules/ScreenHeader';
import { AppScreenTemplate } from '../../../../design-system/templates/ScreenTemplate';
import { useTheme } from '../../../../design-system/theme/ThemeProvider';
import { createStyles } from './styles';
import { useMyDraftsController } from './useController';

export function MyDraftsScreen(): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const c = useMyDraftsController();

  return (
    <AppScreenTemplate
      edges={['top']}
      header={
        <AppScreenHeader
          title={c.t('drafts.title')}
          subtitle={c.t('drafts.subtitle')}
          onBack={c.goBack}
        />
      }
    >
      {c.draftItems.length === 0 ? (
        <AppEmptyState
          title={c.t('drafts.emptyTitle')}
          message={c.t('drafts.emptyMessage')}
          icon="draft"
          actionLabel={c.t('home.createEvent')}
          onAction={c.goCreateEvent}
        />
      ) : (
        c.draftItems.map(draft => (
          <Pressable
            key={draft.id}
            style={styles.row}
            onPress={() => c.goEditDraft(draft.id)}
          >
            <Image source={draft.coverSource} style={styles.cover} />
            <View style={styles.text}>
              <AppText variant="bodyStrong" numberOfLines={1}>
                {draft.title}
              </AppText>
              <AppText variant="caption" color="textMuted">
                {draft.lastEdited}
              </AppText>
            </View>
            <Pressable
              hitSlop={8}
              onPress={() => c.handleDeleteDraft(draft.id)}
            >
              <AppIcon name="close" size={20} color="error" />
            </Pressable>
          </Pressable>
        ))
      )}
    </AppScreenTemplate>
  );
}
