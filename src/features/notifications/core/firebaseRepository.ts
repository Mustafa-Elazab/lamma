import { getAuth } from '@react-native-firebase/auth';
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  updateDoc,
  writeBatch,
  type FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';

import type { AppNotification } from './entity';
import type { NotificationRepository } from './repository';

type SnapshotLike = { id: string; data: () => unknown };

function uid(): string {
  return getAuth().currentUser?.uid ?? 'anonymous';
}

function base(): FirebaseFirestoreTypes.CollectionReference {
  return collection(getFirestore(), 'users', uid(), 'notifications');
}

function mapDoc(snapshot: SnapshotLike): AppNotification {
  const data = (snapshot.data() ?? {}) as Partial<AppNotification>;
  return {
    id: snapshot.id,
    type: data.type ?? 'update',
    title: data.title ?? '',
    message: data.message ?? '',
    actorName: data.actorName ?? null,
    eventId: data.eventId ?? null,
    createdAt: data.createdAt ?? 0,
    read: data.read ?? false,
  };
}

export class FirebaseNotificationRepository
  implements NotificationRepository
{
  async list(): Promise<AppNotification[]> {
    const snap = await getDocs(query(base(), orderBy('createdAt', 'desc')));
    return (snap.docs as SnapshotLike[]).map(mapDoc);
  }

  async markRead(id: string): Promise<void> {
    await updateDoc(doc(base(), id), { read: true });
  }

  async markAllRead(): Promise<void> {
    const snap = await getDocs(base());
    const batch = writeBatch(getFirestore());
    snap.docs.forEach((d: SnapshotLike) => {
      batch.update(doc(base(), d.id), { read: true });
    });
    await batch.commit();
  }
}
