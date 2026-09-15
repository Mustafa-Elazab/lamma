import React, { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  View,
  type ListRenderItemInfo,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppSkeleton } from '../../../../design-system/atoms/Skeleton';
import { AppIcon } from '../../../../design-system/atoms/Icon';
import { AppText } from '../../../../design-system/atoms/Text';
import { AppEmptyState } from '../../../../design-system/molecules/EmptyState';
import { AppErrorState } from '../../../../design-system/molecules/ErrorState';
import { AppSectionHeader } from '../../../../design-system/molecules/SectionHeader';
import { AppSegmentedTabs } from '../../../../design-system/molecules/SegmentedTabs';
import { AppEventCard } from '../../../../design-system/organisms/EventCard';
import { useTheme } from '../../../../design-system/theme/ThemeProvider';
import type { LammaEvent } from '../../../events';
import { HomeHeader } from '../../components/HomeHeader';
import { createStyles } from './styles';
import { useHomeController } from './useController';

export function HomeScreen(): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const c = useHomeController();

  const { toCard, openEvent } = c;
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<LammaEvent>) => (
      <View style={styles.compactItem}>
        <AppEventCard
          data={toCard(item)}
          variant="compact"
          onPress={() => openEvent(item.id)}
        />
      </View>
    ),
    [openEvent, styles.compactItem, toCard],
  );
  const keyExtractor = useCallback((item: LammaEvent) => item.id, []);

  const header = (
    <View style={styles.body}>
      <AppSegmentedTabs items={c.tabs} value={c.filter} onChange={c.setFilter} />
      {c.featuredCard ? (
        <AppEventCard
          data={c.featuredCard}
          variant="featured"
          onPress={() =>
            c.featured ? c.openEvent(c.featured.id) : undefined
          }
        />
      ) : null}
      {c.events.length > 0 ? (
        <AppSectionHeader
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
          <AppSkeleton height={200} radius="lg" />
          <AppSkeleton height={100} radius="lg" />
          <AppSkeleton height={100} radius="lg" />
        </View>
      );
    }
    if (c.isError) {
      return (
        <View style={styles.stateWrap}>
          <AppErrorState onRetry={() => void c.refetch()} />
        </View>
      );
    }
    if (!c.featuredCard) {
      return (
        <View style={styles.stateWrap}>
          <AppEmptyState
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
        keyExtractor={keyExtractor}
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
      <View style={styles.createAction}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={c.t('home.createEvent')}
          onPress={c.openCreate}
          style={({ pressed }) => [
            styles.createButton,
            pressed && styles.createButtonPressed,
          ]}
        >
          <AppIcon name="plus" size={30} color="textInverse" />
        </Pressable>
        <AppText variant="caption" color="primary">
          {c.t('home.createEvent')}
        </AppText>
      </View>
    </SafeAreaView>
  );
}
