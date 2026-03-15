import useGameStore, { type ResourceType } from '../store/gameStore';

interface PlayerPanelProps {
  player: Player;
  isCurrent: boolean;
  isGovernor?: boolean;
}

const resourceIcons: Record<ResourceType, string> = {
  corn: '🌽',
  indigo: '💙',
  sugar: '🍬',
  tobacco: '🌿',
  coffee: '☕',
};

const resourceColors: Record<ResourceType, string> = {
  corn: 'bg-yellow-400',
  indigo: 'bg-blue-500',
  sugar: 'bg-gray-200',
  tobacco: 'bg-green-400',
  coffee: 'bg-amber-900',
};

export default function PlayerPanel({ player, isCurrent, isGovernor }: PlayerPanelProps) {
  const { selectedRole, selectRole, takePlantation, buyBuilding, tradeGood, shipGoods } = useGameStore();

  const handleTakePlantation = (type: ResourceType | 'quarry') => {
    if (selectedRole === 'settler' && isCurrent) {
      takePlantation(player.id, type);
    }
  };

  const colonizedPlantations = player.plantations.filter(p => p.colonized).length;
  const usedBuildings = player.buildings.reduce((sum, b) => sum + b.occupied, 0);
  const maxBuildings = player.buildings.reduce((sum, b) => sum + b.maxOccupants, 0);

  return (
    <div 
      className={`
        rounded-xl shadow-lg overflow-hidden transition-all duration-300
        ${isCurrent ? 'ring-4 ring-amber-500 scale-[1.02]' : ''}
        ${isGovernor ? 'border-2 border-yellow-500' : ''}
      `}
    >
      {/* Header */}
      <div className={`
        px-4 py-3 flex items-center justify-between
        ${isCurrent ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white' : 
          isGovernor ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 text-white' : 'bg-gradient-to-r from-gray-700 to-gray-600 text-white'}
      `}>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold">{player.name}</span>
          {isGovernor && <span className="text-yellow-200 text-xl" title="Governor">👑</span>}
          {isCurrent && <span className="text-amber-100 text-sm animate-pulse">▼</span>}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-black/20 px-2 py-1 rounded">
            <span>💰</span>
            <span className="font-bold">{player.doubloons}</span>
          </div>
          <div className="flex items-center gap-1 bg-amber-400/80 text-amber-900 px-2 py-1 rounded">
            <span>⭐</span>
            <span className="font-bold">{player.victoryPoints}</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 space-y-4">
        {/* Colonists */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">👷 Colonists:</span>
          <div className="flex items-center gap-2">
            <span className="font-semibold">{colonizedPlantations}/{player.plantations.length} plantations used</span>
            <span className="text-gray-400">|</span>
            <span className="font-semibold">{usedBuildings}/{maxBuildings} buildings used</span>
          </div>
        </div>

        {/* Resources */}
        <div>
          <h4 className="text-sm font-semibold text-gray-600 mb-2">📦 Goods</h4>
          <div className="grid grid-cols-5 gap-2">
            {(Object.entries(player.resources) as [ResourceType, number][]).map(([type, count]) => (
              <div key={type} className="text-center">
                <div className={`
                  w-10 h-10 rounded-lg mx-auto flex items-center justify-center text-lg shadow-sm
                  ${resourceColors[type]} ${type === 'coffee' ? 'text-white' : 'text-gray-800'}
                `}>
                  {resourceIcons[type]}
                </div>
                <span className="text-sm font-semibold text-gray-700">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Plantations */}
        <div>
          <h4 className="text-sm font-semibold text-gray-600 mb-2">🌱 Plantations ({player.plantations.length})</h4>
          <div className="flex flex-wrap gap-1">
            {player.plantations.map((plantation, idx) => (
              <div
                key={idx}
                className={`
                  w-8 h-8 rounded flex items-center justify-center text-sm
                  border-2 ${plantation.colonized ? 'border-amber-500 bg-amber-100' : 'border-gray-300 bg-gray-100'}
                  ${plantation.type === 'quarry' ? '⛏️' : resourceIcons[plantation.type as ResourceType] || '🌱'}
                `}
                title={`${plantation.type}${plantation.colonized ? ' (colonized)' : ''}`}
              >
                {plantation.type === 'quarry' ? '⛏️' : resourceIcons[plantation.type as ResourceType]}
              </div>
            ))}
          </div>
        </div>

        {/* Buildings */}
        <div>
          <h4 className="text-sm font-semibold text-gray-600 mb-2">🏛️ Buildings ({player.buildings.length})</h4>
          <div className="flex flex-wrap gap-1">
            {player.buildings.length === 0 ? (
              <span className="text-gray-400 text-sm italic">No buildings yet</span>
            ) : (
              player.buildings.map((building, idx) => (
                <div
                  key={idx}
                  className={`
                    px-2 py-1 rounded text-xs font-medium
                    ${building.type === 'production' ? 'bg-blue-100 text-blue-800 border border-blue-300' : 'bg-purple-100 text-purple-800 border border-purple-300'}
                  `}
                  title={`${building.name} (${building.occupied}/${building.maxOccupants} occupied)`}
                >
                  {building.name.split(' ').map(w => w[0]).join('')}
                  {building.occupied > 0 && (
                    <span className="ml-1 text-amber-600">({building.occupied})</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}