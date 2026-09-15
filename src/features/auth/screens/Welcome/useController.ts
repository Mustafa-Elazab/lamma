import { useAuth } from '../../AuthProvider';

export function useWelcomeController() {
  const {
    continueAsGuest,
    signInWithGoogle,
    signInWithApple,
    isAppleSupported,
    isSigningIn,
    activeProvider,
    error,
  } = useAuth();

  return {
    continueAsGuest,
    signInWithGoogle,
    signInWithApple,
    isAppleSupported,
    isSigningIn,
    activeProvider,
    error,
  };
}
