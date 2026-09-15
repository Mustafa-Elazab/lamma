import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'lamma.onboarding.completed';

export async function hasCompletedOnboarding(): Promise<boolean> {
  const value = await AsyncStorage.getItem(KEY);
  return value === 'true';
}

export async function markOnboardingCompleted(): Promise<void> {
  await AsyncStorage.setItem(KEY, 'true');
}

export async function resetOnboarding(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
