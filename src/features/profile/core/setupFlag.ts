import AsyncStorage from '@react-native-async-storage/async-storage';

const key = (uid: string) => `lamma.profileSetup.done.${uid}`;

/** Local mirror of `setupCompleted` so the gate never waits on the network. */
export async function hasCompletedProfileSetup(uid: string): Promise<boolean> {
  return (await AsyncStorage.getItem(key(uid))) === '1';
}

export async function markProfileSetupCompleted(uid: string): Promise<void> {
  await AsyncStorage.setItem(key(uid), '1');
}
