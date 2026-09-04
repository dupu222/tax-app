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

function isSeedPlaceholder(url) {
  return typeof url === 'string' && /^\/seed\/[^/]+\.svg$/.test(url);
}

function needsPlaceholderUpgrade(store) {
  const urls = [];
  store.icons.forEach((group) => {
    group.list?.forEach((item) => urls.push(item.icon));
  });
  store.swipers.forEach((item) => urls.push(item.picture));
  store.images.forEach((item) => urls.push(item.image));
  const missingBizIcon = store.businesses.some(
    (item) => ['biz-1', 'biz-2', 'biz-3', 'biz-4'].includes(item.id) && !item.icon,
  );
  const missingDemoAvatar = store.users.some((item) => item.id === 'user-demo' && !item.avatar);
  return urls.some(isSeedPlaceholder) || missingBizIcon || missingDemoAvatar;
}

function upgradePlaceholderAssets(store, defaults) {
  let changed = false;
  const defaultIconByKey = new Map();
  defaults.icons.forEach((group) => {
    group.list?.forEach((item) => {
      defaultIconByKey.set(`${iconGroupKey(group)}:${item.title}`, item.icon);
    });
  });
  store.icons.forEach((group) => {
    group.list?.forEach((item) => {
      const next = defaultIconByKey.get(`${iconGroupKey(group)}:${item.title}`);
      if (next && item.icon !== next && (isSeedPlaceholder(item.icon) || !item.icon)) {
        item.icon = next;
        changed = true;
      }
    });
  });

  const defaultSwipe = new Map(defaults.swipers.map((item) => [item.id, item.picture]));
  store.swipers.forEach((item) => {
    const next = defaultSwipe.get(item.id);
    if (next && item.picture !== next && isSeedPlaceholder(item.picture)) {
      item.picture = next;
      changed = true;
    }
  });

  const defaultImage = new Map(defaults.images.map((item) => [item.code, item.image]));
  store.images.forEach((item) => {
    const next = defaultImage.get(item.code);
    if (next && item.image !== next && isSeedPlaceholder(item.image)) {
      item.image = next;
      changed = true;
    }
  });

  const defaultBiz = new Map(defaults.businesses.map((item) => [item.id, item]));
  store.businesses.forEach((item) => {
    const next = defaultBiz.get(item.id);
    if (next?.icon && !item.icon) {
      item.icon = next.icon;
      changed = true;
    }
  });

  const defaultAvatar = defaults.users.find((item) => item.id === 'user-demo')?.avatar;
  store.users.forEach((item) => {
    if (item.id === 'user-demo' && !item.avatar && defaultAvatar) {
      item.avatar = defaultAvatar;
      changed = true;
    }
  });
  return changed;
}

async function hydrateMissingDefaults(store) {
  const existingKeys = new Set(store.icons.map(iconGroupKey));
  const requiredKeys = ['1:', '2:证明开具', '2:税费申报', '3:申报信息查询', '3:备案信息查询', '3:其他查询', '4:'];
  const missingGroups = !requiredKeys.every((key) => existingKeys.has(key));
  if (!missingGroups && !needsPlaceholderUpgrade(store)) {
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
  if (upgradePlaceholderAssets(store, defaults)) {
    changed = true;
  }
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
