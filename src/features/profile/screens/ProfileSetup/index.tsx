import React, { useMemo } from 'react';
import { Image, Pressable, View } from 'react-native';

import { AppButton } from '../../../../design-system/atoms/Button';
import { AppIcon } from '../../../../design-system/atoms/Icon';
import { AppInput } from '../../../../design-system/atoms/Input';
import { AppText } from '../../../../design-system/atoms/Text';
import { AppScreenTemplate } from '../../../../design-system/templates/ScreenTemplate';
import { useTheme } from '../../../../design-system/theme/ThemeProvider';
import { createStyles } from './styles';
import { useProfileSetupController } from './useController';

type Props = {
  /** Called after the user saves or skips; the root gate then shows the app. */
  onDone: () => void;
};

export function ProfileSetupScreen({ onDone }: Props): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const c = useProfileSetupController(onDone);

  return (
    <AppScreenTemplate contentStyle={styles.content} testID="profile-setup">
      <View style={styles.headerBlock}>
        <AppText variant="heading" align="center">
          {c.t('profileSetup.title')}
        </AppText>
        <AppText variant="body" color="textMuted" align="center">
          {c.t('profileSetup.subtitle')}
        </AppText>
      </View>

      <View style={styles.photoBlock}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={c.t('profileSetup.addPhoto')}
          onPress={() => void c.choosePhoto()}
          style={styles.photoButton}
        >
          {c.photo ? (
            <Image source={{ uri: c.photo }} style={styles.photo} />
          ) : (
            <AppIcon name="photos" size={36} color="primary" />
          )}
        </Pressable>
        <View style={styles.photoActions}>
          <Pressable hitSlop={8} onPress={() => void c.choosePhoto()}>
            <AppText variant="label" color="primary">
              {c.photo
                ? c.t('profileSetup.changePhoto')
                : c.t('profileSetup.addPhoto')}
            </AppText>
          </Pressable>
          {c.photo ? (
            <Pressable hitSlop={8} onPress={c.removePhoto}>
              <AppText variant="label" color="textMuted">
                {c.t('profileSetup.removePhoto')}
              </AppText>
            </Pressable>
          ) : null}
        </View>
      </View>

      <AppInput
        label={c.t('profile.displayNameLabel')}
        placeholder={c.t('profile.displayNamePlaceholder')}
        value={c.name}
        onChangeText={c.setName}
        leftIcon="profile"
        maxLength={40}
        returnKeyType="done"
      />

      {c.error ? (
        <AppText variant="caption" color="error">
          {c.error}
        </AppText>
      ) : null}

      <View style={styles.actions}>
        <AppButton
          label={c.t('profileSetup.save')}
          onPress={() => void c.save()}
          loading={c.saving}
          disabled={!c.canSave}
        />
        <AppButton
          label={c.t('profileSetup.skip')}
          variant="ghost"
          onPress={() => void c.skip()}
          disabled={c.saving}
        />
      </View>
    </AppScreenTemplate>
  );
}
