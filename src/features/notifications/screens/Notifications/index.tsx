import React, { useMemo } from 'react';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '../../../../design-system/atoms/Icon';
import { Skeleton } from '../../../../design-system/atoms/Skeleton';
import { Text } from '../../../../design-system/atoms/Text';
import { EmptyState } from '../../../../design-system/molecules/EmptyState';
import { ErrorState } from '../../../../design-system/molecules/ErrorState';
import { useTheme } from '../../../../design-system/theme/ThemeProvider';
import { formatDateShort } from '../../../../utils/format';
import { createStyles } from './styles';
import { useNotificationsController } from './useController';

export function NotificationsScreen(): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const c = useNotificationsController();

  const hasContent = c.sections.length > 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text variant="heading">{c.t('notifications.title')}</Text>
          <Text variant="body" color="textMuted">
            {c.t('notifications.subtitle')}
          </Text>
        </View>
        {c.unread > 0 ? (
          <Pressable onPress={c.onMarkAllRead} hitSlop={8}>
            <Text variant="label" color="primary">
              {c.t('notifications.markAllRead')}
            </Text>
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
            <Skeleton height={72} radius="md" style={styles.sectionLabel} />
            <Skeleton height={72} radius="md" style={styles.sectionLabel} />
            <Skeleton height={72} radius="md" />
          </View>
        ) : c.isError ? (
          <View style={styles.stateWrap}>
            <ErrorState onRetry={() => void c.refetch()} />
          </View>
        ) : !hasContent ? (
          <View style={styles.stateWrap}>
            <EmptyState
              title={c.t('notifications.emptyTitle')}
              message={c.t('notifications.emptyMessage')}
              icon="bell"
            />
          </View>
        ) : (
          c.sections.map(section => (
            <View key={section.key}>
              <Text
                variant="label"
                color="textMuted"
                style={styles.sectionLabel}
              >
                {c.t(`notifications.${section.key}`)}
              </Text>
              {section.items.map(item => (
                <Pressable
                  key={item.id}
                  onPress={() => c.onPressNotification(item)}
                  style={[styles.item, !item.read && styles.itemUnread]}
                >
                  <View style={styles.iconWrap}>
                    <Icon name={c.iconFor(item.type)} size={20} color="primary" />
                  </View>
                  <View style={styles.itemBody}>
                    <Text variant="bodyStrong">{item.title}</Text>
                    <Text variant="caption" color="textMuted">
                      {item.message}
                    </Text>
                    <Text variant="caption" color="textMuted">
                      {formatDateShort(item.createdAt)}
                    </Text>
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
