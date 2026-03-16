import useGameStore, { type ResourceType } from '../store/gameStore';

const productionIcons: Record<ResourceType, string> = {
  corn: '🌽',
  indigo: '💙',
  sugar: '🍬',
  tobacco: '🌿',
  coffee: '☕',
};

export default function BuildingMarket() {
  const { buildingsAvailable, selectedRole, currentPlayerIndex, players, buyBuilding } = useGameStore();

  const currentPlayer = players[currentPlayerIndex];
  const canBuy = selectedRole === 'builder';

  const getBuildCost = (cost: number) => (canBuy ? Math.max(0, cost - 1) : cost);

  const handleBuyBuilding = (buildingId: string) => {
    if (currentPlayer && canBuy) {
      const building = buildingsAvailable.find(b => b.id === buildingId);
      if (building && currentPlayer.doubloons >= getBuildCost(building.cost)) {
        buyBuilding(currentPlayer.id, buildingId);
      }
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-600 rounded-2xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="px-5 py-3 bg-slate-700 border-b border-slate-600 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🏛️</span>
          <h2 className="text-white font-bold">Building Market</h2>
        </div>
        {canBuy && (
          <span className="text-green-300 text-xs font-semibold bg-green-900/40 border border-green-700/40 px-2.5 py-1 rounded-full">
            Builder: −1 coin
          </span>
        )}
      </div>

      <div className="p-4">
        {/* Legend */}
        <div className="flex gap-4 mb-3 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-blue-500 inline-block"></span>
            Production — produces goods
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-purple-500 inline-block"></span>
            Violet — special abilities & VP
          </span>
        </div>

        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {buildingsAvailable.length === 0 ? (
            <div className="py-8 text-center text-slate-500 italic text-sm">No buildings available</div>
          ) : (
            buildingsAvailable.map((building) => {
              const cost = getBuildCost(building.cost);
              const canAfford = currentPlayer && currentPlayer.doubloons >= cost;
              const isProduction = building.type === 'production';

              return (
                <button
                  key={building.id}
                  onClick={() => canAfford && handleBuyBuilding(building.id)}
                  disabled={!canBuy || !canAfford}
                  className={`
                    w-full text-left rounded-xl border px-4 py-3 transition-all duration-150 outline-none
                    flex items-start justify-between gap-3
                    ${canBuy
                      ? canAfford
                        ? 'border-amber-500/50 bg-amber-900/20 hover:bg-amber-900/40 hover:border-amber-400 cursor-pointer active:scale-[0.99] focus:ring-2 focus:ring-amber-400'
                        : 'border-red-900/40 bg-red-900/10 opacity-50 cursor-not-allowed'
                      : 'border-slate-600 bg-slate-700/30 cursor-default'}
                  `}
                >
                  {/* Building info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-bold text-sm">{building.name}</span>
                      <span className={`
                        text-[10px] font-semibold px-1.5 py-0.5 rounded
                        ${isProduction ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'}
                      `}>
                        {isProduction ? 'Production' : 'Violet'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                      {building.productionType && (
                        <span>Makes: {productionIcons[building.productionType]}</span>
                      )}
                      <span>👷 {building.maxOccupants} workers</span>
                      <span>⭐ {building.vp} VP</span>
                    </div>
                  </div>

                  {/* Cost */}
                  <div className="text-right shrink-0">
                    <div className={`font-bold text-base ${canBuy && cost < building.cost ? 'text-green-400' : 'text-amber-400'}`}>
                      {cost} 💰
                    </div>
                    {canBuy && building.cost > cost && (
                      <div className="text-[10px] text-green-400 font-semibold">Save {building.cost - cost}!</div>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
