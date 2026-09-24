/**
 * Seeds Firestore `games` with bilingual starter content for Mafioso + Trivia Time.
 * Project: fos7a-357902
 *
 * Structure (matches app contentRepository + product schema):
 *   games/{gameId}                         — definition + roleDistribution / winConditions / categories
 *   games/mafioso/phases/{phaseId}         — label {en,ar}, order
 *   games/mafioso/roles/{roleId}           — label {en,ar}, description {en,ar}, order
 *   games/trivia-time/packs/{categoryId}   — category as pack (app reads packs)
 *   games/trivia-time/questions/{id}       — prompt/options/correctIndex + categoryId/packId
 *
 * Usage:
 *   GOOGLE_APPLICATION_CREDENTIALS=/path/to/sa.json yarn seed:games
 *   # or after `gcloud auth application-default login` / refreshed Firebase ADC
 */
const {
  applicationDefault,
  cert,
  initializeApp,
} = require('firebase-admin/app');
const { FieldValue, getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');

const l = (en, ar) => ({ en, ar });

/** @type {const} */
const mafiosoRoleDistribution = {
  4: { mafia: 1, villager: 3 },
  5: { mafia: 2, villager: 3 },
  6: { mafia: 2, villager: 4 },
  7: { mafia: 2, villager: 5 },
  8: { mafia: 2, villager: 6 },
  9: { mafia: 2, villager: 7 },
  10: { mafia: 2, villager: 8 },
  11: { mafia: 2, villager: 9 },
  12: { mafia: 2, villager: 10 },
};

const mafiosoWinConditions = {
  mafia: l(
    'Mafiosos win when living mafiosos are greater than or equal to living citizens.',
    'يفوز المافيوزو عندما يصبح عددهم أكبر من أو يساوي عدد المواطنين الأحياء.',
  ),
  town: l(
    'Citizens win when every mafioso has been voted out.',
    'يفوز المواطنون عندما يتم إقصاء كل المافيوزو بالتصويت.',
  ),
};

const mafiosoPhases = [
  { id: 'role_deal', label: l('Role deal', 'توزيع الأدوار') },
  { id: 'clue', label: l('Clue', 'الدليل') },
  { id: 'discussion', label: l('Discussion', 'النقاش') },
  { id: 'vote', label: l('Vote', 'التصويت') },
  { id: 'reveal', label: l('Reveal', 'الكشف') },
];

const mafiosoRoles = [
  {
    id: 'mafia',
    label: l('Mafioso', 'مافيوزو'),
    description: l(
      'You are one of the hidden mafiosos. Blend in, steer votes, and survive.',
      'أنت أحد المافيوزو المخفيين. اندمج، وجّه التصويت، وابقَ.',
    ),
  },
  {
    id: 'villager',
    label: l('Citizen', 'مواطن'),
    description: l(
      'Use clues and discussion to find both mafiosos before they outnumber you.',
      'استخدم الأدلة والنقاش لاكتشاف المافيوزو قبل ما يزيدوا عنكم.',
    ),
  },
];

const mafiosoClues = [
  {
    id: 'clue-1',
    text: l(
      'One of the mafiosos lost only a single round before tonight.',
      'واحد من المافيوزو خسر جولة واحدة فقط قبل الليلة.',
    ),
  },
  {
    id: 'clue-2',
    text: l(
      'One mafioso was not present when the crime happened.',
      'واحد من المافيوزو ما كانش موجود وقت ما الجريمة حصلت.',
    ),
  },
  {
    id: 'clue-3',
    text: l(
      'A clue left behind matches someone still in the circle.',
      'في أثر اتساب بيطابق حد لسه في الدايرة.',
    ),
  },
  {
    id: 'clue-4',
    text: l(
      'The two mafiosos share one word on their identity cards.',
      'المافيوزوان بيشاركوا كلمة واحدة على البطاقة الشخصية.',
    ),
  },
  {
    id: 'clue-5',
    text: l(
      'Someone steered the last vote away from a mafioso on purpose.',
      'حد حوّل التصويت الأخير عن مافيوزو عن قصد.',
    ),
  },
];

const {
  triviaCategories,
  triviaQuestions,
} = require('./trivia-hard-bank');
const {
  quarterMilePacks,
} = require('./quarter-mile-bank');


function initAdmin() {
  const saPath =
    process.env.FIREBASE_SERVICE_ACCOUNT ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (saPath && fs.existsSync(saPath)) {
    const sa = JSON.parse(fs.readFileSync(saPath, 'utf8'));
    // Service account JSON has private_key; ADC user creds use type authorized_user
    if (sa.type === 'service_account' || sa.private_key) {
      initializeApp({
        credential: cert(sa),
        projectId: sa.project_id || 'fos7a-357902',
      });
      return;
    }
  }
  initializeApp({
    credential: applicationDefault(),
    projectId: 'fos7a-357902',
  });
}


async function deleteQueryBatch(db, querySnap) {
  if (querySnap.empty) {
    return;
  }
  const batch = db.batch();
  querySnap.docs.forEach(doc => batch.delete(doc.ref));
  setDoc(batch, db, 'games/quarter-mile', {
    id: 'quarter-mile',
    name: l('Quarter Mile', 'ربع ميل'),
    description: l(
      'Take the known car or risk the hidden one — best garage wins.',
      'خد العربية الظاهرة أو غامض المخفية — أقوى جراج يفوز.',
    ),
    icon: 'diamond',
    minPlayers: 2,
    maxPlayers: 2,
    syncType: 'host-led',
    accent: 'mint',
    order: 2,
  });

  quarterMilePacks.forEach((pack, order) => {
    setDoc(batch, db, `games/quarter-mile/packs/${pack.id}`, {
      id: pack.id,
      name: pack.name,
      order,
    });
    pack.items.forEach((item, itemOrder) => {
      setDoc(batch, db, `games/quarter-mile/items/${item.id}`, {
        id: item.id,
        name: item.name,
        score: item.score,
        packId: pack.id,
        order: itemOrder,
      });
    });
  });

  await batch.commit();
}

async function clearTriviaContent(db) {
  const [packs, questions] = await Promise.all([
    db.collection('games/trivia-time/packs').get(),
    db.collection('games/trivia-time/questions').get(),
  ]);
  await deleteQueryBatch(db, packs);
  // questions may exceed batch limit; chunk
  const docs = questions.docs;
  for (let i = 0; i < docs.length; i += 400) {
    const batch = db.batch();
    docs.slice(i, i + 400).forEach(doc => batch.delete(doc.ref));
    setDoc(batch, db, 'games/quarter-mile', {
    id: 'quarter-mile',
    name: l('Quarter Mile', 'ربع ميل'),
    description: l(
      'Take the known car or risk the hidden one — best garage wins.',
      'خد العربية الظاهرة أو غامض المخفية — أقوى جراج يفوز.',
    ),
    icon: 'diamond',
    minPlayers: 2,
    maxPlayers: 2,
    syncType: 'host-led',
    accent: 'mint',
    order: 2,
  });

  quarterMilePacks.forEach((pack, order) => {
    setDoc(batch, db, `games/quarter-mile/packs/${pack.id}`, {
      id: pack.id,
      name: pack.name,
      order,
    });
    pack.items.forEach((item, itemOrder) => {
      setDoc(batch, db, `games/quarter-mile/items/${item.id}`, {
        id: item.id,
        name: item.name,
        score: item.score,
        packId: pack.id,
        order: itemOrder,
      });
    });
  });

  await batch.commit();
  }
}

function setDoc(batch, db, path, data) {
  batch.set(
    db.doc(path),
    {
      ...data,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}

async function main() {
  initAdmin();
  const db = getFirestore();

  // Firestore batches max 500 ops. Count: 2 games + 5 phases + 4 roles + 4 packs + 32 questions = 47
  const batch = db.batch();

  setDoc(batch, db, 'games/mafioso', {
    id: 'mafioso',
    name: l('Mafioso', 'مافيوزو'),
    description: l(
      'Two hidden mafiosos, clues each round, discussion, and a vote.',
      'مافيوزوان مخفيان، دليل كل جولة، نقاش، ثم تصويت.',
    ),
    icon: 'shield',
    minPlayers: 4,
    maxPlayers: 12,
    syncType: 'host-led',
    accent: 'rose',
    order: 0,
    phases: mafiosoPhases.map(p => p.id),
    roleDistribution: mafiosoRoleDistribution,
    winConditions: mafiosoWinConditions,
    config: {
      phaseOrder: mafiosoPhases.map(p => p.id),
    },
  });

  setDoc(batch, db, 'games/trivia-time', {
    id: 'trivia-time',
    name: l('Trivia Time', 'وقت التريفيا'),
    description: l(
      'Fast multiple-choice rounds with live scores and a prize.',
      'جولات أسئلة سريعة مع نتائج مباشرة وجائزة.',
    ),
    icon: 'poll',
    minPlayers: 1,
    maxPlayers: 20,
    syncType: 'host-led',
    accent: 'sky',
    order: 1,
    categories: triviaCategories.map(c => ({ id: c.id, name: c.name })),
    config: { defaultQuestionCount: 10, defaultSecondsPerQuestion: 15 },
  });

  mafiosoPhases.forEach((phase, order) => {
    setDoc(batch, db, `games/mafioso/phases/${phase.id}`, {
      id: phase.id,
      label: phase.label,
      order,
    });
  });

  mafiosoRoles.forEach((role, order) => {
    setDoc(batch, db, `games/mafioso/roles/${role.id}`, {
      id: role.id,
      // App contentRepository reads `label` + `description`
      label: role.label,
      name: role.label,
      description: role.description,
      order,
    });
  });

  // Remove legacy night-action roles if present
  batch.delete(db.doc('games/mafioso/roles/detective'));
  batch.delete(db.doc('games/mafioso/roles/doctor'));

  mafiosoClues.forEach((clue, order) => {
    setDoc(batch, db, `games/mafioso/clues/${clue.id}`, {
      id: clue.id,
      text: clue.text,
      order,
    });
  });

  await clearTriviaContent(db);

  triviaCategories.forEach((cat, order) => {
    setDoc(batch, db, `games/trivia-time/packs/${cat.id}`, {
      id: cat.id,
      name: cat.name,
      order,
    });
  });

  triviaQuestions.forEach(
    ([id, categoryId, question, options, correctIndex], index) => {
      setDoc(batch, db, `games/trivia-time/questions/${id}`, {
        id,
        categoryId,
        category: categoryId,
        packId: categoryId,
        // App reads `prompt`; schema also stores `question`
        question,
        prompt: question,
        options,
        correctIndex,
        order: index,
      });
    },
  );

  setDoc(batch, db, 'games/quarter-mile', {
    id: 'quarter-mile',
    name: l('Quarter Mile', 'ربع ميل'),
    description: l(
      'Take the known car or risk the hidden one — best garage wins.',
      'خد العربية الظاهرة أو غامض المخفية — أقوى جراج يفوز.',
    ),
    icon: 'diamond',
    minPlayers: 2,
    maxPlayers: 2,
    syncType: 'host-led',
    accent: 'mint',
    order: 2,
  });

  quarterMilePacks.forEach((pack, order) => {
    setDoc(batch, db, `games/quarter-mile/packs/${pack.id}`, {
      id: pack.id,
      name: pack.name,
      order,
    });
    pack.items.forEach((item, itemOrder) => {
      setDoc(batch, db, `games/quarter-mile/items/${item.id}`, {
        id: item.id,
        name: item.name,
        score: item.score,
        packId: pack.id,
        order: itemOrder,
      });
    });
  });

  await batch.commit();

  // Verify reads
  const mafioso = await db.doc('games/mafioso').get();
  const trivia = await db.doc('games/trivia-time').get();
  const roles = await db.collection('games/mafioso/roles').get();
  const phases = await db.collection('games/mafioso/phases').get();
  const packs = await db.collection('games/trivia-time/packs').get();
  const questions = await db.collection('games/trivia-time/questions').get();
  const quarter = await db.doc('games/quarter-mile').get();
  const qmPacks = await db.collection('games/quarter-mile/packs').get();
  const qmItems = await db.collection('games/quarter-mile/items').get();
  const clues = await db.collection('games/mafioso/clues').get();

  const m = mafioso.data();
  const t = trivia.data();
  console.log(
    JSON.stringify(
      {
        ok: true,
        mafioso: {
          name: m.name,
          description: m.description,
          minPlayers: m.minPlayers,
          maxPlayers: m.maxPlayers,
          phases: phases.size,
          roles: roles.docs.map(d => d.id),
          roleDistributionKeys: Object.keys(m.roleDistribution || {}),
        },
        trivia: {
          name: t.name,
          description: t.description,
          packs: packs.size,
          questions: questions.size,
          samplePrompt: questions.docs[0]?.data()?.prompt,
        },
        mafiosoClues: clues.size,
        quarterMile: {
          name: quarter.data()?.name,
          packs: qmPacks.size,
          items: qmItems.size,
        },
      },
      null,
      2,
    ),
  );
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
