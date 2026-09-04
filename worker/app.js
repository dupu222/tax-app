import { isAdminRequest, hashPassword, readAccessUser, resolveTokenSecret, signUserToken } from './auth.js';
import { fail, jsonResponse, ok } from './jeecg.js';
import { COLLECTION_KEYS, loadStore, saveStore } from './store.js';

export async function handleApiRequest(request, env) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api/, '') || '/';

  try {
    if (path === '/admin' || path.startsWith('/admin/')) {
      return handleAdmin(request, env, path, url);
    }
    return handleJeecg(request, env, path, url);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal error';
    return jsonResponse(fail(message, 500), 500);
  }
}

async function handleAdmin(request, env, path, url) {
  if (!(await isAdminRequest(request, env))) {
    return jsonResponse(fail('管理密钥无效', 401), 401);
  }

  if (path === '/admin/ping' && request.method === 'GET') {
    return jsonResponse(ok({ ok: true }));
  }

  if (path === '/admin/store' && request.method === 'GET') {
    return jsonResponse(ok(await loadStore(env)));
  }

  if (path === '/admin/store' && request.method === 'PUT') {
    const body = await readJson(request);
    if (body && typeof body === 'object') {
      if ('users' in body) {
        body.users = await prepareCollection('users', body.users);
      }
    }
    await saveStore(env, body || {});
    return jsonResponse(ok(await loadStore(env)));
  }

  const collectionMatch = path.match(/^\/admin\/collections\/([^/]+)$/);
  if (collectionMatch) {
    const name = decodeURIComponent(collectionMatch[1]);
    if (!COLLECTION_KEYS.includes(name)) {
      return jsonResponse(fail(`未知集合: ${name}`, 400), 400);
    }
    const store = await loadStore(env);
    if (request.method === 'GET') {
      return jsonResponse(ok(store[name]));
    }
    if (request.method === 'PUT') {
      store[name] = await prepareCollection(name, await readJson(request));
      await saveStore(env, store);
      return jsonResponse(ok(store[name]));
    }
  }

  return jsonResponse(fail(`未找到管理接口 ${request.method} ${url.pathname}`, 404), 404);
}

async function handleJeecg(request, env, path, url) {
  const store = await loadStore(env);

  if (path === '/jeecg-boot/sys/appLogin' && request.method === 'POST') {
    return login(store, env, await readJson(request));
  }

  if (path === '/jeecg-boot/sys/user/userInfo' && request.method === 'GET') {
    const user = await requireUser(request, env, store);
    if (user.error) return user.error;
    return jsonResponse(ok(publicUser(user.value)));
  }

  if (path === '/jeecg-boot/sys/user/appEdit' && request.method === 'POST') {
    const user = await requireUser(request, env, store);
    if (user.error) return user.error;
    const patch = await readJson(request);
    Object.assign(user.value, {
      realname: patch.realname ?? user.value.realname,
      birthday: patch.birthday ?? user.value.birthday,
      education: patch.education ?? user.value.education,
      email: patch.email ?? user.value.email,
      nation: patch.nation ?? user.value.nation,
      sex: patch.sex ?? user.value.sex,
      addrVOList: patch.addrVOList ?? user.value.addrVOList,
    });
    await saveStore(env, store);
    return jsonResponse(ok(publicUser(user.value)));
  }

  if (path.startsWith('/jeecg-boot/sys/dict/getDictItem/') && request.method === 'GET') {
    const code = decodeURIComponent(path.slice('/jeecg-boot/sys/dict/getDictItem/'.length));
    return jsonResponse(ok(store.dicts[code] || []));
  }

  if (path === '/jeecg-boot/tax/taxCompany/companyList' && request.method === 'GET') {
    const user = await requireUser(request, env, store);
    if (user.error) return user.error;
    return jsonResponse(ok(store.companies.filter((item) => !item.userId || item.userId === user.value.id)));
  }

  if (path === '/jeecg-boot/tax/taxSwiper/appList' && request.method === 'GET') {
    return jsonResponse(ok(store.swipers));
  }

  if (path === '/jeecg-boot/tax/taxCommon/applist' && request.method === 'GET') {
    return jsonResponse(ok({ list: store.businesses }));
  }

  if (path === '/jeecg-boot/tax/taxHotIssue/appList' && request.method === 'GET') {
    return jsonResponse(ok({ list: store.hotIssues }));
  }

  if (path === '/jeecg-boot/tax/taxIcon/appList' && request.method === 'GET') {
    const type = Number(url.searchParams.get('type'));
    const list = Number.isFinite(type) && type ? store.icons.filter((item) => Number(item.type) === type) : store.icons;
    return jsonResponse(ok(list));
  }

  if (path === '/jeecg-boot/tax/taxArea/list' && request.method === 'GET') {
    return jsonResponse(ok(store.areas));
  }

  if (path === '/jeecg-boot/tax/taxImage/queryByDictCode' && request.method === 'GET') {
    const code = url.searchParams.get('code');
    const item = store.images.find((entry) => entry.code === code) || null;
    return jsonResponse(ok(item));
  }

  if (path === '/jeecg-boot/sys/category/getChildListByCode' && request.method === 'GET') {
    const code = url.searchParams.get('code');
    return jsonResponse(ok(store.categories[code] || []));
  }

  if (path === '/jeecg-boot/tax/taxTaxableIncome/appYearList' && request.method === 'GET') {
    return jsonResponse(ok(sortYearsDesc(store.taxableYears)));
  }

  if (path === '/jeecg-boot/tax/taxTaxableIncome/appList' && request.method === 'POST') {
    const user = await requireUser(request, env, store);
    if (user.error) return user.error;
    const body = await readJson(request);
    const types = String(body.incomeType || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    const list = store.taxableIncomes
      .filter((item) => {
        const sameUser = !item.userId || item.userId === user.value.id;
        const sameYear = !body.annual || item.annual === body.annual;
        const sameType = !types.length || types.includes(item.incomeTypeValue) || types.includes(item.incomeType);
        return sameUser && sameYear && sameType;
      })
      .sort(compareTaxableIncomeNewestFirst);
    const creditCount = sumMoney(list.map((item) => item.credit));
    const taxDeclaredCount = sumMoney(list.map((item) => item.taxDeclared));
    return jsonResponse(ok({ list, creditCount, taxDeclaredCount }));
  }

  if (path === '/jeecg-boot/tax/taxTaxableIncome/appGetById' && request.method === 'POST') {
    const user = await requireUser(request, env, store);
    if (user.error) return user.error;
    const body = await readJson(request);
    const item = store.taxableIncomes.find((entry) => String(entry.id) === String(body.id)) || null;
    return jsonResponse(ok(item));
  }

  return jsonResponse(fail(`未找到接口 ${request.method} ${url.pathname}`, 404), 404);
}

async function login(store, env, body) {
  const username = String(body?.username || '').trim();
  const password = String(body?.password || '');
  const user = store.users.find((item) => item.username === username);
  const passwordHash = await hashPassword(password);
  if (!user || user.passwordHash !== passwordHash) {
    return jsonResponse(fail('用户名或密码错误', 500));
  }
  const token = await signUserToken({ id: user.id, username: user.username }, resolveTokenSecret(env));
  return jsonResponse(ok({ ...publicUser(user), token }));
}

async function requireUser(request, env, store) {
  const payload = await readAccessUser(request, env);
  if (!payload?.id) {
    return { error: jsonResponse(fail('登录已过期', 401), 401) };
  }
  const user = store.users.find((item) => item.id === payload.id);
  if (!user) {
    return { error: jsonResponse(fail('用户不存在', 401), 401) };
  }
  return { value: user };
}

function publicUser(user) {
  const { passwordHash, ...rest } = user;
  return rest;
}

async function prepareCollection(name, value) {
  if (name !== 'users' || !Array.isArray(value)) {
    return value;
  }
  return Promise.all(
    value.map(async (item) => {
      const next = { ...item };
      if (next.password) {
        next.passwordHash = await hashPassword(next.password);
        delete next.password;
      }
      return next;
    }),
  );
}

async function readJson(request) {
  const text = await request.text();
  if (!text) {
    return {};
  }
  return JSON.parse(text);
}

function sumMoney(values) {
  const total = values.reduce((sum, value) => sum + Number(value || 0), 0);
  return total.toFixed(2);
}

function sortYearsDesc(years) {
  return [...(Array.isArray(years) ? years : [])].sort((a, b) => Number(b) - Number(a));
}

function compareTaxableIncomeNewestFirst(a, b) {
  const byDate = String(b.taxationDate || '').localeCompare(String(a.taxationDate || ''));
  if (byDate !== 0) {
    return byDate;
  }
  return String(a.incomeCategory || '').localeCompare(String(b.incomeCategory || ''));
}
