import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function read(rel) {
  return readFileSync(join(root, rel), 'utf8');
}

function pngSize(rel) {
  const buf = readFileSync(join(root, rel));
  assert.equal(buf.subarray(0, 8).toString('binary'), '\x89PNG\r\n\x1a\n');
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

function assertIconLinks(html) {
  assert.match(html, /<link\s+rel="icon"\s+href="\/favicon\.ico"\s+sizes="32x32"\s*\/?>/);
  assert.match(
    html,
    /<link\s+rel="icon"\s+type="image\/png"\s+sizes="192x192"\s+href="\/icon\.png"\s*\/?>/,
  );
  assert.match(
    html,
    /<link\s+rel="apple-touch-icon"\s+sizes="180x180"\s+href="\/apple-touch-icon\.png"\s*\/?>/,
  );
}

describe('站点通用 icon 与 iOS apple-touch-icon', () => {
  it('首页 index.html 声明 favicon.ico、通用 PNG 与 apple-touch-icon', () => {
    assertIconLinks(read('index.html'));
  });

  it('管理后台同样声明同一套图标', () => {
    assertIconLinks(read('public/admin/index.html'));
  });

  it('public 下存在对应图标文件且尺寸正确', () => {
    assert.equal(existsSync(join(root, 'public/favicon.ico')), true);
    assert.deepEqual(pngSize('public/icon.png'), { width: 192, height: 192 });
    assert.deepEqual(pngSize('public/apple-touch-icon.png'), { width: 180, height: 180 });
  });
});
