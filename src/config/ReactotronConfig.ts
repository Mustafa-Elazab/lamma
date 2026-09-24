import Reactotron from 'reactotron-react-native';
import { NativeModules } from 'react-native';

import { attachDevLogger } from '../services/logger';

function metroHostFromScriptUrl(): string | undefined {
  const scriptURL = (NativeModules.SourceCode as { scriptURL?: string } | undefined)
    ?.scriptURL;
  if (!scriptURL) {
    return undefined;
  }
  const match = scriptURL.match(/^[a-z]+:\/\/([^/:]+)/i);
  const host = match?.[1];
  if (!host || host === 'localhost' || host === '127.0.0.1') {
    return undefined;
  }
  return host;
}

const reactotronHost = metroHostFromScriptUrl();

const reactotron = Reactotron.configure({
  name: 'Lamma',
  ...(reactotronHost ? { host: reactotronHost } : {}),
})
  .useReactNative()
  .connect();

attachDevLogger(reactotron);

reactotron.display({
  name: 'LAMMA DEV SESSION',
  preview: 'Reactotron connected',
  value: { platform: 'react-native', host: reactotronHost ?? 'default' },
});

export default reactotron;
