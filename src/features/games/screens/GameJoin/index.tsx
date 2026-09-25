import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { displayNameOrGuest, useAuth } from '../../../auth';
import { AppEmptyState } from '../../../../design-system/molecules/EmptyState';
import { AppErrorState } from '../../../../design-system/molecules/ErrorState';
import { AppScreenHeader } from '../../../../design-system/molecules/ScreenHeader';
import { AppScreenTemplate } from '../../../../design-system/templates/ScreenTemplate';
import type { GamesStackParamList } from '../../../../navigation/types';
import { trackEvent } from '../../../../services/analytics';
import { useGameSession } from '../../core/session';

type Props = NativeStackScreenProps<GamesStackParamList, 'GameJoin'>;

/** Opened from an invite link: joins the room and lands in its lobby. */
export function GameJoinScreen({
  navigation,
  route,
}: Props): React.ReactElement {
  const { t } = useTranslation();
  const { user } = useAuth();
  const session = useGameSession();
  const code = route.params.code.trim().toUpperCase();
  const [failed, setFailed] = useState(false);

  const join = useCallback(async () => {
    setFailed(false);
    if (session.current?.code === code) {
      navigation.replace('GameLobby', { gameId: session.current.gameId });
      return;
    }
    const joined = await session
      .joinByCode(code, displayNameOrGuest(user, 'Guest'))
      .catch(() => null);
    if (!joined) {
      setFailed(true);
      return;
    }
    void trackEvent('join_room', { game_id: joined.gameId, source: 'link' });
    navigation.replace('GameLobby', { gameId: joined.gameId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  useEffect(() => {
    void join();
  }, [join]);

  return (
    <AppScreenTemplate
      edges={['top']}
      header={
        <AppScreenHeader
          title={t('games.joinRoom')}
          onBack={() => navigation.navigate('GamesHub')}
        />
      }
    >
      {failed ? (
        <AppErrorState
          title={t('games.joinCodeNotFound')}
          message={t('games.inviteExpired', { code })}
          retryLabel={t('games.retry')}
          onRetry={() => {
            void join();
          }}
        />
      ) : (
        <AppEmptyState
          icon="group"
          title={t('games.joiningRoom', { code })}
          message={t('games.loadingContentMessage')}
        />
      )}
    </AppScreenTemplate>
  );
}
