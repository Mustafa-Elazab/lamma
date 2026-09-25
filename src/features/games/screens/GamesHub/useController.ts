import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { displayNameOrGuest, useAuth } from '../../../auth';
import { useLanguage } from '../../../../app/localization';
import type { GamesStackParamList } from '../../../../navigation/types';
import { trackEvent } from '../../../../services/analytics';
import { localizeText } from '../../core/localized';
import { useGamesContent } from '../../core/hooks';
import { useGameSession } from '../../core/session';
import type { GameDefinition, GameId } from '../../core/types';

function localizeGame(
  definition: GameDefinition,
  language: ReturnType<typeof useLanguage>['language'],
): GameDefinition {
  return {
    ...definition,
    name: localizeText(definition.name, language),
    shortDescription: localizeText(definition.shortDescription, language),
  };
}

export function useGamesHubController() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigation = useNavigation<NavigationProp<GamesStackParamList>>();
  const session = useGameSession();
  const contentQuery = useGamesContent();
  const [joinCode, setJoinCode] = useState('');
  const [playerName, setPlayerName] = useState(
    displayNameOrGuest(user, 'Guest'),
  );
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  const games = useMemo(
    () =>
      (contentQuery.data ?? []).map(item =>
        localizeGame(item.definition, language),
      ),
    [contentQuery.data, language],
  );

  const openGame = useCallback(
    (gameId: GameId) => {
      navigation.navigate('GameLobby', { gameId });
    },
    [navigation],
  );

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const joinGame = useCallback(async () => {
    const code = joinCode.trim().toUpperCase();
    if (!code) {
      setJoinError(t('games.joinCodeRequired'));
      return;
    }
    setJoining(true);
    setJoinError(null);
    const joined = await session.joinByCode(
      code,
      playerName.trim() || displayNameOrGuest(user, 'Guest'),
    );
    setJoining(false);
    if (!joined) {
      setJoinError(t('games.joinCodeNotFound'));
      return;
    }
    void trackEvent('join_room', { game_id: joined.gameId, source: 'code' });
    navigation.navigate('GameLobby', { gameId: joined.gameId });
  }, [joinCode, navigation, playerName, session, t, user]);

  return {
    t,
    goBack,
    games,
    gamesLoading: contentQuery.isLoading,
    gamesError: contentQuery.isError,
    refetchGames: contentQuery.refetch,
    gamesEmpty: !contentQuery.isLoading && games.length === 0,
    openGame,
    joinCode,
    setJoinCode,
    playerName,
    setPlayerName,
    joinError,
    joining,
    joinGame,
  };
}
