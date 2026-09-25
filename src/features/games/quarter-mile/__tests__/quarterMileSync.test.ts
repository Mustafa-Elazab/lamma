/**
 * Host (Android, English) and guest (iPhone, Arabic) each render Quarter Mile
 * from the shared Firestore session doc. The host is authoritative: it applies
 * choices (its own directly, the guest's from a player action) and advances
 * rounds; every write goes through Firestore, which rejects `undefined`.
 */
import { QUARTER_MILE_PACKS } from '../content/packs';
import {
  advanceQuarterMileTurn,
  applyQuarterMileChoice,
  createQuarterMileState,
  currentQuarterMilePlayerId,
  quarterMileScores,
  type QuarterMileChoice,
  type QuarterMileState,
} from '../engine';

const HOST = 'anon-host';
const GUEST = 'anon-guest';

/** Mimics Firestore: throws on undefined like RNFB, stores a deep copy. */
class FakeSessionDoc {
  private data: QuarterMileState | null = null;
  write(state: QuarterMileState): void {
    const walk = (value: unknown, path: string): void => {
      if (value === undefined) {
        throw new Error(`Unsupported field value: undefined (${path})`);
      }
      if (value && typeof value === 'object') {
        Object.entries(value).forEach(([k, v]) => walk(v, `${path}.${k}`));
      }
    };
    walk(state, '$');
    this.data = JSON.parse(JSON.stringify(state));
  }
  /** What a client's onSnapshot listener sees. */
  read(): QuarterMileState {
    return JSON.parse(JSON.stringify(this.data));
  }
}

/** What each client shows, derived only from the shared doc. */
function view(state: QuarterMileState, viewerId: string, isHost: boolean) {
  const chooser = currentQuarterMilePlayerId(state);
  return {
    phase: state.phase,
    turnIndex: state.turnIndex,
    canChoose: state.phase === 'choose' && chooser === viewerId,
    waitingForChooser: state.phase === 'choose' && chooser !== viewerId,
    canAdvance: state.phase === 'reveal' && isHost,
    waitingForHost: state.phase === 'reveal' && !isHost,
    chooser,
  };
}

function setup() {
  const cars = QUARTER_MILE_PACKS.find(pack => pack.id === 'cars')!;
  const doc = new FakeSessionDoc();
  doc.write(
    createQuarterMileState({
      pack: cars,
      players: [
        { id: HOST, name: 'Ahmed', isHost: true, connected: true },
        { id: GUEST, name: 'مصطفي', isHost: false, connected: true },
      ],
    }),
  );
  const hostChoose = (choice: QuarterMileChoice) =>
    doc.write(applyQuarterMileChoice(doc.read(), HOST, choice));
  // Guest sends a player action; the host applies it to the doc.
  const guestChoose = (choice: QuarterMileChoice) =>
    doc.write(applyQuarterMileChoice(doc.read(), GUEST, choice));
  const hostNextPair = () => doc.write(advanceQuarterMileTurn(doc.read()));
  return { doc, hostChoose, guestChoose, hostNextPair };
}

describe('Quarter Mile round sync (host + guest)', () => {
  it('both clients agree on the chooser and phase through several rounds', () => {
    const { doc, hostChoose, guestChoose, hostNextPair } = setup();

    // Round 1: host's turn.
    expect(view(doc.read(), HOST, true)).toMatchObject({ phase: 'choose', canChoose: true });
    expect(view(doc.read(), GUEST, false)).toMatchObject({ waitingForChooser: true, chooser: HOST });
    hostChoose('take');
    expect(view(doc.read(), HOST, true)).toMatchObject({ phase: 'reveal', canAdvance: true });
    expect(view(doc.read(), GUEST, false)).toMatchObject({ phase: 'reveal', waitingForHost: true });

    // Host taps "Next pair": the write must succeed (was: lastChoice: undefined).
    expect(() => hostNextPair()).not.toThrow();

    // Round 2: guest's turn, and the guest sees it (no stale reveal).
    const guestView = view(doc.read(), GUEST, false);
    expect(guestView).toMatchObject({ phase: 'choose', turnIndex: 1, canChoose: true });
    expect(view(doc.read(), HOST, true)).toMatchObject({ waitingForChooser: true, chooser: GUEST });
    expect(doc.read().lastChoice).toBeUndefined();
    guestChoose('leave');
    expect(view(doc.read(), GUEST, false)).toMatchObject({ phase: 'reveal', waitingForHost: true });
    hostNextPair();

    // Round 3: back to the host.
    expect(view(doc.read(), HOST, true)).toMatchObject({ canChoose: true, turnIndex: 2 });
    expect(view(doc.read(), GUEST, false)).toMatchObject({ waitingForChooser: true });

    const scores = quarterMileScores(doc.read());
    expect(scores).toHaveLength(2);
  });

  it('plays a whole game to the finish without a rejected write', () => {
    const { doc, hostChoose, guestChoose, hostNextPair } = setup();
    let guard = 0;
    while (doc.read().phase !== 'finished' && guard < 100) {
      guard += 1;
      const state = doc.read();
      if (state.phase === 'choose') {
        if (currentQuarterMilePlayerId(state) === HOST) {
          hostChoose('take');
        } else {
          guestChoose('leave');
        }
      } else {
        hostNextPair();
      }
    }
    expect(doc.read().phase).toBe('finished');
    expect(view(doc.read(), GUEST, false).waitingForHost).toBe(false);
  });

  it('ignores a choice from the player whose turn it is not', () => {
    const { doc } = setup();
    const before = doc.read();
    expect(applyQuarterMileChoice(before, GUEST, 'take')).toBe(before);
  });
});
