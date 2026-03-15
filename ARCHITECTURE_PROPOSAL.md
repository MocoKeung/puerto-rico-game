# Puerto Rico Game — 架構提案與開發藍圖

> **階段**：第一階段 — 環境審查與架構提案
> **狀態**：已確認，待實作
> **目標部署**：Cloudflare Pages（前端）+ Supabase（後端/DB/Realtime）
> **目標地區**：ap-southeast-2（Asia Pacific - Sydney）

---

## 一、現有專案狀態審查

### 技術棧遷移對照表

| 層級 | 現況 | 遷移目標 |
|------|------|---------|
| 前端 | React + Vite + TypeScript + Zustand | **保留**，加入 Supabase Client |
| 後端 | Express + Socket.IO（Fly.io） | **遷移**至 Supabase Edge Functions |
| 資料庫 | 無持久化（純記憶體） | Supabase PostgreSQL |
| 實時通訊 | Socket.IO（有狀態伺服器） | Supabase Realtime（WebSocket） |
| 認證 | 無 | Supabase Auth |
| 部署 | Fly.io + Cloudflare Pages | **Cloudflare Pages + Supabase** |

### 可複用的現有程式碼資產

- `frontend/src/components/` — 8 個 UI 元件（Board, RoleSelector, PlayerPanel 等）**全部保留**
- `backend/src/game/engine.ts` — 核心遊戲狀態機 → 遷移至 Supabase Edge Function
- `backend/src/game/rules.ts` — 規則常數（建築費用、VP、資源）→ 移至 `supabase/functions/_shared/`
- `backend/src/types/index.ts` — TypeScript 型別定義 → 移至 shared
- `frontend/src/store/gameStore.ts` — Zustand store → 改由 Supabase Realtime 驅動

---

## 二、目標架構設計

### 整體架構圖

```
瀏覽器 (React + Zustand)
    │
    ├── HTTPS ──────► Supabase Auth      (Login / Register / JWT)
    ├── HTTPS ──────► Supabase REST API  (query game rooms, profiles)
    ├── WSS ────────► Supabase Realtime  (game state broadcast)
    └── HTTPS ──────► Supabase Edge Fn  (game action processing)
                            │
                            └── Supabase PostgreSQL
                                  (games, game_states, game_players, actions)

部署：
  前端 → Cloudflare Pages (puerto-rico-game.pages.dev)
  後端 → Supabase Cloud (ap-southeast-2 / Oceania-Sydney)
```

---

## 三、資料夾結構建議

### 3.1 前端（保留現有 + 新增模組）

```
frontend/
├── src/
│   ├── components/           # 現有 UI 元件（全部保留）
│   │   ├── Board.tsx
│   │   ├── BuildingMarket.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── LoadingScreen.tsx
│   │   ├── PlayerPanel.tsx
│   │   ├── RoleSelector.tsx
│   │   ├── ResourceTracker.tsx
│   │   └── ShipArea.tsx
│   │
│   ├── pages/                # 新增：路由頁面
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── LobbyPage.tsx     # 建立/加入房間
│   │   └── GamePage.tsx      # 遊戲主頁
│   │
│   ├── lib/                  # 新增：第三方服務整合
│   │   ├── supabase.ts       # Supabase client 初始化
│   │   └── gameSync.ts       # Realtime 訂閱封裝
│   │
│   ├── hooks/                # 新增：自訂 React Hooks
│   │   ├── useAuth.ts        # 登入狀態管理
│   │   ├── useGame.ts        # 遊戲行動送出
│   │   └── useRealtime.ts    # WebSocket 訂閱
│   │
│   ├── store/
│   │   └── gameStore.ts      # 現有（改由 Realtime 驅動）
│   │
│   └── types/
│       └── index.ts
│
├── .env.local                # VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
├── .env.production
└── wrangler.toml             # Cloudflare Pages（現有）
```

### 3.2 後端（全遷移至 Supabase）

```
supabase/
├── config.toml
├── migrations/
│   ├── 20240001_init.sql         # 初始 Schema
│   ├── 20240002_rls.sql          # Row Level Security
│   └── 20240003_functions.sql    # DB 觸發器
│
└── functions/
    ├── _shared/
    │   ├── types.ts              # 搬自 backend/src/types/index.ts
    │   └── rules.ts              # 搬自 backend/src/game/rules.ts
    ├── create-room/index.ts
    ├── join-room/index.ts
    ├── start-game/index.ts
    └── game-action/index.ts      # 核心邏輯，搬自 engine.ts
```

---

## 四、Supabase 資料庫 Schema

### ERD 關係圖

```
auth.users (Supabase 內建)
    │ 1:1
profiles ──── game_players ──── games
                                  │ 1:1
                              game_states
                                  │ 1:N
                              game_actions (行動日誌)
```

### 完整 Schema

```sql
-- profiles（擴充使用者資料）
CREATE TABLE public.profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username     TEXT UNIQUE NOT NULL,
  avatar_url   TEXT,
  games_played INT DEFAULT 0,
  games_won    INT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- games（遊戲房間）
CREATE TABLE public.games (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code    TEXT UNIQUE NOT NULL,
  status       TEXT NOT NULL DEFAULT 'waiting',  -- waiting|in_progress|finished
  max_players  INT NOT NULL DEFAULT 4,            -- 2~5
  host_id      UUID REFERENCES profiles(id),
  winner_id    UUID REFERENCES profiles(id),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  started_at   TIMESTAMPTZ,
  ended_at     TIMESTAMPTZ
);

-- game_players（玩家在特定局的狀態）
CREATE TABLE public.game_players (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id        UUID REFERENCES games(id) ON DELETE CASCADE,
  user_id        UUID REFERENCES profiles(id),
  seat_order     INT NOT NULL,
  is_governor    BOOLEAN DEFAULT FALSE,
  doubloons      INT DEFAULT 2,
  victory_points INT DEFAULT 0,
  colonists      INT DEFAULT 0,
  plantations    JSONB DEFAULT '[]',   -- [{type, colonized}]
  buildings      JSONB DEFAULT '[]',   -- [{type, colonists, vp}]
  goods          JSONB DEFAULT '{}',   -- {corn, indigo, sugar, tobacco, coffee}
  is_connected   BOOLEAN DEFAULT TRUE,
  joined_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(game_id, user_id),
  UNIQUE(game_id, seat_order)
);

-- game_states（遊戲當前快照 — Realtime 核心）
CREATE TABLE public.game_states (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id             UUID REFERENCES games(id) ON DELETE CASCADE UNIQUE,
  round               INT DEFAULT 1,
  phase               TEXT DEFAULT 'role_selection',  -- role_selection|action|end_round
  current_player_seat INT DEFAULT 0,
  governor_seat       INT DEFAULT 0,
  roles_available     JSONB NOT NULL,   -- [{role, doubloons_bonus}]
  roles_selected      JSONB DEFAULT '{}',
  ships               JSONB NOT NULL,   -- [{capacity, cargo_type, cargo_count}]
  trading_house       JSONB DEFAULT '[]',
  plantation_supply   JSONB NOT NULL,
  plantation_visible  JSONB NOT NULL,
  buildings_market    JSONB NOT NULL,
  supply              JSONB NOT NULL,   -- {colonists, vp_tokens, goods:{...}}
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- game_actions（行動日誌 / 可回放）
CREATE TABLE public.game_actions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id     UUID REFERENCES games(id) ON DELETE CASCADE,
  player_id   UUID REFERENCES game_players(id),
  round       INT NOT NULL,
  phase       TEXT NOT NULL,
  action_type TEXT NOT NULL,  -- select_role|build|ship|trade|produce|settle|mayor
  action_data JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE games        ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_states  ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_actions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "profiles: self read/write" ON profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "games: authenticated read" ON games
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "game_states: participant read" ON game_states
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM game_players
      WHERE game_id = game_states.game_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "game_players: participant read" ON game_players
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM game_players gp
      WHERE gp.game_id = game_players.game_id AND gp.user_id = auth.uid()
    )
  );
```

### Realtime 訂閱策略

| 訂閱頻道 | 事件 | 前端用途 |
|---------|------|---------|
| `game_states` | `UPDATE` | 廣播完整遊戲狀態給房間內所有玩家 |
| `game_players` | `UPDATE` | 即時更新個別玩家面板（金幣、VP、建築） |
| `game_actions` | `INSERT` | 顯示即時行動日誌 |

---

## 五、所需 API Keys 清單

### Supabase（請先建立專案，選擇 ap-southeast-2 Sydney）

| 變數名稱 | 取得位置 | 機密性 |
|---------|---------|-------|
| `VITE_SUPABASE_URL` | Dashboard → Settings → API → Project URL | 公開 |
| `VITE_SUPABASE_ANON_KEY` | Dashboard → Settings → API → anon (public) | 公開 |
| `SUPABASE_SERVICE_ROLE_KEY` | Dashboard → Settings → API → service_role | **機密，勿公開** |
| `SUPABASE_JWT_SECRET` | Dashboard → Settings → API → JWT Secret | **機密** |

### Cloudflare Pages（現有，確認即可）

| 變數名稱 | 取得位置 |
|---------|---------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare → My Profile → API Tokens |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Dashboard → 右側 Account ID |

---

## 六、第二階段：基礎建設與連線

**目標**：完成認證系統、資料庫初始化、Realtime 連線驗證

1. **初始化 Supabase CLI** — `supabase init`，建立本地開發環境，套用 migrations
2. **前端安裝 SDK** — `npm install @supabase/supabase-js`，建立 `lib/supabase.ts`
3. **認證頁面** — LoginPage / RegisterPage，`useAuth.ts` hook，保護路由
4. **大廳系統** — LobbyPage + `create-room` / `join-room` Edge Functions
5. **Realtime PoC** — `useRealtime.ts` hook，房間玩家清單即時更新，測試 Sydney 延遲
6. **CI/CD 更新** — 移除 Fly.io 步驟，加入 Supabase migrations 自動套用

---

## 七、第三階段：核心遊戲邏輯

**目標**：遷移遊戲引擎至 Edge Functions，實現完整多人對局

1. **遷移 `engine.ts`** → `supabase/functions/game-action/`（適配 Deno 環境）
2. **`start-game` Edge Function** — 初始化遊戲狀態，寫入 `game_states`
3. **`game-action` Edge Function**（核心）：
   - 驗證 JWT → 確認玩家身份
   - 驗證行動合法性
   - 原子性更新 `game_states` + `game_players`
   - 寫入 `game_actions` 日誌 → 觸發 Realtime 廣播
4. **前端整合** — Board.tsx 改為呼叫 Supabase Edge Fn，`useGame.ts` hook
5. **終局邏輯** — VP 計算，更新 `games.status`，`profiles` 統計
6. **端對端測試** — `supabase start` 全端本地測試，2 人完整對局

---

## 八、技術遷移摘要

| 移除 | 新增 |
|------|------|
| Express server (`backend/src/server.ts`) | Supabase Edge Functions |
| Socket.IO (`socket.io` / `socket.io-client`) | Supabase Realtime |
| 記憶體狀態 (`roomManager.ts`) | Supabase PostgreSQL |
| Fly.io 部署 (`fly.toml`) | Supabase Cloud |
| Redis | 不需要（狀態持久化在 DB）|
| 無認證 | Supabase Auth |
