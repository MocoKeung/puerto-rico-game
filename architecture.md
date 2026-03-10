# 波多黎各桌游网页版架构设计

**版本**: MVP v1.0  
**支持人数**: 4-5人  
**创建日期**: 2026-03-08

---

## 1. 游戏机制简化版图（MVP版本）

### 1.1 核心游戏循环
波多黎各是一款经典的工人放置类策略游戏，玩家扮演殖民者开发波多黎各岛。MVP版本简化了原版游戏机制，保留核心玩法：

- **角色轮选制**: 每回合玩家选择不同角色（拓荒者、建筑师、市长、商人、船长）
- **双重胜利条件**: 建筑分数 + 货物贸易分数
- **资源管理**: 种植作物（玉米、靛蓝、咖啡、烟草）并加工
- **建筑建设**: 建造生产建筑和城市建筑
- **船只贸易**: 将货物运往欧洲换取胜利点

### 1.2 MVP版本简化点
1. **移除高级建筑**: 保留基础生产建筑和小型/大型建筑
2. **简化贸易**: 固定货物价值，移除市场波动
3. **固定船只**: 预设3艘船，容量分别为4、5、6
4. **移除外籍工人**: 简化人口增长机制
5. **固定VP池**: 游戏结束时VP最多的玩家获胜

### 1.3 游戏组件
- **玩家面板**: 个人资源、作物种植园、建筑物
- **中央岛屿板**: 公共作物堆、建筑市场、船只、贸易站
- **角色卡**: 5个角色（拓荒者、建筑师、市长、商人、船长）
- **资源标记**: 玉米、靛蓝、咖啡、烟草、糖（5种）
- **VP标记**: 胜利点数
- **杜布隆币**: 游戏货币

---

## 2. 技术栈选择

### 2.1 技术选型对比表

| 技术维度 | 选项A (推荐) | 选项B | 选项C | 选择理由 |
|---------|------------|-------|-------|---------|
| **前端框架** | React 18 + TypeScript | Vue 3 + TypeScript | Svelte + TypeScript | React生态丰富，状态管理方案成熟，适合复杂游戏状态 |
| **状态管理** | Zustand + Immer | Redux Toolkit | MobX | Zustand轻量级，Immer保证不可变状态，适合游戏状态频繁更新 |
| **实时通信** | Socket.IO | WebSocket原生 | Colyseus | Socket.IO成熟稳定，自动降级，适合实时游戏 |
| **后端框架** | Node.js + Express | NestJS | Fastify | Express简单灵活，快速开发MVP |
| **数据持久化** | Redis + MongoDB | PostgreSQL | In-Memory | Redis缓存游戏状态，MongoDB存储游戏记录 |
| **部署方案** | Docker + Nginx | Vercel/Netlify | 传统VPS | Docker容器化便于部署和扩展 |
| **UI组件库** | Tailwind CSS + Headless UI | MUI | Ant Design | Tailwind灵活定制，适合游戏UI设计 |
| **动画库** | Framer Motion | React Spring | CSS Animation | Framer Motion流畅自然，适合游戏交互 |

### 2.2 技术架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        客户端层 (浏览器)                      │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  React 18 + TypeScript                                   │ │
│  │  ├─ Zustand (全局状态管理)                               │ │
│  │  ├─ Framer Motion (动画效果)                            │ │
│  │  └─ Tailwind CSS (样式)                                │ │
│  └─────────────────────────────────────────────────────────┘ │
│                            ↕ WebSocket                       │
├─────────────────────────────────────────────────────────────┤
│                        实时通信层                           │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Socket.IO Server (房间管理、广播)                        │ │
│  │  ├─ 游戏房间匹配                                         │ │
│  │  └─ 实时状态同步                                         │ │
│  └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                        游戏逻辑层                           │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Node.js + Express                                       │ │
│  │  ├─ 游戏状态机 (PuertoRicoGameState)                     │ │
│  │  ├─ 角色行为处理器 (RoleActionHandler)                   │ │
│  │  └─ 胜利条件计算器 (VictoryCalculator)                   │ │
│  └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                        数据存储层                           │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Redis (实时游戏状态缓存)                                │ │
│  │  MongoDB (游戏记录、玩家统计)                            │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 开发环境
- **包管理**: pnpm (速度快，磁盘空间优化)
- **构建工具**: Vite (快速HMR，适合React开发)
- **代码规范**: ESLint + Prettier + TypeScript严格模式
- **测试**: Jest + React Testing Library (单元测试) + Cypress (E2E测试)
- **CI/CD**: GitHub Actions

---

## 3. 数据模型设计

### 3.1 核心数据结构

#### 游戏主状态 (GameState)
```typescript
interface GameState {
  gameId: string;
  status: 'waiting' | 'setup' | 'playing' | 'finished';
  phase: 'roleSelection' | 'action' | 'gameEnd';
  currentRole: RoleKey | null;
  currentPlayerIndex: number;
  roles: Role[];
  governorIndex: number;
  round: number;
  gameLog: GameLogEntry[];
  players: Player[];
  island: IslandBoard;
  vps: VPBank;
}
```

#### 玩家 (Player)
```typescript
interface Player {
  id: string;
  name: string;
  index: number;
  role: PlayerRole; // 本回合所选角色
  resources: Resources;
  plantations: Plantation[];
  buildings: Building[];
  colonists: ColonistCount;
  tiles: TileCount;
  vpChips: number;
  doubloons: number;
}

interface Resources {
  corn: number;
  indigo: number;
  coffee: number;
  tobacco: number;
  sugar: number;
}
```

#### 建筑 (Building)
```typescript
interface Building {
  id: string;
  type: BuildingType;
  tier: 'production' | 'violet';
  cost: number;
  occupied: number;
  capacity: number;
  vp: number;
  active: boolean;
  effect?: BuildingEffect;
}

type BuildingType = 
  | 'small_indigo_plant' | 'small_sugar_mill' | 'indigo_plant' | 'sugar_mill'
  | 'tobacco_storage' | 'coffee_roaster' | 'small_market' | 'hacienda'
  | 'construction_hut' | 'small_warehouse' | 'hospice' | 'office'
  | 'large_market' | 'large_warehouse' | 'university' | 'factory'
  | 'harbor' | 'wharf';
```

#### 岛屿板 (IslandBoard)
```typescript
interface IslandBoard {
  supply: ResourceSupply;
  plantationDeck: Plantation[];
  availablePlantations: Plantation[];
  buildingMarket: Building[];
  tradingHouse: TradingHouse;
  ships: Ship[];
  colonists: ColonistSupply;
}

interface Ship {
  id: string;
  capacity: number;
  cargo: { resource: ResourceType; count: number }[];
  isFull: boolean;
}
```

### 3.2 JSON Schema定义

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Puerto Rico Game State",
  "type": "object",
  "definitions": {
    "Player": {
      "type": "object",
      "properties": {
        "id": { "type": "string", "format": "uuid" },
        "name": { "type": "string", "minLength": 1, "maxLength": 20 },
        "index": { "type": "integer", "minimum": 0 },
        "resources": {
          "type": "object",
          "properties": {
            "corn": { "type": "integer", "minimum": 0 },
            "indigo": { "type": "integer", "minimum": 0 },
            "coffee": { "type": "integer", "minimum": 0 },
            "tobacco": { "type": "integer", "minimum": 0 },
            "sugar": { "type": "integer", "minimum": 0 }
          }
        },
        "doubloons": { "type": "integer", "minimum": 0 },
        "vpChips": { "type": "integer", "minimum": 0 },
        "colonists": {
          "type": "object",
          "properties": {
            "available": { "type": "integer", "minimum": 0 },
            "onPlantations": { "type": "integer", "minimum": 0 },
            "onBuildings": { "type": "integer", "minimum": 0 }
          }
        }
      },
      "required": ["id", "name", "index"]
    },
    "Building": {
      "type": "object",
      "properties": {
        "id": { "type": "string" },
        "type": { "type": "string" },
        "tier": { "type": "string", "enum": ["production", "violet"] },
        "cost": { "type": "integer", "minimum": 0 },
        "occupied": { "type": "integer", "minimum": 0 },
        "capacity": { "type": "integer", "minimum": 1 },
        "vp": { "type": "integer", "minimum": 0 },
        "active": { "type": "boolean" }
      }
    },
    "Ship": {
      "type": "object",
      "properties": {
        "id": { "type": "string" },
        "capacity": { "type": "integer", "minimum": 1 },
        "cargo": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "resource": { "