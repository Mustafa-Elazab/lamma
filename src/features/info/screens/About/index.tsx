import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { branding } from '../../../../assets';
import { AppButton } from '../../../../design-system/atoms/Button';
import { AppText } from '../../../../design-system/atoms/Text';
import { InfoPageTemplate } from '../../components/InfoPageTemplate';
import { useAboutController } from './useController';

export function AboutScreen(): React.ReactElement {
  const c = useAboutController();
  return (
    <InfoPageTemplate
      testID="about-screen"
      title={c.t('info.aboutTitle')}
      intro={c.t('info.about.intro')}
      sections={c.sections}
      meta={c.version}
    >
      <View style={styles.brand}>
        <Image
          source={branding.logoTransparent}
          style={styles.logo}
          resizeMode="contain"
        />
        <AppText variant="subheading" color="primary">
          {c.t('info.about.tagline')}
        </AppText>
      </View>
      <AppButton
        label={c.t('info.openWebsite')}
        variant="outline"
        size="md"
        leftIcon="link"
        onPress={c.openWebsite}
      />
    </InfoPageTemplate>
  );
}

const styles = StyleSheet.create({
  brand: { alignItems: 'center', gap: 8 },
  logo: { width: 160, height: 78 },
});
