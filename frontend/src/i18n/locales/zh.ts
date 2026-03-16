const zh = {
  common: {
    round: '第{{n}}轮',
    phase: '阶段',
    yourTurn: '你的回合',
    turn: '{{name}} 的回合',
    governor: '总督',
    pass: '放弃',
    empty: '空',
    backToLobby: '← 返回大厅',
    gameLog: '游戏日志',
    opponents: '对手',
    noEvents: '暂无事件。',
    events_one: '{{count}} 条事件',
    events_other: '{{count}} 条事件',
    log: '日志',
    coins: '金币',
    vp: 'VP',
    free: '空闲',
    thinking: '思考中…',
    noGoods: '无货物',
    tiles: '地块',
    bldgs: '建筑',
    goods: '货物',
    gold: '金',
    col: '殖民',
    vpSupply: 'VP: {{n}}',
    colonistSupply: '殖民者: {{supply}}+{{ship}}⛵',
    doneShipping: '完成运送',
  },

  resources: {
    corn: '玉米',
    indigo: '靛蓝',
    sugar: '甘蔗',
    tobacco: '烟草',
    coffee: '咖啡',
    quarry: '采石场',
  },

  roles: {
    settler: '拓荒者',
    builder: '建筑师',
    mayor: '市长',
    craftsman: '工匠',
    captain: '船长',
    trader: '商人',
    prospector: '探矿者',
    role_selection: '选择角色',
    game_over: '游戏结束',
    captain_cleanup: '船长',
  },

  roleDesc: {
    settler: '取一块种植园地块加入你的岛屿',
    builder: '以折扣价购买建筑',
    mayor: '将殖民者分配到种植园和建筑',
    craftsman: '利用生产链生产货物',
    captain: '将货物装船并赚取胜利点',
    trader: '向交易所出售货物换取金币',
    prospector: '从银行获得1枚金币',
  },

  island: {
    yourPlantations: '你的种植园',
    yourCity: '你的城市',
    noPlantations: '暂无种植园',
    noBuildings: '暂无建筑 — 使用建筑师角色',
    tiles: '{{n}} 块地',
    slots: '{{used}}/12 槽位',
  },

  aiThinking: {
    deciding: '{{name}} 正在决策…',
    phase: '阶段：{{phase}}',
  },

  roleSelection: {
    opponentChoosing: '对手正在选择…',
    chooseRole: '选择你的角色',
    subtitle: '选择一个角色以激活所有玩家的特权与行动。',
    scroll: '滑动查看所有角色 →',
  },

  builder: {
    title: '🏗️ 建筑师 — 购买建筑',
    opponentBuying: '{{name}} 正在考虑购买建筑...',
    builderDiscount: '作为建筑师，费用减少 1。',
    fullPrice: '按原价购买。',
    quarryDiscount: '采石场折扣：−{{n}}。',
    totalDiscount: '总折扣：−{{n}}',
    productionBuildings: '生产建筑',
    violetBuildings: '紫色建筑',
    majorBuildings: '大型建筑（4 VP）',
    large: '大型',
    left: '剩余 {{n}} 个',
    vp: '⭐{{n}} VP',
    workers: '👷×{{n}}',
  },

  settler: {
    title: '🌱 拓荒者 — 选择种植园',
    opponentChoosing: '{{name}} 正在选择种植园...',
    instructions: '取一块种植园地块加入你的岛屿。',
    settlerBonus: '作为拓荒者，你也可以取一块采石场。',
    quarryDesc: '建筑费用 −1',
    quarriesLeft: '供应中剩余 {{n}} 块采石场',
  },

  captain: {
    title: '⛵ 船长 — 运送货物',
    opponentShipping: '{{name}} 正在运送货物...',
    mustShip: '如能运送则必须运送。每运送一件货物得 1 胜利点。',
    ship: '船只 {{n}}',
    capacity: '（容量：{{n}}）',
    loadResource: '装载 {{resource}} ×{{qty}}',
    full: '✓ 满载 — 出发！',
    wharf: '🏗️ 码头 — 运送任意货物',
    wharfLoad: '码头装载 {{resource}} ×{{qty}}',
  },

  craftsman: {
    title: '⚒️ 工匠 — 额外货物',
    producing: '生产货物中...',
    opponentProducing: '{{name}} 正在生产...',
    instructions: '所有玩家已生产货物。作为工匠，选择 1 件额外货物。',
    yourGoods: '你当前的货物',
    chooseBonus: '选择额外货物',
    bonus: '+1 额外',
    noneAvailable: '没有可生产的额外货物。',
  },

  mayor: {
    title: '👑 市长 — 殖民者已分配！',
    distributed: '殖民者已自动分配到你的种植园和建筑。',
    checkBoard: '查看你的岛屿板以了解最新分配情况。',
  },

  trader: {
    title: '💰 商人 — 出售货物',
    opponentTrading: '{{name}} 正在交易...',
    instructions: '向交易所出售一件货物。',
    bonus: '奖励：+{{n}} 金币',
    bonusPlural: '奖励：+{{n}} 金币',
    tradingHouse: '交易所（{{filled}}/4）',
    houseFull: '交易所已满！',
    yourGoods: '你的货物',
    alreadyInHouse: '已在交易所中',
    price: '+{{price}} 💰',
    priceBreakdown: '（基础 {{base}} + {{bonus}} 奖励）',
  },

  prospector: {
    title: '探矿者',
    collected: '获得 1 枚金币！',
  },

  setup: {
    title: '波多黎各',
    subtitle: '单人模式 — 你与 4 个对手',
    difficulty: 'AI 难度',
    easy: '🌿 简单',
    medium: '⚔️ 中等',
    easyDesc: '轻松游戏，适合新手入门。',
    mediumDesc: '战略对手，优先发展生产链。',
    players: '👥 你 + 4 个 AI 对手（共 5 人）',
    objective: '🎯 通过运输、建造、生产赢得最多胜利点',
    duration: '⏱️ 每局约 15–25 分钟',
    begin: '开始游戏',
    back: '← 返回大厅',
  },

  localMode: {
    banner: '本地测试模式 — 无需后端',
    back: '← 返回大厅',
  },

  log: {
    title: '📜 游戏日志',
    noEvents: '暂无事件。',
    events_one: '{{count}} 条事件',
    events_other: '{{count}} 条事件',
  },

  gameOver: {
    title: '游戏结束！',
    subtitle: '查看最终得分。',
  },
} as const;

export default zh;
