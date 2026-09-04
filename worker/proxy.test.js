/* global globalThis */
import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import {
  DEFAULT_API_UPSTREAM,
  buildUpstreamUrl,
  filterRequestHeaders,
  isApiPath,
  proxyApiRequest,
  resolveUpstream,
} from './proxy.js';
import worker from './index.js';

describe('resolveUpstream', () => {
  it('falls back to the default backend when unset', () => {
    assert.equal(resolveUpstream(), DEFAULT_API_UPSTREAM);
    assert.equal(resolveUpstream({}), DEFAULT_API_UPSTREAM);
    assert.equal(resolveUpstream({ API_UPSTREAM: '  ' }), DEFAULT_API_UPSTREAM);
  });

  it('trims trailing slashes from a custom upstream', () => {
    assert.equal(resolveUpstream({ API_UPSTREAM: ' https://api.example.com/ ' }), 'https://api.example.com');
  });
});

describe('isApiPath', () => {
  it('matches /api and nested paths only', () => {
    assert.equal(isApiPath('/api'), true);
    assert.equal(isApiPath('/api/'), true);
    assert.equal(isApiPath('/api/jeecg-boot/sys/appLogin'), true);
    assert.equal(isApiPath('/assets/js/app.js'), false);
    assert.equal(isApiPath('/'), false);
  });
});

describe('buildUpstreamUrl', () => {
  it('rewrites /api prefix onto the backend origin', () => {
    const target = buildUpstreamUrl(
      'https://tax-app.example.workers.dev/api/jeecg-boot/sys/appLogin?id=1',
      DEFAULT_API_UPSTREAM,
    );
    assert.equal(target.toString(), `${DEFAULT_API_UPSTREAM}/jeecg-boot/sys/appLogin?id=1`);
  });

  it('keeps a trailing slash when the client requested /api/', () => {
    const target = buildUpstreamUrl('https://example.com/api/', DEFAULT_API_UPSTREAM);
    assert.equal(target.toString(), `${DEFAULT_API_UPSTREAM}/`);
  });
});

describe('filterRequestHeaders', () => {
  it('drops hop-by-hop and host headers', () => {
    const headers = filterRequestHeaders(
      new Headers({
        Host: 'tax-app.example.workers.dev',
        'X-Access-Token': 'token',
        Connection: 'keep-alive',
        'Content-Type': 'application/json',
      }),
    );

    assert.equal(headers.get('x-access-token'), 'token');
    assert.equal(headers.get('content-type'), 'application/json');
    assert.equal(headers.get('host'), null);
    assert.equal(headers.get('connection'), null);
  });
});

describe('proxyApiRequest', () => {
  afterEach(() => {
    delete globalThis.fetch;
  });

  it('forwards method, body and filtered headers to the upstream URL', async () => {
    const calls = [];
    globalThis.fetch = async (url, init) => {
      calls.push({ url: url.toString(), init });
      return new Response('ok', { status: 200 });
    };

    const request = new Request('https://app.example/api/jeecg-boot/sys/appLogin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Host: 'app.example',
      },
      body: '{"user":"1"}',
    });

    const response = await proxyApiRequest(request, DEFAULT_API_UPSTREAM);
    assert.equal(response.status, 200);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, `${DEFAULT_API_UPSTREAM}/jeecg-boot/sys/appLogin`);
    assert.equal(calls[0].init.method, 'POST');
    assert.equal(calls[0].init.headers.get('content-type'), 'application/json');
    assert.equal(calls[0].init.headers.get('host'), null);
    assert.ok(calls[0].init.body, 'POST body should be forwarded');
  });
});

describe('worker fetch', () => {
  afterEach(() => {
    delete globalThis.fetch;
  });

  it('returns 404 for non-API routes so static assets stay on Workers Assets', async () => {
    const response = await worker.fetch(new Request('https://app.example/index.html'), {});
    assert.equal(response.status, 404);
  });

  it('proxies API routes and surfaces upstream failures as 502', async () => {
    globalThis.fetch = async () => {
      throw new Error('connect timeout');
    };

    const response = await worker.fetch(new Request('https://app.example/api/health'), {
      API_UPSTREAM: DEFAULT_API_UPSTREAM,
    });
    assert.equal(response.status, 502);
    assert.deepEqual(await response.json(), { code: 502, message: 'connect timeout' });
  });
});
