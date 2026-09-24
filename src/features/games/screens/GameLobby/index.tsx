import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo } from 'react';
import { View } from 'react-native';

import { useLanguage } from '../../../../app/localization';
import { AppButton } from '../../../../design-system/atoms/Button';
import { AppInput } from '../../../../design-system/atoms/Input';
import { AppText } from '../../../../design-system/atoms/Text';
import { AppCard } from '../../../../design-system/molecules/Card';
import { AppEmptyState } from '../../../../design-system/molecules/EmptyState';
import { AppErrorState } from '../../../../design-system/molecules/ErrorState';
import { AppScreenHeader } from '../../../../design-system/molecules/ScreenHeader';
import { AppScreenTemplate } from '../../../../design-system/templates/ScreenTemplate';
import { useTheme } from '../../../../design-system/theme/ThemeProvider';
import type { GamesStackParamList } from '../../../../navigation/types';
import { localizeText } from '../../core/localized';
import { createStyles } from './styles';
import { useGameLobbyController } from './useController';

type Props = NativeStackScreenProps<GamesStackParamList, 'GameLobby'>;

export function GameLobbyScreen({
  navigation,
  route,
}: Props): React.ReactElement {
  const theme = useTheme();
  const { language } = useLanguage();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const c = useGameLobbyController(route.params.gameId);
  const currentQuestion =
    c.gameplay?.kind === 'trivia-time'
      ? c.gameplay.round.questions[c.gameplay.round.currentIndex]
      : null;
  const myTriviaAnswer =
    c.gameplay?.kind === 'trivia-time' && c.me
      ? c.gameplay.round.answers[c.me.id]
      : undefined;
  const header = (
    <AppScreenHeader
      title={String(c.game.name)}
      subtitle={String(c.game.shortDescription)}
      onBack={() => navigation.goBack()}
    />
  );

  if (c.contentLoading) {
    return (
      <AppScreenTemplate edges={['top']} header={header}>
        <AppEmptyState
          icon="group"
          title={c.t('games.loadingContentTitle')}
          message={c.t('games.loadingContentMessage')}
        />
      </AppScreenTemplate>
    );
  }

  if (c.contentError) {
    return (
      <AppScreenTemplate edges={['top']} header={header}>
        <AppErrorState
          title={c.t('games.contentErrorTitle')}
          message={c.t('games.contentErrorMessage')}
          retryLabel={c.t('games.retry')}
          onRetry={() => {
            c.refetchContent().catch(() => undefined);
          }}
        />
      </AppScreenTemplate>
    );
  }

  if (c.contentEmpty) {
    return (
      <AppScreenTemplate edges={['top']} header={header}>
        <AppEmptyState
          icon="group"
          title={c.t('games.contentEmptyTitle')}
          message={c.t('games.contentEmptyMessage')}
          actionLabel={c.t('games.retry')}
          onAction={() => {
            c.refetchContent().catch(() => undefined);
          }}
        />
      </AppScreenTemplate>
    );
  }

  return (
    <AppScreenTemplate
      edges={['top']}
      header={header}
      contentStyle={styles.content}
    >
      <AppCard style={styles.card}>
        <View style={styles.codeBox}>
          <AppText variant="caption" color="textMuted">
            {c.t('games.roomCode')}
          </AppText>
          <AppText variant="title">{c.current?.code ?? '----'}</AppText>
        </View>
        <AppText variant="body" color="textMuted">
          {c.t('games.sharedSessionHint')}
        </AppText>
        {c.current?.code ? (
          <View style={styles.buttonRow}>
            <AppButton
              label={c.codeCopied ? c.t('games.codeCopied') : c.t('games.copyCode')}
              variant="secondary"
              onPress={c.copyRoomCode}
            />
            <AppButton label={c.t('games.shareInvite')} onPress={c.shareRoom} />
          </View>
        ) : null}
      </AppCard>

      <AppCard style={styles.card}>
        <View style={styles.rowBetween}>
          <AppText variant="subheading">{c.t('games.players')}</AppText>
          <AppText variant="caption" color="textMuted">
            {c.connectedPlayers.length}/{c.game.maxPlayers}
          </AppText>
        </View>
        {c.players.map(player => (
          <View key={player.id} style={styles.playerRow}>
            <AppText variant="bodyStrong">
              {player.name}
              {player.isHost ? ` · ${c.t('games.host')}` : ''}
              {!player.connected ? ` · ${c.t('games.disconnected')}` : ''}
            </AppText>
            <View
              style={[styles.dot, !player.connected && styles.dotOffline]}
            />
          </View>
        ))}
      </AppCard>

      {c.current?.phase === 'in-game' && c.gameplay ? (
        <>
          {c.gameplay.kind === 'mafioso' ? (
            <AppCard style={styles.card}>
              <AppText variant="subheading">
                {c.t('games.mafiosoPhase', { phase: c.mafiosoPhase })}
              </AppText>
              <View style={styles.resultBox}>
                <AppText variant="caption" color="textMuted">
                  {c.t('games.yourSecretRole')}
                </AppText>
                <AppText variant="heading">
                  {c.myMafiosoAssignment
                    ? c.mafiosoRoleLabel(c.myMafiosoAssignment.role)
                    : c.t('games.noRoleYet')}
                </AppText>
                {c.myMafiosoAssignment ? (
                  <AppText variant="body" color="textMuted">
                    {c.mafiosoRoleDescription(c.myMafiosoAssignment.role)}
                  </AppText>
                ) : null}
              </View>
              {c.mafiosoPhaseIndex === 1 && c.mafiosoClueText ? (
                <View style={styles.resultBox}>
                  <AppText variant="bodyStrong">
                    {c.t('games.mafiosoClue', {
                      n:
                        (c.gameplay && c.gameplay.kind === 'mafioso'
                          ? c.gameplay.state.clueIndex
                          : 0) + 1,
                      clue: c.mafiosoClueText,
                    })}
                  </AppText>
                </View>
              ) : null}
              {c.mafiosoWinner ? (
                <View style={styles.resultBox}>
                  <AppText variant="subheading">
                    {c.mafiosoWinner === 'town'
                      ? c.t('games.mafiosoTownWins')
                      : c.t('games.mafiosoMafiaWins')}
                  </AppText>
                </View>
              ) : null}
              {c.mafiosoPhaseIndex === 3 ? (
                <View style={styles.setupLines}>
                  <AppText variant="bodyStrong">
                    {c.t('games.mafiosoVotePrompt')}
                  </AppText>
                  {c.mafiosoVoteTargets.map(target => (
                    <AppButton
                      key={target.playerId}
                      label={target.playerName}
                      variant={
                        c.myMafiosoVote === target.playerId
                          ? 'primary'
                          : 'secondary'
                      }
                      disabled={
                        Boolean(c.myMafiosoVote) ||
                        Boolean(c.myPendingMafiosoVote)
                      }
                      onPress={() => c.voteMafioso(target.playerId)}
                    />
                  ))}
                </View>
              ) : null}
              {c.mafiosoPhaseIndex === 4 ? (
                <View style={styles.resultBox}>
                  <AppText variant="caption" color="textMuted">
                    {c.t('games.mafiosoReveal')}
                  </AppText>
                  <AppText variant="subheading">
                    {c.mafiosoRevealedAssignment
                      ? c.t('games.mafiosoRevealedPlayer', {
                          name: c.mafiosoRevealedAssignment.playerName,
                          role: c.mafiosoRoleLabel(
                            c.mafiosoRevealedAssignment.role,
                          ),
                        })
                      : c.t('games.mafiosoNoVotes')}
                  </AppText>
                </View>
              ) : null}
              <AppButton
                label={
                  c.mafiosoPhaseIndex === 3
                    ? c.t('games.revealVote')
                    : c.t('games.nextPhase')
                }
                disabled={!c.isHost}
                onPress={c.advanceMafioso}
              />
            </AppCard>
          ) : null}

          {c.gameplay.kind === 'trivia-time' ? (
            <AppCard style={styles.card}>
              {currentQuestion ? (
                <>
                  <View style={styles.rowBetween}>
                    <AppText variant="caption" color="textMuted">
                      {c.t('games.triviaQuestionProgress', {
                        current: c.gameplay.round.currentIndex + 1,
                        total: c.gameplay.round.questions.length,
                      })}
                    </AppText>
                    <AppText variant="caption" color="textMuted">
                      {c.t('games.triviaTimer', {
                        seconds: c.gameplay.round.settings.secondsPerQuestion,
                      })}
                    </AppText>
                  </View>
                  <AppText variant="subheading">
                    {localizeText(currentQuestion.prompt, language)}
                  </AppText>
                  <View style={styles.optionList}>
                    {currentQuestion.options.map((option, index) => {
                      const isCorrect =
                        c.gameplay?.kind === 'trivia-time' &&
                        c.gameplay.round.phase !== 'question' &&
                        currentQuestion.correctIndex === index;
                      return (
                        <AppButton
                          key={`${currentQuestion.id}-${index}`}
                          label={localizeText(option, language)}
                          variant={isCorrect ? 'primary' : 'secondary'}
                          disabled={
                            c.gameplay?.kind !== 'trivia-time' ||
                            c.gameplay.round.phase !== 'question' ||
                            Boolean(myTriviaAnswer) ||
                            Boolean(c.myPendingTriviaAnswer)
                          }
                          onPress={() => c.answerTrivia(index)}
                        />
                      );
                    })}
                  </View>
                  {c.gameplay.round.phase === 'question' ? (
                    <AppButton
                      label={c.t('games.revealAnswer')}
                      variant="outline"
                      disabled={!c.isHost}
                      onPress={c.revealTrivia}
                    />
                  ) : c.gameplay.round.phase === 'reveal' ? (
                    <AppButton
                      label={c.t('games.nextQuestion')}
                      variant="outline"
                      disabled={!c.isHost}
                      onPress={c.nextTrivia}
                    />
                  ) : null}
                </>
              ) : null}
              <View style={styles.setupLines}>
                <AppText variant="bodyStrong">
                  {c.t('games.leaderboard')}
                </AppText>
                {c.triviaLeaderboard.map(score => (
                  <View key={score.playerId} style={styles.playerRow}>
                    <AppText variant="body">{score.name}</AppText>
                    <AppText variant="bodyStrong">{score.score}</AppText>
                  </View>
                ))}
              </View>
              {c.gameplay.round.phase === 'finished' && c.triviaWinner ? (
                <View style={styles.resultBox}>
                  <AppText variant="subheading">
                    {c.t('games.triviaWinner', {
                      name: c.triviaWinner.name,
                    })}
                  </AppText>
                  {c.gameplay.round.settings.prize ? (
                    <AppText variant="body" color="textMuted">
                      {c.t('games.triviaPrizeAward', {
                        prize: c.gameplay.round.settings.prize,
                      })}
                    </AppText>
                  ) : null}
                </View>
              ) : null}
            </AppCard>
          ) : null}


          {c.gameplay.kind === 'quarter-mile' ? (
            <AppCard style={styles.card}>
              <AppText variant="subheading">
                {c.t('games.quarterMileSetup')}
              </AppText>
              {c.gameplay.state.phase === 'choose' && c.gameplay.state.known ? (
                <View style={styles.setupLines}>
                  <AppText variant="bodyStrong">
                    {c.t('games.quarterMileKnown')}:{' '}
                    {localizeText(c.gameplay.state.known.name, language)}
                  </AppText>
                  <AppText variant="body" color="textMuted">
                    {c.t('games.quarterMileHidden')}: ???
                  </AppText>
                  {c.quarterMileActivePlayerId === c.me?.id ? (
                    <View style={styles.setupLines}>
                      <AppButton
                        label={c.t('games.quarterMileTake')}
                        onPress={() => c.chooseQuarterMile('take')}
                      />
                      <AppButton
                        label={c.t('games.quarterMileLeave')}
                        variant="secondary"
                        onPress={() => c.chooseQuarterMile('leave')}
                      />
                    </View>
                  ) : (
                    <AppText variant="body" color="textMuted">
                      {c.t('games.quarterMileWaiting', {
                        name:
                          c.players.find(
                            p => p.id === c.quarterMileActivePlayerId,
                          )?.name ?? c.t('games.noPlayer'),
                      })}
                    </AppText>
                  )}
                </View>
              ) : null}
              {c.gameplay.state.phase === 'reveal' && c.gameplay.state.lastChoice ? (
                <View style={styles.resultBox}>
                  <AppText variant="bodyStrong">
                    {c.t('games.quarterMileRevealPair', {
                      name:
                        c.players.find(p => {
                          const choice =
                            c.gameplay && c.gameplay.kind === 'quarter-mile'
                              ? c.gameplay.state.lastChoice
                              : undefined;
                          return p.id === choice?.playerId;
                        })?.name ?? c.t('games.noPlayer'),
                      choice:
                        c.gameplay.state.lastChoice.choice === 'take'
                          ? c.t('games.quarterMileChoiceTake')
                          : c.t('games.quarterMileChoiceLeave'),
                    })}
                  </AppText>
                  <AppText variant="body">
                    {localizeText(c.gameplay.state.lastChoice.known.name, language)}{' '}
                    /{' '}
                    {localizeText(
                      c.gameplay.state.lastChoice.hidden.name,
                      language,
                    )}
                  </AppText>
                  {c.isHost ? (
                    <AppButton
                      label={c.t('games.quarterMileNextPair')}
                      onPress={c.nextQuarterMile}
                    />
                  ) : null}
                </View>
              ) : null}
              {c.gameplay.state.phase === 'finished' ? (
                <View style={styles.resultBox}>
                  <AppText variant="subheading">
                    {c.quarterMileWinner
                      ? c.t('games.quarterMileWinner', {
                          name:
                            c.players.find(
                              p => p.id === c.quarterMileWinner?.playerId,
                            )?.name ?? c.t('games.noPlayer'),
                        })
                      : c.t('games.quarterMileScores')}
                  </AppText>
                </View>
              ) : null}
              <AppText variant="bodyStrong">
                {c.t('games.quarterMileScores')}
              </AppText>
              {c.quarterMileScores.map(row => (
                <AppText key={row.playerId} variant="body" color="textMuted">
                  {c.players.find(p => p.id === row.playerId)?.name ??
                    row.playerId}
                  : {row.score}
                </AppText>
              ))}
            </AppCard>
          ) : null}

          {c.gameplay.kind === 'icebreakers' ? (
            <AppCard style={styles.card}>
              <AppText variant="caption" color="textMuted">
                {c.t('games.roundNumber', {
                  round: c.gameplay.current?.round ?? 1,
                })}
              </AppText>
              <AppText variant="heading">
                {c.gameplay.current?.player.name ?? c.t('games.noPlayer')}
              </AppText>
              <View style={styles.promptBox}>
                <AppText variant="subheading" align="center">
                  {c.canSeeIcebreakerPrompt
                    ? localizeText(c.gameplay.current?.prompt, language) ||
                      c.t('games.noPrompt')
                    : c.t('games.icebreakerPromptPrivate')}
                </AppText>
              </View>
              <AppButton
                label={c.t('games.nextPrompt')}
                disabled={!c.isHost}
                onPress={c.nextIcebreaker}
              />
            </AppCard>
          ) : null}
        </>
      ) : (
        <AppCard style={styles.card}>
          <AppText variant="subheading">{c.gameSummary.title}</AppText>
          <View style={styles.setupLines}>
            {c.gameSummary.lines.map(line => (
              <AppText key={line} variant="body" color="textMuted">
                {line}
              </AppText>
            ))}
          </View>
          {c.game.id === 'trivia-time' ? (
            <View style={styles.setupLines}>
              <AppText variant="bodyStrong">{c.t('games.choosePack')}</AppText>
              <View style={styles.wrapRow}>
                {c.triviaPacks.map(pack => (
                  <AppButton
                    key={pack.id}
                    label={localizeText(pack.name, language)}
                    size="sm"
                    fullWidth={false}
                    variant={
                      c.currentTriviaSettings.packId === pack.id
                        ? 'primary'
                        : 'secondary'
                    }
                    disabled={!c.isHost}
                    onPress={() => c.updateTriviaSetting('packId', pack.id)}
                  />
                ))}
              </View>
              <AppText variant="bodyStrong">
                {c.t('games.questionCount')}
              </AppText>
              <View style={styles.wrapRow}>
                {[5, 10, 15].map(count => (
                  <AppButton
                    key={count}
                    label={`${count}`}
                    size="sm"
                    fullWidth={false}
                    variant={
                      c.currentTriviaSettings.questionCount === count
                        ? 'primary'
                        : 'secondary'
                    }
                    disabled={!c.isHost}
                    onPress={() =>
                      c.updateTriviaSetting(
                        'questionCount',
                        count as 5 | 10 | 15,
                      )
                    }
                  />
                ))}
              </View>
              <AppText variant="bodyStrong">
                {c.t('games.timePerQuestion')}
              </AppText>
              <View style={styles.wrapRow}>
                {[10, 15, 20, 30].map(seconds => (
                  <AppButton
                    key={seconds}
                    label={c.t('games.secondsShort', { seconds })}
                    size="sm"
                    fullWidth={false}
                    variant={
                      c.currentTriviaSettings.secondsPerQuestion === seconds
                        ? 'primary'
                        : 'secondary'
                    }
                    disabled={!c.isHost}
                    onPress={() =>
                      c.updateTriviaSetting('secondsPerQuestion', seconds)
                    }
                  />
                ))}
              </View>
              <AppInput
                label={c.t('games.prize')}
                placeholder={c.t('games.prizePlaceholder')}
                value={c.currentTriviaSettings.prize ?? ''}
                editable={c.isHost}
                onChangeText={value =>
                  c.updateTriviaSetting('prize', value.trimStart())
                }
              />
            </View>
          ) : null}
        </AppCard>
      )}

      <View style={styles.buttonRow}>
        <AppButton
          label={
            c.current?.phase === 'in-game'
              ? c.t('games.inGame')
              : c.t('games.startGame')
          }
          disabled={!c.canStart || c.current?.phase === 'in-game'}
          onPress={c.start}
        />
        <AppButton
          label={c.t('games.leaveLobby')}
          variant="secondary"
          onPress={c.leave}
        />
      </View>
    </AppScreenTemplate>
  );
}
