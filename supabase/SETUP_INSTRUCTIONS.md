# Supabase 設定說明

## 方法一：手動套用（一次性設定）

請前往 **Supabase Dashboard → SQL Editor** 並依序執行下面兩個 SQL 檔案的內容：

1. `supabase/migrations/20240001_init.sql` — 建立 5 張資料表與 triggers
2. `supabase/migrations/20240002_rls.sql` — 設定 RLS 策略與 Realtime

直接複製貼上檔案內容執行即可。

---

## 方法二：Supabase CLI（推薦用於後續開發）

```bash
# 安裝 CLI
npm install -g supabase

# 登入（使用 Supabase Access Token）
export SUPABASE_ACCESS_TOKEN=sbp_0a4bd96c54661d15b339976cb6874c75f082c381

# 連結專案
supabase link --project-ref rqpueewuuyjjnfglxpui

# 套用所有 migrations
supabase db push

# 部署所有 Edge Functions
supabase functions deploy create-room
supabase functions deploy join-room
supabase functions deploy start-game
supabase functions deploy game-action

# 設定 Edge Function 的 Secrets（服務端金鑰）
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxcHVlZXd1dXlqam5mZ2x4cHVpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzU3MzY1MSwiZXhwIjoyMDg5MTQ5NjUxfQ.V9E0xdSOoFK-z5sONkePmgL2PkYrKZaRZ957qqH6GJI
```

---

## GitHub Secrets 設定（用於 CI/CD 自動部署）

請到 **GitHub → Repository Settings → Secrets and variables → Actions** 新增以下 Secrets：

| Secret 名稱 | 值 |
|------------|---|
| `VITE_SUPABASE_URL` | `https://rqpueewuuyjjnfglxpui.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...（anon key）` |
| `SUPABASE_ACCESS_TOKEN` | `sbp_0a4bd96c54661d15b339976cb6874c75f082c381` |
| `CLOUDFLARE_API_TOKEN` | `（現有值）` |
| `CLOUDFLARE_ACCOUNT_ID` | `（現有值）` |

---

## 本地開發

```bash
# 前端開發
cd frontend
npm install
npm run dev
# 訪問 http://localhost:5173
```

> 注意：`frontend/.env.local` 已包含 Supabase keys，本地開發可直接使用。
> 此檔案已在 .gitignore 中，不會被 commit。
