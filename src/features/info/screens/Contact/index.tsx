import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '../../../../design-system/atoms/Button';
import { AppIcon } from '../../../../design-system/atoms/Icon';
import { AppText } from '../../../../design-system/atoms/Text';
import { useTheme } from '../../../../design-system/theme/ThemeProvider';
import type { Theme } from '../../../../design-system/theme/tokens';
import { InfoPageTemplate } from '../../components/InfoPageTemplate';
import { useContactController } from './useController';

export function ContactScreen(): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const c = useContactController();
  return (
    <InfoPageTemplate
      testID="contact-screen"
      title={c.t('info.contactTitle')}
      intro={c.t('info.contact.intro')}
      sections={c.sections}
    >
      <View style={styles.card}>
        <View style={styles.row}>
          <AppIcon name="comment" size={22} color="primary" />
          <View style={styles.text}>
            <AppText variant="caption" color="textMuted">
              {c.t('info.contact.emailLabel')}
            </AppText>
            <AppText variant="bodyStrong" selectable>
              {c.email}
            </AppText>
          </View>
        </View>
        <AppButton
          label={c.t('info.contact.sendEmail')}
          size="md"
          onPress={() => void c.sendEmail()}
        />
        <AppText variant="caption" color="textMuted" align="center">
          {c.t('info.contact.responseTime')}
        </AppText>
      </View>
    </InfoPageTemplate>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    card: {
      gap: theme.spacing.md,
      backgroundColor: theme.colors.surfaceSoft,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.lg,
    },
    row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
    text: { flex: 1, gap: 2 },
  });
}
