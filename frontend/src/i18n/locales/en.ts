const en = {
  common: {
    round: 'Round',
    phase: 'Phase',
    yourTurn: 'Your Turn',
    turn: "{{name}}'s turn",
    governor: 'Governor',
    pass: 'Pass',
    empty: 'Empty',
    backToLobby: '← Back to Lobby',
    gameLog: 'Game Log',
    opponents: 'Opponents',
    noEvents: 'No events yet.',
    events_one: '{{count}} event',
    events_other: '{{count}} events',
    log: 'Log',
    coins: 'coins',
    vp: 'VP',
    free: 'free',
    thinking: 'thinking…',
    noGoods: 'no goods',
    tiles: 'tiles',
    bldgs: 'bldgs',
    goods: 'goods',
    gold: 'gold',
    col: 'col',
    vpSupply: 'VP: {{n}}',
    colonistSupply: 'Colonists: {{supply}}+{{ship}}⛵',
    doneShipping: 'Done Shipping',
  },

  resources: {
    corn: 'Corn',
    indigo: 'Indigo',
    sugar: 'Sugar',
    tobacco: 'Tobacco',
    coffee: 'Coffee',
    quarry: 'Quarry',
  },

  roles: {
    settler: 'Settler',
    builder: 'Builder',
    mayor: 'Mayor',
    craftsman: 'Craftsman',
    captain: 'Captain',
    trader: 'Trader',
    prospector: 'Prospector',
    role_selection: 'Role Selection',
    game_over: 'Game Over',
    captain_cleanup: 'Captain',
  },

  roleDesc: {
    settler: 'Take a plantation tile to add to your island',
    builder: 'Buy a building at a discount',
    mayor: 'Distribute colonists to your plantations and buildings',
    craftsman: 'Produce goods from your production chains',
    captain: 'Ship goods on cargo ships for victory points',
    trader: 'Sell a good to the trading house for doubloons',
    prospector: 'Collect 1 doubloon from the bank',
  },

  island: {
    yourPlantations: 'Your Plantations',
    yourCity: 'Your City',
    noPlantations: 'No plantations yet',
    noBuildings: 'No buildings yet — use the Builder role',
    tiles: '{{n}} tiles',
    slots: '{{used}}/12 slots',
  },

  aiThinking: {
    deciding: '{{name}} is deciding…',
    phase: 'Phase: {{phase}}',
  },

  roleSelection: {
    opponentChoosing: 'Opponent is choosing…',
    chooseRole: 'Choose Your Role',
    subtitle: 'Select a role to activate its privilege and action for all players.',
    scroll: 'Scroll to see all roles →',
  },

  builder: {
    title: '🏗️ Builder — Buy a Building',
    opponentBuying: '{{name}} is considering buildings...',
    builderDiscount: 'You get −1 cost as the Builder.',
    fullPrice: 'Buy at full price.',
    quarryDiscount: 'Quarry discount: −{{n}}.',
    totalDiscount: 'Total discount: −{{n}}',
    productionBuildings: 'Production Buildings',
    violetBuildings: 'Violet Buildings',
    majorBuildings: 'Major Buildings (4 VP)',
    large: '2×',
    left: '{{n}} left',
    vp: '⭐{{n}} VP',
    workers: '👷×{{n}}',
  },

  settler: {
    title: '🌱 Settler — Choose a Plantation',
    opponentChoosing: '{{name}} is choosing a plantation...',
    instructions: 'Take one plantation tile to add to your island.',
    settlerBonus: ' As the Settler, you may also take a quarry.',
    quarryDesc: '−1 building cost',
    quarriesLeft: '{{n}} quarries remaining in supply',
  },

  captain: {
    title: '⛵ Captain — Ship Goods',
    opponentShipping: '{{name}} is shipping goods...',
    mustShip: 'You must ship if able. Earn VP for each good shipped.',
    ship: 'Ship {{n}}',
    capacity: '(capacity: {{n}})',
    loadResource: 'Load {{resource}} ×{{qty}}',
    full: '✓ Ship is full — sailing!',
    wharf: '🏗️ Wharf — Ship Any Type',
    wharfLoad: 'Wharf {{resource}} ×{{qty}}',
  },

  craftsman: {
    title: '⚒️ Craftsman — Bonus Good',
    producing: 'Producing goods...',
    opponentProducing: '{{name}} is producing...',
    instructions: 'All players have produced goods. As the Craftsman, choose 1 bonus good to produce.',
    yourGoods: 'Your Current Goods',
    chooseBonus: 'Choose Bonus Good',
    bonus: '+1 bonus',
    noneAvailable: 'No producible goods available for bonus.',
  },

  mayor: {
    title: '👑 Mayor — Colonists Distributed!',
    distributed: 'Colonists have been automatically assigned to your plantations and buildings.',
    checkBoard: 'Check your island board to see the updated assignments.',
  },

  trader: {
    title: '💰 Trader — Sell Goods',
    opponentTrading: '{{name}} is trading...',
    instructions: 'Sell one good to the trading house.',
    bonus: 'Bonus: +{{n}} doubloon',
    bonusPlural: 'Bonus: +{{n}} doubloons',
    tradingHouse: 'Trading House ({{filled}}/4)',
    houseFull: 'Trading house is full!',
    yourGoods: 'Your Goods',
    alreadyInHouse: 'Already in trading house',
    price: '+{{price}} 💰',
    priceBreakdown: '(base {{base}} + {{bonus}} bonus)',
  },

  prospector: {
    title: 'Prospector',
    collected: '+1 doubloon collected!',
  },

  setup: {
    title: 'Puerto Rico',
    subtitle: 'Single Player — You vs 4 Rivals',
    difficulty: 'AI Difficulty',
    easy: '🌿 Easy',
    medium: '⚔️ Medium',
    easyDesc: 'Relaxed play. Great for learning the game.',
    mediumDesc: 'Strategic rivals who prioritize production chains.',
    players: '👥 You + 4 AI opponents (5 players)',
    objective: '🎯 Most Victory Points through shipping, building, producing',
    duration: '⏱️ ~15–25 minutes per game',
    begin: 'Begin the Game',
    back: '← Back to Lobby',
  },

  localMode: {
    banner: 'Local Test Mode — no backend required',
    back: '← Back to Lobby',
  },

  log: {
    title: '📜 Game Log',
    noEvents: 'No events yet.',
    events_one: '{{count}} event',
    events_other: '{{count}} events',
  },

  gameOver: {
    title: 'Game Over!',
    subtitle: 'See the final scores.',
  },
} as const;

export type TranslationKeys = typeof en;
export default en;
