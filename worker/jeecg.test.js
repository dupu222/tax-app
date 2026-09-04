import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { fail, jsonResponse, ok } from './jeecg.js';

describe('jeecg envelope', () => {
  it('wraps a successful payload with code 200', () => {
    assert.deepEqual(ok({ id: 1 }), {
      success: true,
      code: 200,
      message: '成功',
      result: { id: 1 },
    });
  });

  it('wraps a failed payload with the given code', () => {
    assert.deepEqual(fail('用户名或密码错误', 500), {
      success: false,
      code: 500,
      message: '用户名或密码错误',
      result: null,
    });
  });

  it('serializes the envelope as JSON with the HTTP status', async () => {
    const response = jsonResponse(fail('未授权', 401), 401);
    assert.equal(response.status, 401);
    assert.equal(response.headers.get('content-type'), 'application/json; charset=utf-8');
    assert.deepEqual(await response.json(), fail('未授权', 401));
  });
});
