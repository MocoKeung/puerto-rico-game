import useGameStore, { type ResourceType } from '../store/gameStore';

const resourceConfig: Record<ResourceType, { icon: string; name: string; price: number; bg: string; text: string }> = {
  corn:    { icon: '🌽', name: 'Corn',    price: 0, bg: 'bg-yellow-400', text: 'text-yellow-900' },
  indigo:  { icon: '💙', name: 'Indigo',  price: 1, bg: 'bg-blue-500',   text: 'text-white' },
  sugar:   { icon: '🍬', name: 'Sugar',   price: 2, bg: 'bg-gray-200',   text: 'text-gray-800' },
  tobacco: { icon: '🌿', name: 'Tobacco', price: 3, bg: 'bg-green-400',  text: 'text-green-900' },
  coffee:  { icon: '☕', name: 'Coffee',  price: 4, bg: 'bg-amber-800',  text: 'text-white' },
};

export default function ResourceTracker() {
  const { supplyResources, tradeHouse, selectedRole, currentPlayerIndex, players, tradeGood, produceResources } = useGameStore();

  const currentPlayer = players[currentPlayerIndex];
  const isTraderPhase = selectedRole === 'trader';
  const isMayorPhase = selectedRole === 'mayor';

  const handleTrade = (resource: ResourceType) => {
    if (isTraderPhase && currentPlayer && currentPlayer.resources[resource] > 0) {
      tradeGood(currentPlayer.id, resource);
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-600 rounded-2xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-700 border-b border-slate-600 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">📦</span>
          <h2 className="text-white font-bold">Supply & Trade</h2>
        </div>
        {isMayorPhase && (
          <button
            onClick={produceResources}
            className="bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-white font-semibold text-xs px-3 py-1.5 rounded-lg shadow transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            Produce
          </button>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Production Supply */}
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">🏭 Production Supply</div>
          <div className="grid grid-cols-5 gap-2">
            {(Object.entries(supplyResources) as [ResourceType, number][]).map(([type, count]) => {
              const cfg = resourceConfig[type];
              const canTrade = isTraderPhase && currentPlayer && currentPlayer.resources[type] > 0;
              return (
                <button
                  key={type}
                  onClick={() => handleTrade(type)}
                  disabled={!canTrade}
                  className={`
                    flex flex-col items-center gap-1 rounded-xl p-2 transition-all duration-150 outline-none
                    ${canTrade
                      ? 'ring-2 ring-amber-400 cursor-pointer hover:scale-105 hover:shadow-lg active:scale-95'
                      : 'cursor-default'}
                  `}
                >
                  <div className={`w-11 h-11 ${cfg.bg} ${cfg.text} rounded-xl flex items-center justify-center text-xl shadow-sm`}>
                    {cfg.icon}
                  </div>
                  <span className="text-white font-bold text-sm">{count}</span>
                  <span className="text-slate-400 text-[10px]">{cfg.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Trading House */}
        <div className="bg-amber-900/30 border border-amber-700/40 rounded-xl p-3">
          <div className="text-xs font-semibold text-amber-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <span>🏪</span> Trading House
          </div>
          <div className="flex gap-2">
            {tradeHouse.map((slot, idx) => (
              <div
                key={idx}
                className={`
                  w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm
                  ${slot
                    ? `${resourceConfig[slot].bg} ${resourceConfig[slot].text}`
                    : 'bg-slate-700 border-2 border-dashed border-slate-500'}
                `}
              >
                {slot ? resourceConfig[slot].icon : ''}
              </div>
            ))}
          </div>
          <div className="mt-2.5 text-xs text-amber-400/80">
            Prices: 🌽0 · 💙1 · 🍬2 · 🌿3 · ☕4 &nbsp;|&nbsp; Trader gets +1 bonus
          </div>
        </div>

        {/* Trader instructions */}
        {isTraderPhase && currentPlayer && (
          <div className="bg-blue-900/40 border border-blue-500/30 rounded-xl p-3">
            <p className="text-sm text-blue-200 font-semibold">Your turn to trade!</p>
            <p className="text-xs text-blue-300/80 mt-1">
              Click a resource above to sell it.
              &nbsp;Your goods:{' '}
              {(Object.entries(currentPlayer.resources) as [ResourceType, number][])
                .filter(([_, c]) => c > 0)
                .map(([t, c]) => `${c}${resourceConfig[t].icon}`)
                .join(' ') || 'None'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
