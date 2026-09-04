import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { handleApiRequest } from './app.js';
import { createMemoryBucket } from './bucket.js';
import { hashPassword } from './auth.js';

function createEnv() {
  return {
    TAX_DATA: createMemoryBucket(),
    ADMIN_KEY: 'secret-admin',
    TOKEN_SECRET: 'token-secret',
  };
}

async function api(env, path, init = {}) {
  const request = new Request(`https://tax.example${path}`, init);
  return handleApiRequest(request, env);
}

describe('public tax APIs', () => {
  it('returns seeded swipers without calling an external host', async () => {
    const env = createEnv();
    const response = await api(env, '/api/jeecg-boot/tax/taxSwiper/appList');
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.code, 200);
    assert.ok(body.result.length >= 1);
    assert.match(body.result[0].picture, /^\/seed\//);
  });

  it('filters icons by type', async () => {
    const env = createEnv();
    const response = await api(env, '/api/jeecg-boot/tax/taxIcon/appList?type=1');
    const body = await response.json();
    assert.equal(body.result[0].list[0].title, '我要办税');
  });
});

describe('login and user APIs', () => {
  it('rejects a wrong password with jeecg code 500', async () => {
    const env = createEnv();
    const response = await api(env, '/api/jeecg-boot/sys/appLogin', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username: '19673239497', password: 'wrong' }),
    });
    const body = await response.json();
    assert.equal(body.code, 500);
    assert.match(body.message, /密码/);
  });

  it('issues a token and reads the current user from X-Access-Token', async () => {
    const env = createEnv();
    const login = await api(env, '/api/jeecg-boot/sys/appLogin', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username: '19673239497', password: '123456' }),
    });
    const loginBody = await login.json();
    assert.equal(loginBody.code, 200);
    assert.ok(loginBody.result.token);
    assert.equal(loginBody.result.realname, '张三');

    const me = await api(env, '/api/jeecg-boot/sys/user/userInfo', {
      headers: { 'X-Access-Token': loginBody.result.token },
    });
    const meBody = await me.json();
    assert.equal(meBody.result.username, '19673239497');
    assert.equal(meBody.result.passwordHash, undefined);
  });
});

describe('admin APIs', () => {
  it('rejects store reads without ADMIN_KEY', async () => {
    const env = createEnv();
    const response = await api(env, '/api/admin/store');
    assert.equal(response.status, 401);
  });

  it('allows the admin key to replace a collection', async () => {
    const env = createEnv();
    const put = await api(env, '/api/admin/collections/hotIssues', {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
        'X-Admin-Key': 'secret-admin',
      },
      body: JSON.stringify([{ id: 'hot-x', title: '后台新增的问题' }]),
    });
    assert.equal(put.status, 200);

    const createUser = await api(env, '/api/admin/collections/users', {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
        'X-Admin-Key': 'secret-admin',
      },
      body: JSON.stringify([
        {
          id: 'user-2',
          username: '13800000000',
          password: 'hello123',
          realname: '李四',
        },
      ]),
    });
    assert.equal(createUser.status, 200);
    const created = await createUser.json();
    assert.equal(created.result[0].password, undefined);
    assert.ok(created.result[0].passwordHash);

    const list = await api(env, '/api/jeecg-boot/tax/taxHotIssue/appList');
    const body = await list.json();
    assert.deepEqual(
      body.result.list.map((item) => item.title),
      ['后台新增的问题'],
    );
  });
});

describe('password helper stays deterministic for seed users', () => {
  it('matches the seeded demo password', async () => {
    assert.equal(await hashPassword('123456'), await hashPassword('123456'));
  });
});
