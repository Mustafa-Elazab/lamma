import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { getAuthRepository } from './core/authRepository';
import type { AuthStatus, AuthUser } from './core/entity';

export type SignInProvider = 'google' | 'apple' | 'guest';

type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  isSigningIn: boolean;
  activeProvider: SignInProvider | null;
  error: string | null;
  isAppleSupported: boolean;
  continueAsGuest: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const repository = useMemo(() => getAuthRepository(), []);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [activeProvider, setActiveProvider] = useState<SignInProvider | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    const unsubscribe = repository.subscribe(nextUser => {
      if (!mounted.current) {
        return;
      }
      setUser(nextUser);
      setStatus(nextUser ? 'authenticated' : 'unauthenticated');
    });
    return () => {
      mounted.current = false;
      unsubscribe();
    };
  }, [repository]);

  const run = useCallback(
    async (provider: SignInProvider, action: () => Promise<unknown>) => {
      setActiveProvider(provider);
      setError(null);
      try {
        await action();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'auth.errorGeneric';
        setError(message);
      } finally {
        if (mounted.current) {
          setActiveProvider(null);
        }
      }
    },
    [],
  );

  const continueAsGuest = useCallback(
    () => run('guest', () => repository.signInAnonymously()),
    [repository, run],
  );
  const signInWithGoogle = useCallback(
    () => run('google', () => repository.signInWithGoogle()),
    [repository, run],
  );
  const signInWithApple = useCallback(
    () => run('apple', () => repository.signInWithApple()),
    [repository, run],
  );
  const signOut = useCallback(async () => {
    await repository.signOut();
  }, [repository]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      isSigningIn: activeProvider !== null,
      activeProvider,
      error,
      isAppleSupported: repository.isAppleSupported(),
      continueAsGuest,
      signInWithGoogle,
      signInWithApple,
      signOut,
      clearError: () => setError(null),
    }),
    [
      status,
      user,
      activeProvider,
      error,
      repository,
      continueAsGuest,
      signInWithGoogle,
      signInWithApple,
      signOut,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
