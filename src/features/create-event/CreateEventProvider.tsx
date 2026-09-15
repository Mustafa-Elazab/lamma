import { useQueryClient } from '@tanstack/react-query';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { trackEvent } from '../../services/analytics';
import { reportError } from '../../services/crashReporting';
import { useCreateEvent, type LammaEvent } from '../events';
import {
  createEmptyDraft,
  draftToCreateInput,
  isDraftEmpty,
  type EventDraft,
} from './core/draftEntity';
import { getDraftRepository } from './core/draftRepositoryFactory';
import { draftKeys } from './core/queryKeys';
import {
  canPublish,
  validateBasics,
  validateWhenWhere,
  type ValidationResult,
} from './core/validators';

type CreateEventContextValue = {
  draft: EventDraft;
  update: (patch: Partial<EventDraft>) => void;
  reset: () => void;
  basics: ValidationResult;
  whenWhere: ValidationResult;
  publishable: boolean;
  isPublishing: boolean;
  publishError: string | null;
  publish: () => Promise<LammaEvent | null>;
};

const CreateEventContext = createContext<CreateEventContextValue | undefined>(
  undefined,
);

function newDraftId(): string {
  return `draft_${Date.now().toString(36)}`;
}

export function CreateEventProvider({
  children,
  initialDraftId,
}: {
  children: React.ReactNode;
  /** When set, the wizard resumes this existing draft instead of a blank one. */
  initialDraftId?: string;
}): React.ReactElement {
  const repository = useMemo(() => getDraftRepository(), []);
  const queryClient = useQueryClient();
  const createEvent = useCreateEvent();
  const [draft, setDraft] = useState<EventDraft>(() =>
    createEmptyDraft(initialDraftId ?? newDraftId()),
  );
  const [publishError, setPublishError] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hydrated = useRef(false);

  useEffect(() => {
    if (!initialDraftId || hydrated.current) {
      return;
    }
    hydrated.current = true;
    void repository.get(initialDraftId).then(loaded => {
      if (loaded) {
        setDraft(loaded);
      }
    });
  }, [initialDraftId, repository]);

  const update = useCallback((patch: Partial<EventDraft>) => {
    setDraft(prev => ({ ...prev, ...patch, updatedAt: Date.now() }));
  }, []);

  const reset = useCallback(() => {
    setDraft(createEmptyDraft(newDraftId()));
  }, []);

  useEffect(() => {
    if (isDraftEmpty(draft)) {
      return;
    }
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
    }
    saveTimer.current = setTimeout(() => {
      void repository.save(draft).then(() => {
        void queryClient.invalidateQueries({ queryKey: draftKeys.list() });
      });
    }, 600);
    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }
    };
  }, [draft, queryClient, repository]);

  const basics = useMemo(() => validateBasics(draft), [draft]);
  const whenWhere = useMemo(() => validateWhenWhere(draft), [draft]);
  const publishable = useMemo(() => canPublish(draft), [draft]);

  const publish = useCallback(async (): Promise<LammaEvent | null> => {
    setPublishError(null);
    const input = draftToCreateInput(draft);
    if (!input) {
      return null;
    }
    try {
      // mutateAsync and draft removal are deliberately awaited. A failed write
      // leaves the draft intact so it can be retried.
      const event = await createEvent.mutateAsync(input);
      await repository.remove(draft.id);
      await queryClient.invalidateQueries({ queryKey: draftKeys.list() });
      await trackEvent('event_published', {
        event_id: event.id,
        visibility: event.visibility,
      });
      return event;
    } catch (error) {
      reportError(error, 'create-event.publish', { draftId: draft.id });
      setPublishError(
        error instanceof Error ? error.message : 'events/create-failed',
      );
      return null;
    }
  }, [createEvent, draft, queryClient, repository]);

  const value = useMemo<CreateEventContextValue>(
    () => ({
      draft,
      update,
      reset,
      basics,
      whenWhere,
      publishable,
      isPublishing: createEvent.isPending,
      publishError,
      publish,
    }),
    [
      draft,
      update,
      reset,
      basics,
      whenWhere,
      publishable,
      createEvent.isPending,
      publishError,
      publish,
    ],
  );

  return (
    <CreateEventContext.Provider value={value}>
      {children}
    </CreateEventContext.Provider>
  );
}

export function useCreateEventContext(): CreateEventContextValue {
  const ctx = useContext(CreateEventContext);
  if (!ctx) {
    throw new Error(
      'useCreateEventContext must be used within a CreateEventProvider',
    );
  }
  return ctx;
}
