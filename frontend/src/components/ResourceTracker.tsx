import useGameStore, { type ResourceType } from '../store/gameStore';

const resourceConfig: Record<ResourceType, { icon: string; name: string; price: number; bg: string }> = {
  corn: { icon: '🌽', name: 'Corn', price: 0, bg: 'from-yellow-400 to-yellow-500' },
  indigo: { icon: '💙', name: 'Indigo', price: 1, bg: 'from-blue-400 to-blue-500' },
  sugar: { icon: '🍬', name: 'Sugar', price: 2, bg: 'from-gray-200 to-gray-300' },
  tobacco: { icon: '🌿', name: 'Tobacco', price: 3, bg: 'from-green-400 to-green-500' },
  coffee: { icon: '☕', name: 'Coffee', price: 4, bg: 'from-amber-800 to-amber-900' },
};

export default function ResourceTracker() {
  const { supplyResources, tradeHouse, selectedRole, currentPlayerIndex, players, tradeGood, produceResources } = useGameStore();
  
  const currentPlayer = players[currentPlayerIndex];
  const isTraderPhase = selectedRole === 'trader';
  const isActionPhase = selectedRole === 'captain' || selectedRole === 'mayor';

  const handleTrade = (resource: ResourceType) => {
    if (isTraderPhase && currentPlayer && currentPlayer.resources[resource] > 0) {
      tradeGood(currentPlayer.id, resource);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-3 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span>📦</span>
          Resources & Supply
        </h2>
        {isActionPhase && selectedRole === 'mayor' && (
          <button
            onClick={produceResources}
            className="bg-amber-400 hover:bg-amber-300 text-amber-900 px-3 py-1 rounded font-semibold text-sm transition-colors"
          >
            Produce
          </button>
        )}
      </div>
      
      <div className="p-4 space-y-4">
        {/* Supply Counts */}
        <div>
          <h3 className="text-sm font-semibold text-gray-600 mb-2">🏭 Production Supply</h3>
          <div className="grid grid-cols-5 gap-2">
            {(Object.entries(supplyResources) as [ResourceType, number][]).map(([type, count]) => {
              const config = resourceConfig[type];
              const hasPlayerResource = currentPlayer && currentPlayer.resources[type] > 0;
              return (
                <div key={type} className="text-center">
                  <div className={`
                    bg-gradient-to-br ${config.bg} rounded-lg p-2 shadow-sm
                    ${isTraderPhase && hasPlayerResource ? 'ring-2 ring-amber-400 cursor-pointer hover:shadow-md' : ''}
                  `} onClick={() => handleTrade(type)}>
                    <div className="text-2xl">{config.icon}</div>
                    <div className="text-xs font-bold text-white mt-1">{count}</div>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">{config.name}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trading House */}
        <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
          <h3 className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-2">
            <span>🏪</span>
            Trading House
          </h3>
          <div className="flex gap-2">
            {tradeHouse.map((slot, idx) => (
              <div key={idx} className={`
                w-12 h-12 rounded-lg flex items-center justify-center text-2xl
                ${slot ? `bg-gradient-to-br ${resourceConfig[slot].bg}` : 'bg-gray-200 border-2 border-dashed border-gray-300'}
              `}>
                {slot ? resourceConfig[slot].icon : ''}
              </div>
            ))}
          </div>
          <div className="mt-2 text-xs text-amber-700">
            Prices: 🌽0 💙1 🍬2 🌿3 ☕4 | Trader gets +1 bonus
          </div>
        </div>

        {/* Sell Instructions */}
        {isTraderPhase && currentPlayer && (
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Your turn to trade!</span> Click a resource icon above to sell it.
            </p>
            <div className="mt-2 text-xs text-blue-600">
              Your goods: 
              {(Object.entries(currentPlayer.resources) as [ResourceType, number][])
                .filter(([_, count]) => count > 0)
                .map(([type, count]) => `${count} ${resourceConfig[type].icon}`)
                .join(' ') || 'None'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}