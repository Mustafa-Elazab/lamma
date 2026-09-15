import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  hasCompletedOnboarding,
  markOnboardingCompleted,
} from './core/onboardingStorage';

type OnboardingContextValue = {
  checked: boolean;
  completed: boolean;
  complete: () => Promise<void>;
};

const OnboardingContext = createContext<OnboardingContextValue | undefined>(
  undefined,
);

export function OnboardingProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const [checked, setChecked] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    let active = true;
    void hasCompletedOnboarding().then(value => {
      if (active) {
        setCompleted(value);
        setChecked(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const complete = useCallback(async () => {
    await markOnboardingCompleted();
    setCompleted(true);
  }, []);

  const value = useMemo<OnboardingContextValue>(
    () => ({ checked, completed, complete }),
    [checked, completed, complete],
  );

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboardingContext(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error(
      'useOnboardingContext must be used within an OnboardingProvider',
    );
  }
  return ctx;
}
