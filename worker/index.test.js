import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import worker from './index.js';
import { createMemoryBucket } from './bucket.js';

describe('worker fetch', () => {
  it('returns 404 for non-API routes so static assets stay on Workers Assets', async () => {
    const response = await worker.fetch(new Request('https://app.example/index.html'), {});
    assert.equal(response.status, 404);
  });

  it('redirects /admin to /admin/ when assets are bound', async () => {
    const response = await worker.fetch(new Request('https://app.example/admin'), {
      ASSETS: {},
    });
    assert.equal(response.status, 301);
    assert.equal(new URL(response.headers.get('location')).pathname, '/admin/');
  });

  it('serves the in-worker tax API instead of an upstream host', async () => {
    const response = await worker.fetch(new Request('https://app.example/api/jeecg-boot/tax/taxSwiper/appList'), {
      TAX_DATA: createMemoryBucket(),
      ADMIN_KEY: 'secret-admin',
      TOKEN_SECRET: 'token-secret',
    });
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.code, 200);
    assert.ok(body.result.length >= 1);
  });
});
