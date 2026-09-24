import { Linking, NativeModules, Platform } from 'react-native';

import {
  asFileUrl,
  ANDROID_PLAY_STORE_PACKAGE,
  isShareTargetMissing,
  openStoreListing,
  shareWhatsAppNative,
  WHATSAPP_MARKET_URL,
  WHATSAPP_PLAY_STORE_URL,
  whatsappStoreUrls,
} from '../shareTarget';

describe('shareTarget', () => {
  it('uses the Play Store listing on Android, never a wa.me web share', () => {
    const urls = whatsappStoreUrls('android');
    expect(urls.primary).toBe(WHATSAPP_MARKET_URL);
    expect(urls.fallback).toBe(WHATSAPP_PLAY_STORE_URL);
    expect(urls.primary).not.toContain('wa.me');
    expect(urls.fallback).not.toContain('wa.me');
  });

  it('uses the App Store listing on iOS, never a wa.me web share', () => {
    const urls = whatsappStoreUrls('ios');
    expect(urls.primary).toContain('itunes.apple.com');
    expect(urls.fallback).toContain('apps.apple.com');
    expect(urls.primary).not.toContain('wa.me');
    expect(urls.fallback).not.toContain('wa.me');
  });

  it('treats react-native-share missing-app errors as store fallback', () => {
    expect(isShareTargetMissing(new Error('User did not share'))).toBe(false);
    expect(isShareTargetMissing(new Error('Not installed'))).toBe(true);
    expect(
      isShareTargetMissing({ message: 'Application is not installed' }),
    ).toBe(true);
    expect(isShareTargetMissing({ error: 'NOTINSTALLED' })).toBe(true);
    expect(isShareTargetMissing({ code: 'activity not found' })).toBe(true);
  });

  it('normalizes capture paths to file URLs for share payloads', () => {
    expect(asFileUrl('/data/invite.png')).toBe('file:///data/invite.png');
    expect(asFileUrl('file:///data/invite.png')).toBe('file:///data/invite.png');
  });

  it('shares natively when WhatsApp is installed', async () => {
    const shareSingle = jest.fn(async () => undefined);
    const openStore = jest.fn(async () => undefined);
    await expect(
      shareWhatsAppNative({
        shareSingle,
        social: 'whatsapp',
        message: 'You are invited',
        url: 'file:///tmp/invite.png',
        openStore,
      }),
    ).resolves.toBe('shared');
    expect(shareSingle).toHaveBeenCalledWith({
      social: 'whatsapp',
      message: 'You are invited',
      url: 'file:///tmp/invite.png',
      type: 'image/png',
    });
    expect(openStore).not.toHaveBeenCalled();
  });

  it('opens the store listing when WhatsApp is not installed', async () => {
    const shareSingle = jest.fn(async () => {
      throw new Error('Not installed');
    });
    const openStore = jest.fn(async () => undefined);
    await expect(
      shareWhatsAppNative({
        shareSingle,
        social: 'whatsapp',
        message: 'You are invited',
        url: 'file:///tmp/invite.png',
        openStore,
      }),
    ).resolves.toBe('store');
    expect(openStore).toHaveBeenCalledTimes(1);
  });

  it('targets Google Play directly on Android before falling back to a generic URL', async () => {
    const originalOS = Platform.OS;
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      value: 'android',
    });
    NativeModules.NativeIntent = {
      openUrlInPackage: jest.fn(async () => undefined),
    };
    Linking.openURL = jest.fn(async () => undefined);

    await openStoreListing(whatsappStoreUrls('android'));

    expect(NativeModules.NativeIntent.openUrlInPackage).toHaveBeenCalledWith(
      WHATSAPP_PLAY_STORE_URL,
      ANDROID_PLAY_STORE_PACKAGE,
    );
    expect(Linking.openURL).not.toHaveBeenCalled();
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      value: originalOS,
    });
  });
});
