import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function read(rel) {
  return readFileSync(join(root, rel), 'utf8');
}

describe('Deploy to Cloudflare 一键部署约定', () => {
  it('README 含官方 Deploy to Cloudflare 按钮且指向本仓库', () => {
    const readme = read('README.md');
    assert.match(readme, /https:\/\/deploy\.workers\.cloudflare\.com\/button/);
    assert.match(
      readme,
      /https:\/\/deploy\.workers\.cloudflare\.com\/\?url=https:\/\/github\.com\/dupu222\/tax-app/,
    );
  });

  it('.dev.vars.example 只声明密钥名，不带真实值', () => {
    const example = read('.dev.vars.example');
    assert.match(example, /^ADMIN_KEY=$/m);
    assert.match(example, /^TOKEN_SECRET=$/m);
  });

  it('package.json 提供 wrangler deploy，供一键向导识别', () => {
    const pkg = JSON.parse(read('package.json'));
    assert.equal(pkg.scripts.deploy, 'wrangler deploy');
    assert.equal(pkg.scripts.build, 'vite build --mode prd');
    assert.ok(pkg.cloudflare.bindings.ADMIN_KEY.description);
    assert.ok(pkg.cloudflare.bindings.TOKEN_SECRET.description);
  });

  it('一键脚本可通过 --check，且源码不硬编码密钥', () => {
    const script = read('scripts/cf-deploy.sh');
    assert.doesNotMatch(script, /ADMIN_KEY\s*=\s*['"][^$'"]+['"]/);
    assert.doesNotMatch(script, /TOKEN_SECRET\s*=\s*['"][^$'"]+['"]/);
    assert.match(script, /wrangler secret put ADMIN_KEY/);
    assert.match(script, /printf '%s' "\$ADMIN_KEY"/);

    const out = execFileSync('bash', [join(root, 'scripts/cf-deploy.sh'), '--check'], {
      encoding: 'utf8',
    });
    assert.match(out, /cf-deploy check ok/);
  });
});
