import { getAuth } from '@react-native-firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  setDoc,
  type FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';

import type { EventDraft } from './draftEntity';
import type { DraftRepository } from './draftRepository';

type SnapshotLike = { id: string; data: () => unknown };

function uid(): string {
  return getAuth().currentUser?.uid ?? 'anonymous';
}

function draftsCollection(): FirebaseFirestoreTypes.CollectionReference {
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
    await setDoc(doc(draftsCollection(), draft.id), {
      ...draft,
      updatedAt: Date.now(),
    });
  }

  async remove(id: string): Promise<void> {
    await deleteDoc(doc(draftsCollection(), id));
  }
}
