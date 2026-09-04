## Vue 3 + Vite + Pinia + Cloudflare Workers

前端仍走原来的 `/jeecg-boot/...` 接口路径；后端由 Cloudflare Worker 实现，业务数据存在 R2。

## 一键部署到 Cloudflare

点按钮后，用你自己的 Cloudflare 账号登录。向导会克隆仓库、创建 R2 桶 `tax-app-data`，并让你填写 Worker Secrets（**不要把密钥写进代码或提交到 git**）。

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/dupu222/tax-app)

仓库必须是 **GitHub / GitLab 公开仓库**，按钮才能给其他人用。

向导里请确认：

| 项 | 值 |
| --- | --- |
| 构建命令 | `pnpm run build` |
| 部署命令 | `npx wrangler deploy` 或 `pnpm run deploy` |

`pnpm deploy` 是 pnpm 自己的发布命令，**不要用**。请用 `pnpm run deploy`。

### 克隆后本机一键部署

```bash
git clone https://github.com/dupu222/tax-app.git
cd tax-app
npx wrangler login
./scripts/cf-deploy.sh
```

脚本会：安装依赖、构建前端、创建 R2 桶（若不存在）、`wrangler deploy`，再用 **stdin** 写入 Secrets（不会出现在命令行参数或 git 里）。

密钥只从环境变量或终端隐藏输入读取：

```bash
# 可选：先 export，再跑脚本；不要把下面两行写进仓库
# export ADMIN_KEY='你自己生成的密钥'
# export TOKEN_SECRET='你自己生成的另一段随机串'
./scripts/cf-deploy.sh
```

等价命令：`pnpm run cf:setup`

### 部署后需要配置的 Secrets

在 Worker **Settings → Variables and Secrets** 中添加（一键向导 / 脚本也会要你填）：

| 名称 | 类型 | 必填 | 用途 |
| --- | --- | --- | --- |
| `ADMIN_KEY` | Secret | 是 | `/admin` 管理后台密钥，请求头 `X-Admin-Key` |
| `TOKEN_SECRET` | Secret | 建议 | 用户登录 token 的 HMAC。不配则回退 `ADMIN_KEY` |

R2 **不需要** Access Key。绑定名是 `TAX_DATA`，默认桶名 `tax-app-data`。

**禁止**把真实密钥写进 `wrangler.jsonc`、`package.json`、README、`.dev.vars.example` 或任何会进 git 的文件。本机文件 `.dev.vars` 已被 gitignore。

Worker 每次处理 `/api/*` 都会从 R2 重新读取 `data.json`。桶为空时写入一份演示种子数据。

### 管理后台

部署完成后打开：`https://<你的 Worker 域名>/admin`

用你自己配置的 `ADMIN_KEY` 登录。

本地开发：把 `.dev.vars.example` 复制为 `.dev.vars`，**自己填写**密钥后再 `pnpm dev`。管理后台：<http://127.0.0.1:9999/admin/>

演示登录账号（种子数据，不是 Cloudflare 密钥）：见登录页预填。

### 本地开发

```bash
pnpm install
pnpm dev
```

`pnpm dev` 会把 `/api` 接到同一套 Worker 逻辑（内存模拟 R2）。

完整 Workers 运行时：

```bash
pnpm run build
pnpm run preview:cf
```

### 构建与手动部署

```bash
pnpm run build
pnpm run test
pnpm run deploy
```

| 项 | 值 |
| --- | --- |
| 构建命令 | `pnpm run build` |
| 部署命令 | `npx wrangler deploy` |
| 非生产分支部署命令 | `npx wrangler versions upload` |
