import useGameEngine from '../../../store/gameEngine';
import { ResourceIcon, ShipIcon } from '../../icons/ResourceIcons';
import { RESOURCE_ORDER, RESOURCE_LABELS } from '../../../data/constants';

export default function CaptainPanel() {
  const { ships, captainShipGoods, captainPass, captainUseWharf, waitingForHuman,
          players, activePlayerSeat, getAvailableShipsForResource } = useGameEngine();
  const player = players[activePlayerSeat];

  if (!waitingForHuman) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-bounce text-4xl mb-3">⛵</div>
          <p className="text-amber-600 font-medium">{player?.name} is shipping goods...</p>
        </div>
      </div>
    );
  }

  const humanPlayer = players[0];
  const hasWharf = humanPlayer.buildings.some(b => b.def.id === 'wharf' && b.colonists > 0);
  const goodsWithStock = RESOURCE_ORDER.filter(r => humanPlayer.goods[r] > 0);
  const canShipAnything = goodsWithStock.some(r => getAvailableShipsForResource(r).length > 0) || hasWharf;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-amber-900">⛵ Captain — Ship Goods</h2>
          <p className="text-sm text-amber-600">
            You <strong>must</strong> ship if able. Earn VP for each good shipped.
          </p>
        </div>
        {!canShipAnything && (
          <button
            onClick={() => captainPass(0)}
            className="px-4 py-2 border-2 border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50 transition-colors text-sm font-medium"
          >
            Done Shipping
          </button>
        )}
      </div>

      {/* Ships */}
      <div className="space-y-3 mb-4">
        {ships.map((ship, i) => {
          const isFull = ship.filled >= ship.capacity;
          const fillPercent = (ship.filled / ship.capacity) * 100;

          return (
            <div key={i} className={`rounded-xl border-2 p-3 transition-all ${
              isFull ? 'border-emerald-300 bg-emerald-50' : 'border-amber-200 bg-white'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ShipIcon size={24} />
                  <span className="font-bold text-amber-900">Ship {i + 1}</span>
                  <span className="text-xs text-amber-500">
                    (capacity: {ship.capacity})
                  </span>
                </div>
                <div className="text-sm">
                  {ship.cargoType ? (
                    <div className="flex items-center gap-1">
                      <ResourceIcon type={ship.cargoType} size={16} />
                      <span className="text-amber-700 font-medium capitalize">{ship.cargoType}</span>
                      <span className="text-amber-500">{ship.filled}/{ship.capacity}</span>
                    </div>
                  ) : (
                    <span className="text-amber-400 italic">Empty</span>
                  )}
                </div>
              </div>

              {/* Cargo bar */}
              <div className="w-full h-3 bg-amber-100 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isFull ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${fillPercent}%` }}
                />
              </div>

              {/* Loadable resources for this ship */}
              {!isFull && (
                <div className="flex gap-2 flex-wrap">
                  {goodsWithStock.map(resource => {
                    const canLoad = ship.cargoType === null
                      ? !ships.some(s => s.cargoType === resource && s !== ship)
                      : ship.cargoType === resource;

                    if (!canLoad) return null;

                    return (
                      <button
                        key={resource}
                        onClick={() => captainShipGoods(0, i, resource)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors text-sm"
                      >
                        <ResourceIcon type={resource} size={16} />
                        <span className="font-medium text-amber-800">
                          Load {RESOURCE_LABELS[resource]} ×{humanPlayer.goods[resource]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {isFull && (
                <p className="text-xs text-emerald-600 font-medium">✓ Ship is full — sailing!</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Wharf option */}
      {hasWharf && goodsWithStock.length > 0 && (
        <div className="rounded-xl border-2 border-purple-200 bg-purple-50 p-3">
          <h3 className="font-bold text-purple-800 text-sm mb-2">🏗️ Wharf — Ship Any Type</h3>
          <div className="flex gap-2 flex-wrap">
            {goodsWithStock.map(resource => (
              <button
                key={resource}
                onClick={() => captainUseWharf(0, resource, humanPlayer.goods[resource])}
                className="flex items-center gap-1 px-3 py-1.5 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors text-sm"
              >
                <ResourceIcon type={resource} size={16} />
                <span className="font-medium text-purple-800">
                  Wharf {RESOURCE_LABELS[resource]} ×{humanPlayer.goods[resource]}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
