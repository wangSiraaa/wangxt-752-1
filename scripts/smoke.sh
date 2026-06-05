#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [ -f .env ]; then
  set -a
  . ./.env
  set +a
fi

echo "[smoke] 科创园会议室门牌 - 冒烟测试入口"
echo "[smoke] 当前目录: $(pwd)"

echo "[smoke] 检查依赖..."
if [ ! -d "node_modules" ]; then
  echo "[smoke] 安装 npm 依赖..."
  npm ci --quiet 2>/dev/null || npm install --quiet 2>/dev/null
fi

echo "[smoke] 运行冒烟测试: 预约清洁中会议室并验证不可保存"
node scripts/smoke-test.mjs

echo "[smoke] 构建生产环境..."
npm run build

echo "[smoke] ✅ 全部冒烟测试通过 - 项目可正常部署"
