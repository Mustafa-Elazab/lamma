import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  getFirestore,
  onSnapshot,
  setDoc,
} from '@react-native-firebase/firestore';

import type { GameSession, GameSessionPlayerAction } from '../types';
import type { GameSessionTransportAdapter } from './transport';

const COLLECTION = 'gameSessions';

function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}

function mapSession(data: unknown): GameSession | null {
  if (!data || typeof data !== 'object') {
    return null;
  }
  const session = data as Partial<GameSession>;
  if (!session.id || !session.gameId || !session.code || !session.hostId) {
    return null;
  }
  return session as GameSession;
}

export class FirestoreRoomCodeSessionAdapter
  implements GameSessionTransportAdapter
{
  readonly kind = 'firestore-room-code' as const;
  private readonly codesBySessionId = new Map<string, string>();

  private ref(code: string) {
    return doc(getFirestore(), COLLECTION, normalizeCode(code));
  }

  private collectionRef() {
    return collection(getFirestore(), COLLECTION);
  }

  private actionsRef(code: string) {
    return collection(this.ref(code), 'playerActions');
  }

  private actionRef(code: string, actionId: string) {
    return doc(this.actionsRef(code), actionId);
  }

  async host(session: GameSession): Promise<void> {
    this.codesBySessionId.set(session.id, normalizeCode(session.code));
    await setDoc(this.ref(session.code), session);
  }

  async join(code: string): Promise<GameSession | null> {
    const snapshot = await getDoc(this.ref(code));
    const session = snapshot.exists() ? mapSession(snapshot.data()) : null;
    if (session) {
      this.codesBySessionId.set(session.id, normalizeCode(session.code));
    }
    return session;
  }

  async listAvailableSessions(): Promise<GameSession[]> {
    const snapshot = await getDocs(this.collectionRef());
    return snapshot.docs
      .map(item => mapSession(item.data()))
      .filter(
        (session): session is GameSession =>
          session !== null && session.phase !== 'ended',
      )
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }

  subscribeAvailableSessions(
    onSessions: (sessions: GameSession[]) => void,
  ): () => void {
    return onSnapshot(this.collectionRef(), snapshot => {
      onSessions(
        snapshot.docs
          .map(item => mapSession(item.data()))
          .filter(
            (session): session is GameSession =>
              session !== null && session.phase !== 'ended',
          )
          .sort((a, b) => b.updatedAt - a.updatedAt),
      );
    });
  }

  async publish(session: GameSession): Promise<void> {
    this.codesBySessionId.set(session.id, normalizeCode(session.code));
    await setDoc(this.ref(session.code), session);
  }

  subscribe(
    code: string,
    onSession: (session: GameSession | null) => void,
  ): () => void {
    return onSnapshot(this.ref(code), snapshot => {
      const session = snapshot.exists() ? mapSession(snapshot.data()) : null;
      if (session) {
        this.codesBySessionId.set(session.id, normalizeCode(session.code));
      }
      onSession(session);
    });
  }

  async submitPlayerAction(
    code: string,
    action: GameSessionPlayerAction,
  ): Promise<void> {
    await setDoc(this.actionRef(code, action.id), action);
  }

  subscribePlayerActions(
    code: string,
    onActions: (actions: GameSessionPlayerAction[]) => void,
  ): () => void {
    return onSnapshot(this.actionsRef(code), snapshot => {
      onActions(
        snapshot.docs
          .map(actionSnapshot => actionSnapshot.data() as GameSessionPlayerAction)
          .sort((a, b) => a.createdAt - b.createdAt),
      );
    });
  }

  async leave(sessionId: string): Promise<void> {
    const code = this.codesBySessionId.get(sessionId);
    if (!code) {
      return;
    }
    this.codesBySessionId.delete(sessionId);
    await deleteDoc(this.ref(code));
  }
}
