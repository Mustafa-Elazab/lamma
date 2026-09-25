import React, { useMemo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppAvatar } from '../../../../design-system/atoms/Avatar';
import { AppIcon } from '../../../../design-system/atoms/Icon';
import { AppText } from '../../../../design-system/atoms/Text';
import { AppListItem } from '../../../../design-system/molecules/ListItem';
import { useTheme } from '../../../../design-system/theme/ThemeProvider';
import { HomeHeader } from '../../../home/components/HomeHeader';
import { createStyles } from './styles';
import type {} from './types';
import { useProfileController } from './useController';

export function ProfileScreen(): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const c = useProfileController();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HomeHeader greetingName={c.name.split(' ')[0]} avatar={c.avatar} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <AppText variant="heading">{c.t('profile.title')}</AppText>
          <AppText variant="body" color="textMuted">
            {c.t('profile.subtitle')}
          </AppText>
        </View>

        <View style={styles.group}>
          <View style={[styles.profileCard, styles.cardPad]}>
            <AppAvatar source={c.avatar} name={c.name} size={64} showStatus />
            <View style={styles.profileText}>
              <AppText variant="subheading">{c.name}</AppText>
              <AppText variant="caption" color="textMuted">
                {c.isGuest
                  ? c.t('profile.upgradePrompt')
                  : `${c.hostedCount === 1 ? c.t('profile.oneHostedEvent') : c.t('profile.hostedEvents', {
                      count: c.hostedCount,
                    })}  ·  ${c.t('profile.joined', { count: 37 })}`}
              </AppText>
              <AppText variant="caption" color="primary">
                {c.email ?? c.t('settings.defaultBio')}
              </AppText>
            </View>
            <Pressable
              style={styles.editButton}
              accessibilityRole="button"
              accessibilityLabel={
                c.isGuest ? c.t('common.signIn') : c.t('settings.editProfile')
              }
              hitSlop={8}
              onPress={c.goEditProfile}
            >
              <AppIcon
                name={c.isGuest ? 'user-check' : 'edit'}
                size={16}
                color="primary"
              />
              <AppText variant="label" color="primary">
                {c.isGuest ? c.t('common.signIn') : c.t('common.edit')}
              </AppText>
            </Pressable>
          </View>
        </View>

        <View style={styles.group}>
          <AppListItem
            title={c.t('profile.language')}
            subtitle={c.languageLabel}
            leadingIcon="language"
            showChevron
            onPress={c.goLanguage}
          />
          <View style={styles.divider} />
          <AppListItem
            title={c.t('profile.notifications')}
            subtitle={c.t('profile.notificationsHint')}
            leadingIcon="bell"
            leadingIconColor="warning"
            showChevron
            onPress={c.goNotifications}
          />
          <View style={styles.divider} />
          <AppListItem
            title={c.t('profile.appearance')}
            subtitle={c.appearanceLabel}
            leadingIcon="sun"
            leadingIconColor="warning"
            showChevron
            onPress={c.goAppearance}
          />
        </View>

        <View style={styles.group}>
          <AppListItem
            title={c.t('profile.myDrafts')}
            subtitle={c.t('profile.myDraftsHint')}
            leadingIcon="draft"
            leadingIconColor="success"
            showChevron
            onPress={c.goDrafts}
          />
        </View>

        <View style={styles.group}>
          <AppListItem
            title={c.t('info.aboutTitle')}
            subtitle={c.t('info.aboutHint')}
            leadingIcon="heart"
            showChevron
            onPress={c.goAbout}
          />
          <View style={styles.divider} />
          <AppListItem
            title={c.t('info.contactTitle')}
            subtitle={c.t('info.contactHint')}
            leadingIcon="comment"
            showChevron
            onPress={c.goContact}
          />
          <View style={styles.divider} />
          <AppListItem
            title={c.t('info.termsTitle')}
            subtitle={c.t('info.termsHint')}
            leadingIcon="draft"
            showChevron
            onPress={c.goTerms}
          />
          <View style={styles.divider} />
          <AppListItem
            title={c.t('info.privacyTitle')}
            subtitle={c.t('info.privacyHint')}
            leadingIcon="shield"
            leadingIconColor="success"
            showChevron
            onPress={c.goPrivacy}
          />
        </View>

        <View style={styles.group}>
          <AppListItem
            title={c.t('profile.help')}
            subtitle={c.t('profile.helpHint')}
            leadingIcon="help"
            showChevron
            onPress={c.goHelp}
          />
          <View style={styles.divider} />
          <AppListItem
            title={c.t('profile.signOut')}
            subtitle={c.t('profile.signOutHint')}
            leadingIcon="logout"
            leadingIconColor="error"
            onPress={() => void c.signOut()}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
