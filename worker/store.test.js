import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createMemoryBucket } from './bucket.js';
import { STORE_KEY, createDefaultStore, loadStore, saveStore } from './store.js';

describe('R2-backed store', () => {
  it('seeds default data when the bucket is empty', async () => {
    const bucket = createMemoryBucket();
    const store = await loadStore({ TAX_DATA: bucket });
    assert.ok(Array.isArray(store.users));
    assert.ok(store.users.length >= 1);
    assert.equal(store.users[0].username, '19673239497');
    const saved = await bucket.get(STORE_KEY);
    assert.ok(saved, 'first read should persist the seed');
  });

  it('reads the persisted document on every subsequent load', async () => {
    const bucket = createMemoryBucket();
    const first = await loadStore({ TAX_DATA: bucket });
    first.swipers.push({ id: 'swipe-custom', picture: '/seed/banner-1.svg' });
    await saveStore({ TAX_DATA: bucket }, first);

    const second = await loadStore({ TAX_DATA: bucket });
    assert.equal(second.swipers.at(-1).id, 'swipe-custom');
    assert.notEqual(second, first);
  });

  it('returns a fresh default document when no bucket is bound', async () => {
    const store = await loadStore({});
    assert.deepEqual(store.taxableYears, (await createDefaultStore()).taxableYears);
  });

  it('upgrades leftover seed SVG placeholders to official PNG assets', async () => {
    const bucket = createMemoryBucket();
    const legacy = structuredClone(await createDefaultStore());
    legacy.swipers[0].picture = '/seed/banner-1.svg';
    legacy.icons[0].list[0].icon = '/seed/icon-tax.svg';
    legacy.images[0].image = '/seed/topic.svg';
    delete legacy.businesses[0].icon;
    legacy.users[0].avatar = '';
    await saveStore({ TAX_DATA: bucket }, legacy);

    const store = await loadStore({ TAX_DATA: bucket });
    assert.equal(store.swipers[0].picture, '/seed/banner-1.png');
    assert.equal(store.icons[0].list[0].icon, '/seed/icon-tax.png');
    assert.equal(store.images[0].image, '/seed/topic.png');
    assert.equal(store.businesses[0].icon, '/seed/icon-ndhs.png');
    assert.equal(store.users[0].avatar, '/seed/avatar-demo.png');
  });
});
