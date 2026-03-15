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

  const getBuildCost = (cost: number) => {
    return canBuy ? Math.max(0, cost - 1) : cost;
  };

  const handleBuyBuilding = (buildingId: string) => {
    if (currentPlayer && canBuy) {
      const building = buildingsAvailable.find(b => b.id === buildingId);
      if (building) {
        const cost = getBuildCost(building.cost);
        if (currentPlayer.doubloons >= cost) {
          buyBuilding(currentPlayer.id, buildingId);
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-amber-700 to-amber-600 px-4 py-3 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span>🏛️</span>
          Building Market
        </h2>
        {canBuy && (
          <span className="text-amber-200 text-sm font-medium">
            Builder discount: -1 coin
          </span>
        )}
      </div>
      
      <div className="p-4">
        <div className="space-y-3 max-h-72 overflow-y-auto">
          {buildingsAvailable.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <p>No buildings available</p>
            </div>
          ) : (
            buildingsAvailable.map((building) => {
              const cost = getBuildCost(building.cost);
              const canAfford = currentPlayer && currentPlayer.doubloons >= cost;

              return (
                <div
                  key={building.id}
                  className={`
                    rounded-lg border-2 p-3 transition-all duration-200
                    ${canBuy 
                      ? canAfford 
                        ? 'border-amber-300 bg-amber-50 hover:bg-amber-100 cursor-pointer' 
                        : 'border-red-200 bg-red-50 opacity-70'
                      : 'border-gray-200 bg-gray-50'
                    }
                  `}
                  onClick={() => canAfford && handleBuyBuilding(building.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-800">{building.name}</h3>
                        <span className={`
                          px-2 py-0.5 rounded text-xs font-medium
                          ${building.type === 'production' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-purple-100 text-purple-800'}
                        `}>
                          {building.type === 'production' ? 'Production' : 'Violet'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        {building.productionType && (
                          <span className="flex items-center gap-1">
                            Makes: {productionIcons[building.productionType]}
                          </span>
                        )}
                        <span>👷 {building.maxOccupants} workers</span>
                        <span>⭐ {building.vp} VP</span>
                      </div>
                    </div>

                    <div className="text-right ml-4">
                      <div className={`
                        font-bold text-lg
                        ${canBuy && cost < building.cost ? 'text-green-600' : 'text-amber-700'}
                      `}>
                        {cost} 💰
                      </div>
                      {canBuy && building.cost > cost && (
                        <div className="text-xs text-green-600 font-medium">
                          Save {building.cost - cost}!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Building Info */}
        <div className="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-500">
          <p className="mb-1">
            <span className="inline-block w-3 h-3 bg-blue-100 rounded mr-1"></span>
            <strong>Production buildings</strong> - Produce goods when colonized
          </p>
          <p>
            <span className="inline-block w-3 h-3 bg-purple-100 rounded mr-1"></span>
            <strong>Violet buildings</strong> - Special abilities and end-game VP
          </p>
        </div>
      </div>
    </div>
  );
}