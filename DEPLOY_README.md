# 🚀 Puerto Rico - 完整部署指南

## ✅ 當前狀態（2026-03-10）

| 組件 | 行數 | Build | 狀態 |
|------|------|-------|------|
| 前端 (React + TS) | ~975 行 | ✅ Pass | Ready to Deploy |
| 後端 (Express + Socket.IO) | ~1024 行 | ✅ Pass | Ready to Deploy |

---

## 🏗️ 部署方案: Cloudflare (已配置)

### 架构
```
┌─────────────────────────────────────────┐
│  Cloudflare Pages (免費)              │
│  - Frontend: React + Vite             │
│  - URL: puerto-rico-game.pages.dev    │
└──────────────┬──────────────────────────┘
               │
         WebSocket/Socket.IO
               │
┌──────────────▼──────────────────────────┐
│  Cloudflare Workers (免費)              │
│  - Backend: Express + Socket.IO         │
│  - Real-time game rooms                 │
└─────────────────────────────────────────┘
```

---

## 📋 部署步驟

### 方法一：自動化部署 (推薦)

**1. 推送代碼到 GitHub**
```bash
git add .
git commit -m "MVP ready for deployment"
git push origin main
```

GitHub Actions 會自動：
- ✅ Build 前端
- ✅ Deploy 到 Cloudflare Pages
- ✅ Deploy 後端到 Workers
- ✅ 發送通知

### 方法二：手動部署

```bash
# 1. 進入項目目錄
cd /home/moco/.openclaw/workspace/puerto-rico-game

# 2. 運行部署腳本
chmod +x scripts/deploy.sh
./scripts/deploy.sh

# 3. 選擇選項：
# - 1: 僅前端
# - 2: 僅後端
# - 3: 全部
```

---

## ⚙️ 配置要求

### Cloudflare 需要設置 Secrets：

在 GitHub Repo 設置這些 Secrets：
- `CLOUDFLARE_API_TOKEN` - 你的 API Token
- `CLOUDFLARE_ACCOUNT_ID` - Account ID

### 本地測試

```bash
# 後端
cd backend
npm install
npm run dev
# 🚀 http://localhost:3001

# 前端
cd frontend
npm install
npm run dev
# 🚀 http://localhost:5173
```

---

## 🎯 部署前檢查清單

- [ ] 代碼已推送到 GitHub main 分支
- [ ] Cloudflare API Token 已配置
- [ ] Account ID 已配置
- [ ] GitHub Secrets 已設置

---

## 🚀 自己動手

要現在就部署嗎？我可以幫你：

1. **檢查代碼狀態**
2. **創建 Pages 項目**（通過 Wrangler）
3. **配置 Workers**（如有需要）
4. **執行部署**

還是你想明天再部署？