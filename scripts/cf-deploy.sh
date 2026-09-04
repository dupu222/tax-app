#!/usr/bin/env bash
# 一键部署到当前登录的 Cloudflare 账号。
# 密钥只从环境变量或终端隐藏输入读取，不会写入仓库、不会打印到终端。
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

BUCKET_NAME="${R2_BUCKET_NAME:-tax-app-data}"
CHECK_ONLY=0

usage() {
  cat <<'EOF'
用法: ./scripts/cf-deploy.sh

本机先登录 Cloudflare（npx wrangler login），然后执行本脚本。
密钥用环境变量传入，或在提示时输入（输入时不会回显）：

  ADMIN_KEY          必填，管理后台密钥
  TOKEN_SECRET       可选，不填则与 ADMIN_KEY 相同（仅在内存中，不落盘）
  R2_BUCKET_NAME     可选，默认 tax-app-data

不要把真实密钥写进代码、README、.dev.vars.example 或 git。
EOF
}

for arg in "$@"; do
  case "$arg" in
    -h|--help)
      usage
      exit 0
      ;;
    --check)
      CHECK_ONLY=1
      ;;
    *)
      echo "未知参数: $arg" >&2
      usage >&2
      exit 1
      ;;
  esac
done

need_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "缺少命令: $1" >&2
    exit 1
  fi
}

read_secret() {
  local name="$1"
  local current="${!name:-}"
  if [ -n "$current" ]; then
    return 0
  fi
  if [ ! -t 0 ]; then
    echo "未设置 ${name}。请用环境变量传入，不要写进文件。" >&2
    exit 1
  fi
  printf "请输入 %s（输入不会回显）: " "$name" >&2
  IFS= read -r -s "$name"
  printf '\n' >&2
  if [ -z "${!name}" ]; then
    echo "${name} 不能为空。" >&2
    exit 1
  fi
}

need_cmd node
need_cmd npx

if ! command -v pnpm >/dev/null 2>&1; then
  if command -v corepack >/dev/null 2>&1; then
    corepack enable >/dev/null
    corepack prepare pnpm@10.11.1 --activate >/dev/null
  else
    echo "缺少 pnpm，请先安装 Node.js 18+（含 corepack）。" >&2
    exit 1
  fi
fi

if [ "$CHECK_ONLY" = 1 ]; then
  echo "cf-deploy check ok"
  exit 0
fi

if ! npx wrangler whoami >/dev/null 2>&1; then
  echo "尚未登录 Cloudflare，将打开登录流程。"
  npx wrangler login
fi

if ! npx wrangler r2 bucket list 2>/dev/null | grep -Fq "$BUCKET_NAME"; then
  echo "创建 R2 桶 ${BUCKET_NAME} …"
  npx wrangler r2 bucket create "$BUCKET_NAME"
fi

read_secret ADMIN_KEY
if [ -z "${TOKEN_SECRET:-}" ]; then
  TOKEN_SECRET="$ADMIN_KEY"
fi

pnpm install
pnpm run build
npx wrangler deploy

# 走 stdin，避免密钥出现在进程参数或 shell history
printf '%s' "$ADMIN_KEY" | npx wrangler secret put ADMIN_KEY
printf '%s' "$TOKEN_SECRET" | npx wrangler secret put TOKEN_SECRET

unset ADMIN_KEY TOKEN_SECRET

echo
echo "部署完成。请用你刚设置的 ADMIN_KEY 打开 /admin，不要把密钥提交到 git。"
echo "应用地址见上面 wrangler deploy 输出的 workers.dev 链接。"
