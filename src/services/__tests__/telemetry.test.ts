import * as analyticsSdk from '@react-native-firebase/analytics';
import * as crashlyticsSdk from '@react-native-firebase/crashlytics';

import {
  setAnalyticsIdentity,
  toAnalyticsParams,
  trackEvent,
  trackScreen,
} from '../analytics';
import {
  createGlobalErrorHandler,
  crashCollectionEnabled,
  normalizeError,
  onUnhandledRejection,
  reportError,
  setCrashIdentity,
  stringAttributes,
} from '../crashReporting';

const logEvent = analyticsSdk.logEvent as unknown as jest.Mock;
const recordError = crashlyticsSdk.recordError as unknown as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'info').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('analytics service', () => {
  it('logs typed events with string/number params only', async () => {
    await trackEvent('game_start', {
      game_id: 'quarter-mile',
      pack_id: undefined,
      players: 2,
    });
    expect(logEvent).toHaveBeenCalledWith(expect.anything(), 'game_start', {
      game_id: 'quarter-mile',
      players: 2,
    });
    await trackEvent('profile_setup_complete', {
      has_name: true,
      has_photo: false,
      skipped: false,
    });
    expect(logEvent).toHaveBeenLastCalledWith(
      expect.anything(),
      'profile_setup_complete',
      { has_name: 1, has_photo: 0, skipped: 0 },
    );
  });

  it('logs screen_view', async () => {
    await trackScreen('GameLobby');
    expect(logEvent).toHaveBeenCalledWith(expect.anything(), 'screen_view', {
      screen_name: 'GameLobby',
      screen_class: 'GameLobby',
    });
  });

  it('sets the user id and properties', async () => {
    await setAnalyticsIdentity({
      userId: 'uid-1',
      accountType: 'guest',
      language: 'ar',
    });
    expect(analyticsSdk.setUserId).toHaveBeenCalledWith(expect.anything(), 'uid-1');
    expect(analyticsSdk.setUserProperties).toHaveBeenCalledWith(
      expect.anything(),
      { account_type: 'guest', app_language: 'ar' },
    );
  });

  it('never throws when the native module fails', async () => {
    logEvent.mockImplementationOnce(() => Promise.reject(new Error('boom')));
    await expect(
      trackEvent('join_room', { game_id: 'imposter', source: 'code' }),
    ).resolves.toBeUndefined();
  });

  it('drops null/undefined params', () => {
    expect(toAnalyticsParams({ a: 'x', b: undefined, c: null, d: 0 })).toEqual({
      a: 'x',
      d: 0,
    });
  });
});

describe('crash reporting service', () => {
  it('is disabled in __DEV__ by default', () => {
    expect(crashCollectionEnabled()).toBe(false);
  });

  it('records non-fatal errors with attributes', () => {
    reportError(new Error('nope'), 'test.source', { eventId: 'e1' });
    expect(recordError).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ message: 'nope' }),
      'test.source',
    );
    expect(crashlyticsSdk.setAttributes).toHaveBeenCalledWith(
      expect.anything(),
      { source: 'test.source', eventId: 'e1' },
    );
  });

  it('global handler records the error and chains the previous handler', () => {
    const previous = jest.fn();
    const handler = createGlobalErrorHandler(previous);
    const error = new Error('render failed');
    handler(error, true);
    expect(recordError).toHaveBeenCalledWith(expect.anything(), error, 'js.fatal');
    expect(previous).toHaveBeenCalledWith(error, true);
  });

  it('global handler still chains when reporting throws', () => {
    recordError.mockImplementationOnce(() => {
      throw new Error('native down');
    });
    const previous = jest.fn();
    createGlobalErrorHandler(previous)('x', false);
    expect(previous).toHaveBeenCalledWith('x', false);
  });

  it('reports unhandled promise rejections as non-fatal', () => {
    onUnhandledRejection(1, 'plain string reason');
    expect(recordError).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ message: 'plain string reason' }),
      'js.unhandled-rejection',
    );
  });

  it('sets the Crashlytics user id and attributes', () => {
    setCrashIdentity({ userId: null, accountType: 'signed_out', language: 'en' });
    expect(crashlyticsSdk.setUserId).toHaveBeenCalledWith(expect.anything(), '');
    expect(crashlyticsSdk.setAttributes).toHaveBeenCalledWith(expect.anything(), {
      account_type: 'signed_out',
      language: 'en',
    });
  });

  it('normalizes odd error values and truncates long attributes', () => {
    expect(normalizeError(undefined).message).toBe('undefined');
    expect(normalizeError({ message: 'obj' }).message).toBe('obj');
    expect(stringAttributes({ long: 'x'.repeat(5000) }).long).toHaveLength(1000);
  });
});
