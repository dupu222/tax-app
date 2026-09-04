import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { hashPassword, isAdminRequest, signUserToken, verifyUserToken } from './auth.js';

describe('admin key check', () => {
  it('accepts a matching X-Admin-Key header', async () => {
    const request = new Request('https://example.com/api/admin/store', {
      headers: { 'X-Admin-Key': 'secret-admin' },
    });
    assert.equal(await isAdminRequest(request, { ADMIN_KEY: 'secret-admin' }), true);
  });

  it('rejects a missing or mismatched admin key', async () => {
    const request = new Request('https://example.com/api/admin/store');
    assert.equal(await isAdminRequest(request, { ADMIN_KEY: 'secret-admin' }), false);
    const bad = new Request('https://example.com/api/admin/store', {
      headers: { 'X-Admin-Key': 'nope' },
    });
    assert.equal(await isAdminRequest(bad, { ADMIN_KEY: 'secret-admin' }), false);
  });
});

describe('user tokens', () => {
  it('signs and verifies an access token with TOKEN_SECRET', async () => {
    const token = await signUserToken({ id: 'u1', username: '19673239497' }, 'token-secret');
    const payload = await verifyUserToken(token, 'token-secret');
    assert.equal(payload.id, 'u1');
    assert.equal(payload.username, '19673239497');
  });

  it('rejects a token signed with a different secret', async () => {
    const token = await signUserToken({ id: 'u1' }, 'token-secret');
    assert.equal(await verifyUserToken(token, 'other-secret'), null);
  });
});

describe('password hashing', () => {
  it('hashes the same password to the same digest', async () => {
    const left = await hashPassword('123456');
    const right = await hashPassword('123456');
    assert.equal(left, right);
    assert.notEqual(left, '123456');
  });
});
