import AsyncStorage from '@react-native-async-storage/async-storage';

import { createEmptyDraft } from '../draftEntity';
import { LocalDraftRepository } from '../localDraftRepository';

describe('LocalDraftRepository', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('saves and lists drafts newest first', async () => {
    const repo = new LocalDraftRepository();
    await repo.save({ ...createEmptyDraft('a'), title: 'First' });
    await new Promise(resolve => setTimeout(resolve, 5));
    await repo.save({ ...createEmptyDraft('b'), title: 'Second' });
    const list = await repo.list();
    expect(list).toHaveLength(2);
    expect(list[0].title).toBe('Second');
  });

  it('gets a draft by id', async () => {
    const repo = new LocalDraftRepository();
    await repo.save({ ...createEmptyDraft('a'), title: 'Only' });
    const draft = await repo.get('a');
    expect(draft?.title).toBe('Only');
  });

  it('removes drafts', async () => {
    const repo = new LocalDraftRepository();
    await repo.save(createEmptyDraft('a'));
    await repo.remove('a');
    expect(await repo.get('a')).toBeNull();
  });
});
