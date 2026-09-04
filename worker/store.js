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
  const store = normalizeStore(parsed);
  const hydrated = await hydrateMissingDefaults(store);
  if (hydrated.changed) {
    await saveStore(env, hydrated.store);
  }
  return hydrated.store;
}

export async function saveStore(env, store) {
  const bucket = resolveBucket(env);
  if (!bucket) {
    throw new Error('TAX_DATA binding is missing');
  }
  await bucket.put(STORE_KEY, JSON.stringify(normalizeStore(store)));
}

async function hydrateMissingDefaults(store) {
  const existingTypes = new Set(store.icons.map((item) => Number(item.type)));
  if ([1, 2, 3, 4].every((type) => existingTypes.has(type))) {
    return { store, changed: false };
  }
  const defaults = await createDefaultStore();
  let changed = false;
  defaults.icons.forEach((group) => {
    if (!existingTypes.has(Number(group.type))) {
      store.icons.push(group);
      existingTypes.add(Number(group.type));
      changed = true;
    }
  });
  return { store, changed };
}

function normalizeStore(input) {
  const source = input && typeof input === 'object' ? input : {};
  const store = {};
  COLLECTION_KEYS.forEach((key) => {
    store[key] = source[key] ?? (key === 'dicts' || key === 'categories' ? {} : []);
  });
  return store;
}
