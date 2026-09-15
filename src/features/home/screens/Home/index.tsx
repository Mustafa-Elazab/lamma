import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  View,
  type ListRenderItemInfo,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '../../../../design-system/atoms/Icon';
import { Skeleton } from '../../../../design-system/atoms/Skeleton';
import { Text } from '../../../../design-system/atoms/Text';
import { EmptyState } from '../../../../design-system/molecules/EmptyState';
import { ErrorState } from '../../../../design-system/molecules/ErrorState';
import { SectionHeader } from '../../../../design-system/molecules/SectionHeader';
import { SegmentedTabs } from '../../../../design-system/molecules/SegmentedTabs';
import { EventCard } from '../../../../design-system/organisms/EventCard';
import { useTheme } from '../../../../design-system/theme/ThemeProvider';
import type { LammaEvent } from '../../../events';
import { HomeHeader } from '../../components/HomeHeader';
import { createStyles } from './styles';
import { useHomeController } from './useController';

export function HomeScreen(): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const c = useHomeController();

  const renderItem = ({ item }: ListRenderItemInfo<LammaEvent>) => (
    <View style={styles.compactItem}>
      <EventCard
        data={c.toCard(item)}
        variant="compact"
        onPress={() => c.openEvent(item.id)}
      />
    </View>
  );

  const header = (
    <View style={styles.body}>
      <SegmentedTabs items={c.tabs} value={c.filter} onChange={c.setFilter} />
      {c.featuredCard ? (
        <EventCard
          data={c.featuredCard}
          variant="featured"
          onPress={() =>
            c.featured ? c.openEvent(c.featured.id) : undefined
          }
        />
      ) : null}
      {c.events.length > 0 ? (
        <SectionHeader
          title={c.t('home.yourEvents')}
          actionLabel={c.t('common.seeAll')}
          onPressAction={() => undefined}
        />
      ) : null}
    </View>
  );

  const renderEmpty = () => {
    if (c.isLoading) {
      return (
        <View style={styles.body}>
          <Skeleton height={200} radius="lg" />
          <Skeleton height={100} radius="lg" />
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
    if (!c.featuredCard) {
      return (
        <View style={styles.stateWrap}>
          <EmptyState
            title={c.emptyCopy.title}
            message={c.emptyCopy.message}
            icon="calendar"
            actionLabel={c.t('home.createEvent')}
            onAction={c.openCreate}
          />
        </View>
      );
    }
    return <View />;
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HomeHeader greetingName={c.greetingName} avatar={c.avatar} />
      <FlatList
        data={c.isLoading ? [] : c.events}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListHeaderComponent={header}
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
      <View style={styles.fab}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={c.t('home.createEvent')}
          onPress={c.openCreate}
          style={styles.fabButton}
        >
          <Icon name="plus" size={28} color="textInverse" />
        </Pressable>
        <Text variant="caption" color="primary" weight="700">
          {c.t('home.createEvent')}
        </Text>
      </View>
    </SafeAreaView>
  );
}
