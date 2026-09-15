import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  View,
  type ListRenderItemInfo,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Chip } from '../../../../design-system/atoms/Chip';
import { Input } from '../../../../design-system/atoms/Input';
import { Skeleton } from '../../../../design-system/atoms/Skeleton';
import { Text } from '../../../../design-system/atoms/Text';
import { EmptyState } from '../../../../design-system/molecules/EmptyState';
import { ErrorState } from '../../../../design-system/molecules/ErrorState';
import { EventCard } from '../../../../design-system/organisms/EventCard';
import { useTheme } from '../../../../design-system/theme/ThemeProvider';
import {
  CATEGORY_ICON,
  CATEGORY_ORDER,
  categoryLabelKey,
} from '../../../create-event/components/categoryMeta';
import type { LammaEvent } from '../../../events';
import { createStyles } from './styles';
import { useDiscoverController } from './useController';

export function DiscoverScreen(): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const c = useDiscoverController();

  const renderItem = ({ item }: ListRenderItemInfo<LammaEvent>) => (
    <EventCard
      data={c.toCard(item)}
      variant="compact"
      onPress={() => c.openEvent(item.id)}
    />
  );

  const renderEmpty = () => {
    if (c.isLoading) {
      return (
        <View>
          <Skeleton height={100} radius="lg" style={styles.sectionTitle} />
          <Skeleton height={100} radius="lg" style={styles.sectionTitle} />
          <Skeleton height={100} radius="lg" />
        </View>
      );
    }
    if (c.isError) {
      return (
        <View style={styles.stateWrap}>
          <ErrorState onRetry={() => void c.refetch()} />
        </View>
      );
    }
    return (
      <View style={styles.stateWrap}>
        <EmptyState
          title={c.t('discover.emptyTitle')}
          message={c.t('discover.emptyMessage')}
          icon="search"
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <Text variant="heading">{c.t('discover.title')}</Text>
          <Text variant="body" color="textMuted">
            {c.t('discover.subtitle')}
          </Text>
        </View>
        <Input
          placeholder={c.t('discover.searchPlaceholder')}
          value={c.rawQuery}
          onChangeText={c.setRawQuery}
          leftIcon="search"
          returnKeyType="search"
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryRow}
      >
        {CATEGORY_ORDER.map(cat => (
          <Chip
            key={cat}
            label={c.t(categoryLabelKey(cat))}
            icon={CATEGORY_ICON[cat]}
            selected={c.category === cat}
            onPress={() => c.toggleCategory(cat)}
          />
        ))}
      </ScrollView>

      <FlatList
        data={c.isLoading ? [] : c.events}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          <Text variant="subheading" style={styles.sectionTitle}>
            {c.t('discover.nearby')}
          </Text>
        }
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={c.loadMore}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={c.isRefetching}
            onRefresh={() => void c.refetch()}
            tintColor={theme.colors.primary}
          />
        }
        ListFooterComponent={
          c.isFetchingNextPage ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator color={theme.colors.primary} />
            </View>
          ) : undefined
        }
      />
    </SafeAreaView>
  );
}
