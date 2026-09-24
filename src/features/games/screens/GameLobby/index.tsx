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
          {c.gameplay.kind === 'imposter' && c.imposter ? (
            <AppCard style={styles.card}>
              <View style={styles.rowBetween}>
                <AppText variant="caption" color="textMuted">
                  {c.t('games.imposterRound', { round: c.imposter.round })}
                </AppText>
                <AppText variant="caption" color="textMuted">
                  {c.t('games.imposterCategory', {
                    category: localizeText(c.imposter.categoryName, language),
                  })}
                </AppText>
              </View>
              <View style={styles.promptBox}>
                {!c.amInImposterRound ? (
                  <AppText variant="subheading" align="center">
                    {c.t('games.imposterNotIn')}
                  </AppText>
                ) : c.amImposter ? (
                  <>
                    <AppText variant="heading" align="center">
                      {c.t('games.imposterYouAre')}
                    </AppText>
                    <AppText variant="body" color="textMuted" align="center">
                      {c.t('games.imposterYouAreHint')}
                    </AppText>
                  </>
                ) : (
                  <>
                    <AppText variant="caption" color="textMuted" align="center">
                      {c.t('games.imposterYourWord')}
                    </AppText>
                    <AppText variant="heading" align="center">
                      {localizeText(c.imposter.word, language)}
                    </AppText>
                  </>
                )}
              </View>

              {c.imposter.phase === 'clues' ? (
                <View style={styles.setupLines}>
                  <AppText variant="bodyStrong">{c.t('games.imposterCluesTitle')}</AppText>
                  <AppText variant="body" color="textMuted">
                    {c.t('games.imposterCluesHint')}
                  </AppText>
                  {c.imposter.playerIds.map((id, index) => (
                    <AppText key={id} variant="body">
                      {index + 1}. {c.imposter?.playerNames[id] ?? id}
                      {id === c.localPlayerId ? ' ⭐' : ''}
                    </AppText>
                  ))}
                  {c.isHost ? (
                    <AppButton label={c.t('games.imposterStartVote')} onPress={c.openImposterVote} />
                  ) : (
                    <AppText variant="body" color="textMuted">
                      {c.t('games.waitingForHost')}
                    </AppText>
                  )}
                </View>
              ) : null}

              {c.imposter.phase === 'vote' ? (
                <View style={styles.setupLines}>
                  <AppText variant="bodyStrong">{c.t('games.imposterVoteTitle')}</AppText>
                  {c.amInImposterRound && !c.myImposterVote && !c.myPendingImposterVote ? (
                    c.imposter.playerIds
                      .filter(id => id !== c.localPlayerId)
                      .map(id => (
                        <AppButton
                          key={id}
                          label={c.imposter?.playerNames[id] ?? id}
                          variant="secondary"
                          onPress={() => c.voteImposter(id)}
                        />
                      ))
                  ) : (
                    <AppText variant="body" color="textMuted">
                      {c.t('games.imposterVoted', {
                        count: Object.keys(c.imposter.votes).length,
                        total: c.imposter.playerIds.length,
                      })}
                    </AppText>
                  )}
                  {c.isHost ? (
                    <AppButton
                      label={c.t('games.imposterRevealVotes')}
                      variant="outline"
                      onPress={c.revealImposter}
                    />
                  ) : null}
                </View>
              ) : null}

              {c.imposter.phase === 'guess' ? (
                <View style={styles.setupLines}>
                  {c.amImposter ? (
                    <>
                      <AppText variant="bodyStrong">{c.t('games.imposterGuessYou')}</AppText>
                      {(c.imposter.guessOptions ?? []).map(option => (
                        <AppButton
                          key={option.id}
                          label={localizeText(option.word, language)}
                          variant="secondary"
                          disabled={c.myPendingImposterGuess}
                          onPress={() => c.guessImposterWord(option.id)}
                        />
                      ))}
                    </>
                  ) : (
                    <AppText variant="bodyStrong">
                      {c.t('games.imposterGuessWaiting', {
                        name: c.imposter.playerNames[c.imposter.imposterId] ?? '',
                      })}
                    </AppText>
                  )}
                  {c.isHost && !c.amImposter ? (
                    <AppButton
                      label={c.t('games.imposterSkipGuess')}
                      variant="outline"
                      onPress={c.skipGuess}
                    />
                  ) : null}
                </View>
              ) : null}

              {c.imposter.phase === 'result' ? (
                <View style={styles.resultBox}>
                  <AppText variant="subheading">
                    {c.imposter.winner === 'players'
                      ? c.t('games.imposterPlayersWin', {
                          name: c.imposter.playerNames[c.imposter.imposterId] ?? '',
                        })
                      : c.t('games.imposterWins', {
                          name: c.imposter.playerNames[c.imposter.imposterId] ?? '',
                        })}
                  </AppText>
                  <AppText variant="body" color="textMuted">
                    {c.imposter.tie
                      ? c.t('games.imposterTie')
                      : c.imposter.votedOutId && c.imposter.votedOutId !== c.imposter.imposterId
                        ? c.t('games.imposterWrongOut', {
                            name: c.imposter.playerNames[c.imposter.votedOutId] ?? '',
                          })
                        : c.imposter.guessWordId
                          ? c.imposter.guessWordId === c.imposter.wordId
                            ? c.t('games.imposterGuessedRight', {
                                name: c.imposter.playerNames[c.imposter.imposterId] ?? '',
                              })
                            : c.t('games.imposterGuessedWrong', {
                                name: c.imposter.playerNames[c.imposter.imposterId] ?? '',
                              })
                          : ''}
                  </AppText>
                  <AppText variant="bodyStrong">
                    {c.t('games.imposterWordWas', {
                      word: localizeText(c.imposter.word, language),
                    })}
                  </AppText>
                  {c.imposterVoteCounts.map(row => (
                    <AppText key={row.playerId} variant="body" color="textMuted">
                      {c.t('games.imposterVotesFor', { name: row.name, count: row.count })}
                    </AppText>
                  ))}
                  {c.isHost ? (
                    <AppButton
                      label={c.t('games.imposterNextRound')}
                      disabled={!c.canStartNext}
                      onPress={c.start}
                    />
                  ) : (
                    <AppText variant="body" color="textMuted">
                      {c.t('games.waitingForHost')}
                    </AppText>
                  )}
                </View>
              ) : null}

              <View style={styles.setupLines}>
                <AppText variant="bodyStrong">{c.t('games.imposterScores')}</AppText>
                {c.imposterLeaderboard.map(row => (
                  <View key={row.playerId} style={styles.playerRow}>
                    <AppText variant="body">{row.name}</AppText>
                    <AppText variant="bodyStrong">{row.score}</AppText>
                  </View>
                ))}
              </View>
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
                      {c.triviaSecondsLeft !== null
                        ? c.t('games.triviaTimeLeft', { seconds: c.triviaSecondsLeft })
                        : c.t('games.triviaAnswered', {
                            count: c.triviaAnsweredCount,
                            total: c.connectedPlayers.length,
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
                  {c.gameplay.round.phase === 'question' &&
                  (myTriviaAnswer || c.myPendingTriviaAnswer) ? (
                    <AppText variant="body" color="textMuted">
                      {c.t('games.triviaYouAnswered')}
                    </AppText>
                  ) : null}
                  {c.isHost && c.gameplay.round.phase === 'question' ? (
                    <AppButton
                      label={c.t('games.revealAnswer')}
                      variant="outline"
                      onPress={c.revealTrivia}
                    />
                  ) : c.isHost && c.gameplay.round.phase === 'reveal' ? (
                    <AppButton
                      label={c.t('games.nextQuestion')}
                      variant="outline"
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
                  {c.isHost ? (
                    <AppButton
                      label={c.t('games.playAgain')}
                      disabled={!c.canStartNext}
                      onPress={c.start}
                    />
                  ) : (
                    <AppText variant="body" color="textMuted">
                      {c.t('games.waitingForHost')}
                    </AppText>
                  )}
                </View>
              ) : null}
            </AppCard>
          ) : null}


          {c.gameplay.kind === 'quarter-mile' ? (
            <AppCard style={styles.card}>
              <AppText variant="subheading">
                {c.t('games.quarterMileSetup')}
              </AppText>
              {c.quarterMileSpectator ? (
                <AppText variant="body" color="textMuted">
                  {c.t('games.spectatorQuarterMile')}
                </AppText>
              ) : null}
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
                  ) : (
                    <AppText variant="body" color="textMuted">
                      {c.t('games.waitingForHost')}
                    </AppText>
                  )}
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
                  {c.isHost ? (
                    <AppButton
                      label={c.t('games.playAgain')}
                      disabled={!c.canStartNext}
                      onPress={c.start}
                    />
                  ) : null}
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
              {c.canSeeIcebreakerPrompt ? (
                <>
                  <AppText variant="body" color="textMuted" align="center">
                    {c.t('games.icebreakerYourTurn')}
                  </AppText>
                  <AppButton
                    label={c.t('games.icebreakerDone')}
                    disabled={c.myPendingIcebreakerNext}
                    onPress={c.finishIcebreakerTurn}
                  />
                </>
              ) : (
                <AppText variant="body" color="textMuted" align="center">
                  {c.t('games.icebreakerWaiting', {
                    name: c.gameplay.current?.player.name ?? c.t('games.noPlayer'),
                  })}
                </AppText>
              )}
              {c.isHost && !c.canSeeIcebreakerPrompt ? (
                <AppButton
                  label={c.t('games.nextPrompt')}
                  variant="outline"
                  onPress={c.nextIcebreaker}
                />
              ) : null}
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
          {c.connectedPlayers.length < c.requiredConnectedPlayers ? (
            <AppText variant="bodyStrong">
              {c.t('games.needPlayers', {
                count: c.requiredConnectedPlayers,
                have: c.connectedPlayers.length,
              })}
            </AppText>
          ) : !c.isHost ? (
            <AppText variant="bodyStrong">{c.t('games.waitingForHostStart')}</AppText>
          ) : null}
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
        {c.isHost && c.current?.phase !== 'in-game' ? (
          <AppButton
            label={c.t('games.startGame')}
            disabled={!c.canStart}
            onPress={c.start}
          />
        ) : null}
        <AppButton
          label={c.t('games.leaveLobby')}
          variant="secondary"
          onPress={c.leave}
        />
      </View>
    </AppScreenTemplate>
  );
}
