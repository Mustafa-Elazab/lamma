import React, { useMemo } from 'react';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppIcon } from '../../../../design-system/atoms/Icon';
import { AppSkeleton } from '../../../../design-system/atoms/Skeleton';
import { AppText } from '../../../../design-system/atoms/Text';
import { AppEmptyState } from '../../../../design-system/molecules/EmptyState';
import { AppErrorState } from '../../../../design-system/molecules/ErrorState';
import { useTheme } from '../../../../design-system/theme/ThemeProvider';
import { formatDateShort } from '../../../../utils/format';
import { createStyles } from './styles';
import { useNotificationsController } from './useController';
import { useLanguage } from '../../../../app/localization';

export function NotificationsScreen(): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const c = useNotificationsController();
  const { language } = useLanguage();

  const hasContent = c.sections.length > 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <AppText variant="heading">{c.t('notifications.title')}</AppText>
          <AppText variant="body" color="textMuted">
            {c.t('notifications.subtitle')}
          </AppText>
        </View>
        {c.unread > 0 ? (
          <Pressable onPress={c.onMarkAllRead} hitSlop={8}>
            <AppText variant="label" color="primary">
              {c.t('notifications.markAllRead')}
            </AppText>
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={c.isRefetching}
            onRefresh={() => void c.refetch()}
            tintColor={theme.colors.primary}
          />
        }
      >
        {c.isLoading ? (
          <View>
            <AppSkeleton height={72} radius="md" style={styles.sectionLabel} />
            <AppSkeleton height={72} radius="md" style={styles.sectionLabel} />
            <AppSkeleton height={72} radius="md" />
          </View>
        ) : c.isError ? (
          <View style={styles.stateWrap}>
            <AppErrorState onRetry={() => void c.refetch()} />
          </View>
        ) : !hasContent ? (
          <View style={styles.stateWrap}>
            <AppEmptyState
              title={c.t('notifications.emptyTitle')}
              message={c.t('notifications.emptyMessage')}
              icon="bell"
            />
          </View>
        ) : (
          c.sections.map(section => (
            <View key={section.key}>
              <AppText
                variant="label"
                color="textMuted"
                style={styles.sectionLabel}
              >
                {c.t(`notifications.${section.key}`)}
              </AppText>
              {section.items.map(item => (
                <Pressable
                  key={item.id}
                  onPress={() => c.onPressNotification(item)}
                  style={[styles.item, !item.read && styles.itemUnread]}
                >
                  <View style={styles.iconWrap}>
                    <AppIcon name={c.iconFor(item.type)} size={20} color="primary" />
                  </View>
                  <View style={styles.itemBody}>
                    <AppText variant="bodyStrong">{item.title}</AppText>
                    <AppText variant="caption" color="textMuted">
                      {item.message}
                    </AppText>
                    <AppText variant="caption" color="textMuted">
                      {formatDateShort(item.createdAt, language)}
                    </AppText>
                  </View>
                  {!item.read ? <View style={styles.unreadDot} /> : null}
                </Pressable>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
