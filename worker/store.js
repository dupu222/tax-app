import { resolveBucket } from './bucket.js';
import { COLLECTION_KEYS, createDefaultStore } from './seed.js';

export const STORE_KEY = 'data.json';

export { createDefaultStore, COLLECTION_KEYS };

export async function loadStore(env) {
  const bucket = resolveBucket(env);
  if (!bucket) {
    return createDefaultStore();
  }

  const object = await bucket.get(STORE_KEY);
  if (!object) {
    const seeded = await createDefaultStore();
    await saveStore(env, seeded);
    return seeded;
  }

  const parsed = await object.json();
  return normalizeStore(parsed);
}

export async function saveStore(env, store) {
  const bucket = resolveBucket(env);
  if (!bucket) {
    throw new Error('TAX_DATA binding is missing');
  }
  await bucket.put(STORE_KEY, JSON.stringify(normalizeStore(store)));
}

function normalizeStore(input) {
  const source = input && typeof input === 'object' ? input : {};
  const store = {};
  COLLECTION_KEYS.forEach((key) => {
    store[key] = source[key] ?? (key === 'dicts' || key === 'categories' ? {} : []);
  });
  return store;
}
