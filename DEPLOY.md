# Puerto Rico - 部署指南

## 🎯 當前狀態
| 組件 | 狀態 | 行數 |
|------|------|------|
| 前端 (React + TS) | ✅ Ready | ~975 |
| 後端 (Express + Socket.IO) | ✅ Ready | ~1024 |

## 🚀 推薦部署方案

### 方案 A: Railway + Cloudflare (最穩定)

#### 1. 後端部署到 Railway
```bash
# 從 /puerto-rico-game/backend 目錄
# Railway 自動檢測 package.json

# 需要的環境變量:
PORT=3001
NODE_ENV=production
```

**Railway 優點：**
- ✅ Socket.IO WebSocket 完全支持
- ✅ 免費 $5/month 額度
- ✅ 自動 HTTPS
- ✅ 簡單 GitHub 集成

#### 2. 前端部署到 Cloudflare Pages
```bash
# Build 命令
cd frontend && npm run build

# Output 目錄: dist/
```

**部署步驟：**
1. 登入 Cloudflare Dashboard → Pages
2. "Create a project" → "Upload assets"
3. 上傳 `frontend/dist/` 目錄

---

### 方案 B: 單一 Cloudflare Pages (僅靜態)
如果只是展示，可以：
1. 前端 → Cloudflare Pages
2. 後端暫不部署（或等之後）

---

## 📝 今晚行動

### 選項 1: 先本地測試完整流程
我幫你啟動前後端，確認能連線

### 選項 2: 直接部署 MVP
1. 我創建 Railway 部署配置
2. 建立 Cloudflare Pages 部署腳本
3. 推送到 GitHub (如果需要)

你選哪個？