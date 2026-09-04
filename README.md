## Vue 3 + Vite + Pinia + Cloudflare Workers

本项目已适配 Cloudflare Workers（Workers Assets + API 代理），可在 Cloudflare 控制台一键部署。

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/dupu222/tax-app)

### 本地开发

```bash
pnpm install
pnpm dev
```

### 构建与部署

```bash
pnpm run build
pnpm run test
npx wrangler deploy
```

不要使用 `pnpm deploy`：这是 pnpm 的内置命令。本地发布请用 `pnpm run cf:deploy` 或 `npx wrangler deploy`。 Cloudflare 一键部署会默认执行 `npx wrangler deploy`。

### Cloudflare 控制台建议配置

连接 Git 仓库后，建议使用：

| 项 | 值 |
| --- | --- |
| 构建命令 | `pnpm run build` |
| 部署命令 | `npx wrangler deploy` |
| 非生产分支部署命令 | `npx wrangler versions upload` |

`pnpm-lock.yaml` 已升级为 pnpm 10 格式，与 Cloudflare Workers Builds 默认的 `pnpm install --frozen-lockfile` 兼容。

生产环境前端请求同源 `/api/*`，由 Worker 转发到 `API_UPSTREAM`（默认 `http://api.ump45.top:19011`），避免 HTTPS 页面直连 HTTP 接口被浏览器拦截。
