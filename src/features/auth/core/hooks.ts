import { useCallback, useEffect, useState } from 'react';

import {
  hasCompletedOnboarding,
  markOnboardingCompleted,
} from './onboardingStorage';

type OnboardingState = {
  checked: boolean;
  completed: boolean;
  complete: () => Promise<void>;
};

export function useOnboarding(): OnboardingState {
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

  return { checked, completed, complete };
}
