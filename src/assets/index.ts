import type { ImageSourcePropType } from 'react-native';

export { iconRegistry, type IconName } from './icons';

export const branding = {
  logo: require('./branding/lamma_logo_exact.png') as ImageSourcePropType,
  logo2x: require('./branding/lamma_logo_exact_2x.png') as ImageSourcePropType,
  logoTransparent: require('./branding/lamma_logo_exact_transparent.png') as ImageSourcePropType,
  appIcon: require('./branding/app_icon_source_1024.png') as ImageSourcePropType,
} as const;

export const onboardingImages = {
  onboarding01: require('./onboarding/onboarding_01.png') as ImageSourcePropType,
  onboarding02: require('./onboarding/onboarding_02.png') as ImageSourcePropType,
  onboarding03: require('./onboarding/onboarding_03.png') as ImageSourcePropType,
  onboarding04: require('./onboarding/onboarding_04.png') as ImageSourcePropType,
} as const;

export const eventThemeImages = {
  theme_wedding: require('./event-themes/theme_wedding.png') as ImageSourcePropType,
  theme_birthday: require('./event-themes/theme_birthday.png') as ImageSourcePropType,
  theme_dinner: require('./event-themes/theme_dinner.png') as ImageSourcePropType,
  theme_travel: require('./event-themes/theme_travel.png') as ImageSourcePropType,
  theme_generic: require('./event-themes/theme_generic.png') as ImageSourcePropType,
} as const;

export type EventThemeKey = keyof typeof eventThemeImages;

export const eventCoverImages = {
  wedding: require('./event-covers/wedding_cover.jpg') as ImageSourcePropType,
  birthday: require('./event-covers/birthday_cover.jpg') as ImageSourcePropType,
  dinner: require('./event-covers/dinner_cover.jpg') as ImageSourcePropType,
  trip: require('./event-covers/trip_cover.jpg') as ImageSourcePropType,
} as const;

export type EventCoverKey = keyof typeof eventCoverImages;

export const shareImages = {
  cardBackground: require('./share-event/share_card_background.png') as ImageSourcePropType,
  header: require('./share-event/share_header.png') as ImageSourcePropType,
  footer: require('./share-event/share_footer.png') as ImageSourcePropType,
} as const;

export const illustrationImages = {
  party: require('./illustrations/illustration_party.png') as ImageSourcePropType,
  friends: require('./illustrations/illustration_friends.png') as ImageSourcePropType,
  travel: require('./illustrations/illustration_travel.png') as ImageSourcePropType,
  planning: require('./illustrations/illustration_planning.png') as ImageSourcePropType,
} as const;

export const backgroundImages = {
  gradient01: require('./backgrounds/bg_gradient_01.png') as ImageSourcePropType,
  gradient02: require('./backgrounds/bg_gradient_02.png') as ImageSourcePropType,
  gradient03: require('./backgrounds/bg_gradient_03.png') as ImageSourcePropType,
  blur: require('./backgrounds/bg_blur.png') as ImageSourcePropType,
  pattern: require('./backgrounds/bg_pattern.png') as ImageSourcePropType,
} as const;

export const headerImages = {
  events: require('./headers/header_events.png') as ImageSourcePropType,
  celebrate: require('./headers/header_celebrate.png') as ImageSourcePropType,
  /** Small tileable Egypt-inspired motif used as a header pattern. */
  egyptMotif: require('./headers/header_egypt_motif_exact.png') as ImageSourcePropType,
  egyptMotif2x: require('./headers/header_egypt_motif_exact_2x.png') as ImageSourcePropType,
  /** Wide banner chrome for the Share Invite screen. */
  share: require('./headers/share_header.png') as ImageSourcePropType,
} as const;

export const footerImages = {
  share: require('./footers/share_footer.png') as ImageSourcePropType,
  shareExact: require('./footers/share_footer_exact.png') as ImageSourcePropType,
  shareExact2x: require('./footers/share_footer_exact_2x.png') as ImageSourcePropType,
} as const;

export const decorationImages = {
  egyptMotif: require('./decorations/header_egypt_motif_exact.png') as ImageSourcePropType,
  egyptMotif2x: require('./decorations/header_egypt_motif_exact_2x.png') as ImageSourcePropType,
  shareFooter: require('./decorations/share_footer_exact.png') as ImageSourcePropType,
  shareFooter2x: require('./decorations/share_footer_exact_2x.png') as ImageSourcePropType,
} as const;

export const miscImages = {
  heart: require('./misc/heart.png') as ImageSourcePropType,
  confetti: require('./misc/confetti.png') as ImageSourcePropType,
  leaves: require('./misc/leaves.png') as ImageSourcePropType,
  balloons: require('./misc/balloons.png') as ImageSourcePropType,
} as const;

export const splashImages = {
  splashScreen: require('./splash/splash_screen.png') as ImageSourcePropType,
  launchScreen: require('./splash/launch_screen.png') as ImageSourcePropType,
  bootsplashBackground: require('./splash/bootsplash_background.png') as ImageSourcePropType,
} as const;
