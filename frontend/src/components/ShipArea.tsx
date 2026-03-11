import { useGameStore, type ResourceType } from '../store/gameStore';

const resourceIcons: Record<ResourceType, string> = {
  corn: '🌽',
  indigo: '💙',
  sugar: '🍬',
  tobacco: '🌿',
  coffee: '☕',
};

export default function ShipArea() {
  const { ships, colonistShip, selectedRole, currentPlayerIndex, players, shipGoods } = useGameStore();

  const currentPlayer = players[currentPlayerIndex];
  const isCaptainPhase = selectedRole === 'captain';

  const handleShip = (shipId: string, resourceType: ResourceType) => {
    if (currentPlayer && isCaptainPhase) {
      shipGoods(currentPlayer.id, shipId, resourceType);
    }
  };

  const getAvailableResources = () => {
    if (!currentPlayer) return [];
    return (Object.entries(currentPlayer.resources) as [ResourceType, number][])
      .filter(([_, count]) => count > 0)
      .map(([type]) => type);
  };

  const availableResources = getAvailableResources();

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span>⛵</span>
          Shipping
        </h2>
        {isCaptainPhase && (
          <span className="text-blue-100 text-sm">
            Captain: +1 VP on first ship
          </span>
        )}
      </div>
      
      <div className="p-4 space-y-4">
        {/* Ships */}
        <div className="space-y-3">
          {ships.map((ship) => {
            const isFull = ship.filled >= ship.size;
            const percentage = (ship.filled / ship.size) * 100;
            
            return (
              <div key={ship.id} className={`
                rounded-lg border-2 p-3
                ${isFull ? 'border-green-400 bg-green-50' : 'border-blue-200 bg-blue-50'}
              `}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-blue-800">
                    {ship.size < 6 ? 'Small Ship' : ship.size < 8 ? 'Medium Ship' : 'Large Ship'}
                  </span>
                  <span className="text-sm text-blue-600">
                    Capacity: {ship.filled}/{ship.size}
                  </span>
                </div>
                
                {/* Cargo Bar */}
                <div className="h-8 bg-blue-100 rounded-lg overflow-hidden relative">
                  {ship.cargo && percentage > 0 && (
                    <div 
                      className="h-full absolute left-0 top-0 transition-all duration-500 flex items-center justify-center"
                      style={{ width: `${percentage}%` }}
                    >
                      <div className={`
                        h-full w-full flex items-center justify-center gap-1
                        ${ship.cargo === 'corn' ? 'bg-yellow-400' : ''}
                        ${ship.cargo === 'indigo' ? 'bg-blue-400' : ''}
                        ${ship.cargo === 'sugar' ? 'bg-gray-300' : ''}
                        ${ship.cargo === 'tobacco' ? 'bg-green-400' : ''}
                        ${ship.cargo === 'coffee' ? 'bg-amber-800' : ''}
                      `}>
                        <span className="text-lg">{resourceIcons[ship.cargo]}</span>
                        <span className="text-sm font-bold text-white">x{ship.filled}</span>
                      </div>
                    </div>
                  )}
                  {isFull && (
                    <div className="absolute inset-0 flex items-center justify-center bg-green-400/80">
                      <span className="text-white font-bold">✓ Full & Sailing!</span>
                    </div>
                  )}
                </div>

                {/* Ship Action */}
                {isCaptainPhase && !isFull && availableResources.length > 0 && (
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs text-blue-700">Ship:</span>
                    <div className="flex gap-1">
                      {availableResources.map((resource) => {
                        const canShip = !ship.cargo || ship.cargo === resource;
                        if (!canShip) return null;
                        return (
                          <button
                            key={resource}
                            onClick={() => handleShip(ship.id, resource)}
                            disabled={!canShip}
                            className={`
                              w-8 h-8 rounded flex items-center justify-center text-lg
                              ${canShip 
                                ? 'bg-white hover:bg-blue-100 border border-blue-300 shadow-sm' 
                                : 'bg-gray-200 opacity-50'
                              }
                            `}
                            title={`Ship ${resource}`}
                          >
                            {resourceIcons[resource]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Colonist Ship */}
        <div className="bg-amber-100 rounded-lg p-3 border border-amber-300">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-amber-800">🚢 Colonist Ship</span>
            <span className="text-amber-700 font-bold">{colonistShip} colonists</span>
          </div>
          <div className="mt-2 text-xs text-amber-700">
            Arrives with Mayor. Delivered to players for plantations and buildings.
          </div>
        </div>

        {/* Captain Instructions */}
        {isCaptainPhase && currentPlayer && (
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Your turn as Captain!</span> 
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Click a resource button above to ship your goods for VP. Each barrel = 1 VP.
            </p>
            {availableResources.length === 0 && (
              <p className="text-xs text-red-500 mt-1">
                You have no goods to ship.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
