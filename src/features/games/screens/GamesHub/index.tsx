import React, { useMemo } from 'react';
import { FlatList, View, type ListRenderItemInfo } from 'react-native';

import { AppButton } from '../../../../design-system/atoms/Button';
import { AppIcon } from '../../../../design-system/atoms/Icon';
import { AppInput } from '../../../../design-system/atoms/Input';
import { AppText } from '../../../../design-system/atoms/Text';
import { AppCard } from '../../../../design-system/molecules/Card';
import { AppEmptyState } from '../../../../design-system/molecules/EmptyState';
import { AppErrorState } from '../../../../design-system/molecules/ErrorState';
import { AppScreenHeader } from '../../../../design-system/molecules/ScreenHeader';
import { AppScreenTemplate } from '../../../../design-system/templates/ScreenTemplate';
import { useTheme } from '../../../../design-system/theme/ThemeProvider';
import type { GameDefinition } from '../../core/types';
import { createStyles } from './styles';
import { useGamesHubController } from './useController';

const ACCENT_BACKGROUND: Record<GameDefinition['accent'], string> = {
  rose: '#FCE7F3',
  sky: '#E0F2FE',
  mint: '#DCFCE7',
};

export function GamesHubScreen(): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const c = useGamesHubController();

  const renderItem = ({ item }: ListRenderItemInfo<GameDefinition>) => (
    <AppCard onPress={() => c.openGame(item.id)} style={styles.card}>
      <View style={styles.cardTop}>
        <View
          style={[
            styles.iconWrap,
            { backgroundColor: ACCENT_BACKGROUND[item.accent] },
          ]}
        >
          <AppIcon name={item.icon} size={28} color="primary" />
        </View>
        <View style={styles.titleBlock}>
          <AppText variant="subheading">{String(item.name)}</AppText>
          <AppText variant="body" color="textMuted">
            {String(item.shortDescription)}
          </AppText>
        </View>
        <AppIcon name="back" size={20} color="textMuted" rtlMirror={false} />
      </View>
      <View style={styles.metaRow}>
        <View style={styles.metaPill}>
          <AppText variant="caption" color="textMuted">
            {c.t('games.playersRange', {
              min: item.minPlayers,
              max: item.maxPlayers,
            })}
          </AppText>
        </View>
        <View style={styles.metaPill}>
          <AppText variant="caption" color="textMuted">
            {c.t('games.hostAuthoritative')}
          </AppText>
        </View>
      </View>
    </AppCard>
  );

  return (
    <AppScreenTemplate
      edges={['top']}
      scroll={false}
      padded={false}
      header={
        <AppScreenHeader title={c.t('games.title')} onBack={() => c.goBack()} />
      }
    >
      {c.gamesLoading ? (
        <AppEmptyState
          icon="group"
          title={c.t('games.loadingContentTitle')}
          message={c.t('games.loadingContentMessage')}
        />
      ) : c.gamesError ? (
        <AppErrorState
          title={c.t('games.contentErrorTitle')}
          message={c.t('games.contentErrorMessage')}
          retryLabel={c.t('games.retry')}
          onRetry={() => {
            c.refetchGames().catch(() => undefined);
          }}
        />
      ) : c.gamesEmpty ? (
        <AppEmptyState
          icon="group"
          title={c.t('games.contentEmptyTitle')}
          message={c.t('games.contentEmptyMessage')}
          actionLabel={c.t('games.retry')}
          onAction={() => {
            c.refetchGames().catch(() => undefined);
          }}
        />
      ) : (
        <FlatList
          data={c.games}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.content}
          ListHeaderComponent={
            <View style={styles.header}>
              <AppText variant="body" color="textMuted">
                {c.t('games.subtitle')}
              </AppText>
              <AppCard style={styles.joinCard}>
                <AppText variant="subheading">{c.t('games.joinRoom')}</AppText>
                <View style={styles.joinFields}>
                  <AppInput
                    label={c.t('games.roomCode')}
                    value={c.joinCode}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    onChangeText={c.setJoinCode}
                    errorText={c.joinError ?? undefined}
                  />
                  <AppInput
                    label={c.t('games.playerName')}
                    value={c.playerName}
                    onChangeText={c.setPlayerName}
                  />
                </View>
                <AppButton
                  label={c.t('games.joinGame')}
                  loading={c.joining}
                  onPress={c.joinGame}
                />
              </AppCard>
            </View>
          }
        />
      )}
    </AppScreenTemplate>
  );
}
