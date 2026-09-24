type ShareApi = {
  open: (options: {
    title?: string;
    message?: string;
    url?: string;
    type?: string;
    failOnCancel?: boolean;
  }) => Promise<{ success?: boolean }>;
  shareSingle: (options: {
    social: string;
    message?: string;
    url?: string;
    type?: string;
  }) => Promise<unknown>;
  Social?: { WHATSAPP?: string };
};

/**
 * react-native-share's RN entry evaluates NativeRNShare.getConstants() at
 * import time. If the native module is missing, that throws and the whole
 * ShareInvite controller module becomes undefined — which surfaces as
 * `Cannot read property 'useShareInviteController' of undefined`.
 */
export function loadShareApi(): ShareApi | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('react-native-share') as {
      default?: ShareApi;
    } & ShareApi;
    const api = mod.default ?? mod;
    if (typeof api.open !== 'function' || typeof api.shareSingle !== 'function') {
      return null;
    }
    return api;
  } catch {
    return null;
  }
}

export function whatsappSocial(api: ShareApi | null): string {
  return api?.Social?.WHATSAPP ?? 'whatsapp';
}
