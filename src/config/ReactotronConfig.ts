import Reactotron from 'reactotron-react-native';

import { attachDevLogger } from '../services/logger';

const reactotron = Reactotron.configure({ name: 'Lamma' })
  .useReactNative()
  .connect();

attachDevLogger(reactotron);

reactotron.display({
  name: 'LAMMA DEV SESSION',
  preview: 'Reactotron connected',
  value: { platform: 'react-native' },
});

export default reactotron;
