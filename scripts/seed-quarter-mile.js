/**
 * Upserts only the Quarter Mile game doc, its packs and items.
 * Trivia questions and every other game are left untouched.
 * Usage: node scripts/seed-quarter-mile.js   (application default credentials)
 */
const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { quarterMilePacks } = require('./quarter-mile-bank');

initializeApp({ credential: applicationDefault(), projectId: 'fos7a-357902' });
const db = getFirestore();
const l = (en, ar) => ({ en, ar });

async function main() {
  const batch = db.batch();
  batch.set(
    db.doc('games/quarter-mile'),
    {
      id: 'quarter-mile',
      name: l('Quarter Mile', 'ربع ميل'),
      description: l(
        'Cars, footballers, fighters: keep the pick you see or risk the hidden one. Strongest team wins.',
        'عربيات، لاعيبة كورة، مقاتلين: خد اللي قدامك أو غامر بالمخفي. أقوى فريق يكسب.',
      ),
      icon: 'diamond',
      minPlayers: 2,
      maxPlayers: 2,
      syncType: 'host-led',
      accent: 'mint',
      order: 2,
    },
    { merge: true },
  );
  let count = 0;
  quarterMilePacks.forEach((pack, order) => {
    batch.set(db.doc(`games/quarter-mile/packs/${pack.id}`), {
      id: pack.id,
      name: pack.name,
      ...(pack.unit ? { unit: pack.unit } : {}),
      order,
    });
    pack.items.forEach((item, itemOrder) => {
      count += 1;
      batch.set(db.doc(`games/quarter-mile/items/${item.id}`), {
        id: item.id,
        name: item.name,
        score: item.score,
        packId: pack.id,
        order: itemOrder,
      });
    });
  });
  await batch.commit();
  console.log(`Seeded ${quarterMilePacks.length} packs, ${count} items`);
}

main().then(() => process.exit(0), e => { console.error(e); process.exit(1); });
