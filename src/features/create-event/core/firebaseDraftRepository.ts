import { getAuth } from '@react-native-firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  setDoc,
  type CollectionReference,
} from '@react-native-firebase/firestore';

import { reportError } from '../../../services/crashReporting';
import { appLogger } from '../../../services/logger';
import type { EventDraft } from './draftEntity';
import type { DraftRepository } from './draftRepository';

type SnapshotLike = { id: string; data: () => unknown };

function uid(): string {
  const currentUid = getAuth().currentUser?.uid;
  if (!currentUid) {
    throw new Error('drafts/auth-required: no authenticated Firebase user');
  }
  return currentUid;
}

function draftsCollection(): CollectionReference {
  return collection(getFirestore(), 'users', uid(), 'drafts');
}

function mapDraft(snapshot: SnapshotLike): EventDraft {
  return snapshot.data() as EventDraft;
}

export class FirebaseDraftRepository implements DraftRepository {
  async list(): Promise<EventDraft[]> {
    const snap = await getDocs(draftsCollection());
    return (snap.docs as SnapshotLike[])
      .map(mapDraft)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }

  async get(id: string): Promise<EventDraft | null> {
    const snapshot = await getDoc(doc(draftsCollection(), id));
    return snapshot.exists() ? mapDraft(snapshot) : null;
  }

  async save(draft: EventDraft): Promise<void> {
    const currentUid = uid();
    const ref = doc(
      getFirestore(),
      'users',
      currentUid,
      'drafts',
      draft.id,
    );
    const payload = {
      ...draft,
      updatedAt: Date.now(),
    };
    appLogger.log('[drafts.save] Firestore write request', {
      uid: currentUid,
      path: ref.path,
      payload,
    });
    appLogger.display('Firestore draft save', {
      uid: currentUid,
      path: ref.path,
      payload,
    });

    try {
      await setDoc(ref, payload);
      appLogger.log('[drafts.save] Firestore write response', {
        uid: currentUid,
        path: ref.path,
      });
    } catch (error) {
      const details = error as { code?: string; message?: string };
      appLogger.error('[drafts.save] Firestore write failed', error, {
        uid: currentUid,
        path: ref.path,
        payload,
        code: details.code ?? 'unknown',
        message: details.message ?? String(error),
      });
      reportError(error, 'drafts.firestore-save', {
        uid: currentUid,
        path: ref.path,
        code: details.code ?? 'unknown',
      });
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    await deleteDoc(doc(draftsCollection(), id));
  }
}
