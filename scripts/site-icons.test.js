import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
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
    assert.deepEqual(pngSize('public/launch.png').width > 0, true);
  });

  it('首页声明 iOS 启动图', () => {
    assert.match(read('index.html'), /<link\s+rel="apple-touch-startup-image"\s+href="\/launch\.png"\s*\/?>/);
  });
});

describe('种子资源文件', () => {
  it('seed.js 引用的图片都在 public/seed 下', async () => {
    const { createDefaultStore } = await import('../worker/seed.js');
    const store = await createDefaultStore();
    const urls = [
      ...store.swipers.map((item) => item.picture),
      ...store.images.map((item) => item.image),
      ...store.businesses.map((item) => item.icon),
      ...store.icons.flatMap((group) => group.list.map((item) => item.icon)),
      store.users[0].avatar,
    ];
    urls.forEach((url) => {
      assert.match(url, /^\/seed\/.+\.(png|svg)$/);
      assert.equal(existsSync(join(root, 'public', url)), true, url);
    });
  });

  it('页面硬编码的 /seed 图片都在磁盘上', () => {
    const seedUrl = /\/seed\/[A-Za-z0-9_./-]+\.(?:png|svg)/g;
    const files = [];
    const walk = (dir) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (entry.name.endsWith('.vue') || entry.name.endsWith('.html')) files.push(full);
      }
    };
    walk(join(root, 'src'));
    files.push(join(root, 'index.html'), join(root, 'public/admin/index.html'));
    const urls = new Set();
    for (const file of files) {
      const text = readFileSync(file, 'utf8');
      for (const match of text.matchAll(seedUrl)) urls.add(match[0]);
    }
    assert.ok(urls.size > 0);
    for (const url of urls) {
      assert.equal(existsSync(join(root, 'public', url)), true, url);
    }
  });

  it('完整原始媒体在 public/seed/library/origin', () => {
    const origin = join(root, 'public/seed/library/origin');
    assert.equal(existsSync(origin), true);
    const files = readdirSync(origin).filter((name) => !name.startsWith('.'));
    assert.ok(files.length >= 300, `origin file count ${files.length}`);
    assert.equal(existsSync(join(origin, 'banner1@3x.406737e.png')), true);
    assert.equal(existsSync(join(origin, 'LaunchImage-800-Portrait-736h@3x.png')), true);
  });
});
