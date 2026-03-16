import useGameStore, { type ResourceType } from '../store/gameStore';

const resourceIcons: Record<ResourceType, string> = {
  corn: '🌽',
  indigo: '💙',
  sugar: '🍬',
  tobacco: '🌿',
  coffee: '☕',
};

const cargoBg: Record<ResourceType, string> = {
  corn: 'bg-yellow-400',
  indigo: 'bg-blue-500',
  sugar: 'bg-gray-300',
  tobacco: 'bg-green-400',
  coffee: 'bg-amber-800',
};

interface Ship {
  id: string;
  size: number;
  cargo: ResourceType | null;
  filled: number;
}

const shipSizeName = (size: number) =>
  size <= 5 ? 'Small Ship' : size <= 7 ? 'Medium Ship' : 'Large Ship';

export default function ShipArea() {
  const { ships, colonistShip, selectedRole, currentPlayerIndex, players, shipGoods } = useGameStore();

  const currentPlayer = players[currentPlayerIndex];
  const isCaptainPhase = selectedRole === 'captain';

  const handleShip = (shipId: string, resourceType: ResourceType) => {
    if (currentPlayer && isCaptainPhase) {
      shipGoods(currentPlayer.id, shipId, resourceType);
    }
  };

  const availableResources = currentPlayer
    ? (Object.entries(currentPlayer.resources) as [ResourceType, number][])
        .filter(([_, count]) => count > 0)
        .map(([type]) => type)
    : [];

  return (
    <div className="bg-slate-800 border border-slate-600 rounded-2xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-700 border-b border-slate-600 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">⛵</span>
          <h2 className="text-white font-bold">Shipping</h2>
        </div>
        {isCaptainPhase && (
          <span className="text-sky-300 text-xs font-medium bg-sky-900/40 border border-sky-700/40 px-2.5 py-1 rounded-full">
            Captain: +1 VP on first ship
          </span>
        )}
      </div>

      <div className="p-4 space-y-3">
        {/* Cargo Ships */}
        {ships.map((ship: Ship) => {
          const isFull = ship.filled >= ship.size;
          const pct = Math.round((ship.filled / ship.size) * 100);

          return (
            <div
              key={ship.id}
              className={`
                rounded-xl border p-3 transition-all
                ${isFull ? 'border-green-500/60 bg-green-900/20' : 'border-slate-600 bg-slate-700/50'}
              `}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-200 font-semibold text-sm">{shipSizeName(ship.size)}</span>
                <span className="text-slate-400 text-xs">
                  {ship.cargo ? resourceIcons[ship.cargo] : '—'} &nbsp;
                  <span className={isFull ? 'text-green-400 font-semibold' : 'text-slate-300'}>
                    {ship.filled}/{ship.size}
                  </span>
                </span>
              </div>

              {/* Capacity bar */}
              <div className="h-5 bg-slate-600 rounded-lg overflow-hidden relative">
                {ship.cargo && pct > 0 && (
                  <div
                    className={`h-full ${cargoBg[ship.cargo]} transition-all duration-500 flex items-center justify-center`}
                    style={{ width: `${pct}%` }}
                  >
                    <span className="text-white text-xs font-bold drop-shadow">{ship.filled}</span>
                  </div>
                )}
                {isFull && (
                  <div className="absolute inset-0 flex items-center justify-center bg-green-500/80">
                    <span className="text-white text-xs font-bold">✓ Full & Sailing!</span>
                  </div>
                )}
              </div>

              {/* Ship action buttons */}
              {isCaptainPhase && !isFull && availableResources.length > 0 && (
                <div className="mt-2.5 flex items-center gap-2">
                  <span className="text-slate-400 text-xs">Load:</span>
                  <div className="flex gap-1.5">
                    {availableResources.map((resource) => {
                      const canLoad = !ship.cargo || ship.cargo === resource;
                      if (!canLoad) return null;
                      return (
                        <button
                          key={resource}
                          onClick={() => handleShip(ship.id, resource)}
                          className="w-8 h-8 rounded-lg bg-slate-600 hover:bg-slate-500 active:bg-slate-700 border border-slate-500 flex items-center justify-center text-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400"
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

        {/* Colonist Ship */}
        <div className="bg-amber-900/30 border border-amber-700/40 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🚢</span>
            <div>
              <div className="text-amber-200 font-semibold text-sm">Colonist Ship</div>
              <div className="text-amber-400/70 text-xs">Arrives with Mayor</div>
            </div>
          </div>
          <span className="bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-sm px-3 py-1 rounded-full">
            {colonistShip} colonists
          </span>
        </div>

        {/* Captain instructions */}
        {isCaptainPhase && currentPlayer && (
          <div className="bg-sky-900/40 border border-sky-600/30 rounded-xl p-3">
            <p className="text-sm text-sky-200 font-semibold">Your turn as Captain!</p>
            <p className="text-xs text-sky-300/80 mt-1">
              Click a resource button above to load and earn VP. Each barrel = 1 VP.
            </p>
            {availableResources.length === 0 && (
              <p className="text-xs text-red-400 mt-1">You have no goods to ship.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
