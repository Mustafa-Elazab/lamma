/**
 * Replaces the old Mafioso game with Imposter in Firestore.
 * The Imposter word bank ships in the app (src/features/games/imposter/words.ts),
 * so only the games/imposter definition doc is needed.
 * Usage: node scripts/seed-imposter.js   (uses application default credentials)
 */
const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp({ credential: applicationDefault(), projectId: 'fos7a-357902' });

async function main() {
  const db = getFirestore();
  await db.doc('games/imposter').set({
    id: 'imposter',
    name: { en: 'Imposter', ar: 'مين الدخيل؟' },
    description: {
      en: 'Everyone gets the same secret word except one. Give clues, vote, catch the imposter.',
      ar: 'الكل عارف نفس الكلمة إلا واحد. قول تلميح، صوّت، واكشف الدخيل.',
    },
    icon: 'shield',
    minPlayers: 3,
    maxPlayers: 12,
    syncType: 'host-led',
    accent: 'rose',
    order: 0,
  });
  await db.recursiveDelete(db.doc('games/mafioso'));
  const games = await db.collection('games').orderBy('order').get();
  console.log(games.docs.map(d => `${d.id} (min ${d.data().minPlayers})`).join(', '));
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
