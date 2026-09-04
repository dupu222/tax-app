## Vue 3 + Vite + Pinia + Cloudflare Workers

前端仍走原来的 `/jeecg-boot/...` 接口路径；后端由 Cloudflare Worker 实现，业务数据存在 R2。

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/dupu222/tax-app)

### 部署时需要配置的密钥

在 Cloudflare Worker **Settings → Variables and Secrets** 里添加（或一键部署向导里填写）：

| 名称 | 类型 | 必填 | 用途 |
| --- | --- | --- | --- |
| `ADMIN_KEY` | Secret | 是 | 管理后台登录密钥。打开 `/admin` 后填这个值，请求头为 `X-Admin-Key` |
| `TOKEN_SECRET` | Secret | 建议 | 用户登录 token 的 HMAC 密钥。不配则回退使用 `ADMIN_KEY` |

R2 **不需要**再配 Access Key。控制台绑定名是 `TAX_DATA`，默认桶名 `tax-app-data`。一键部署会自动创建这个桶。

Worker 每次处理 `/api/*` 都会从 R2 重新读取 `data.json`。桶为空时写入一份演示种子数据。

### 管理后台

部署完成后打开：`https://<你的 Worker 域名>/admin`

用上面的 `ADMIN_KEY` 登录，即可维护用户、轮播、图标、纳税明细等集合。

本地开发默认密钥（只用于本机，见 `.dev.vars`）：

- `ADMIN_KEY=dev-admin-key`
- `TOKEN_SECRET=dev-token-secret`

演示账号：`19673239497` / `123456`

### 本地开发

```bash
pnpm install
pnpm dev
```

`pnpm dev` 会把 `/api` 接到同一套 Worker 逻辑（内存模拟 R2）。管理后台：<http://127.0.0.1:9999/admin/>

完整 Workers 运行时：

```bash
pnpm run build
pnpm run preview:cf
```

### 构建与部署

```bash
pnpm run build
pnpm run test
npx wrangler deploy
```

不要使用 `pnpm deploy`。请用 `pnpm run cf:deploy` 或 `npx wrangler deploy`。

| 项 | 值 |
| --- | --- |
| 构建命令 | `pnpm run build` |
| 部署命令 | `npx wrangler deploy` |
| 非生产分支部署命令 | `npx wrangler versions upload` |
