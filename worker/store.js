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

function iconGroupKey(group) {
  return `${Number(group.type)}:${group.modeClassify || ''}`;
}

async function hydrateMissingDefaults(store) {
  const existingKeys = new Set(store.icons.map(iconGroupKey));
  const requiredKeys = ['1:', '2:证明开具', '2:税费申报', '3:申报信息查询', '3:备案信息查询', '3:其他查询', '4:'];
  if (requiredKeys.every((key) => existingKeys.has(key))) {
    return { store, changed: false };
  }
  const defaults = await createDefaultStore();
  let changed = false;
  defaults.icons.forEach((group) => {
    const key = iconGroupKey(group);
    if (!existingKeys.has(key)) {
      store.icons.push(group);
      existingKeys.add(key);
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
