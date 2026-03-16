import useGameStore, { type ResourceType, type Player } from '../store/gameStore';

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

const resourceBg: Record<ResourceType, string> = {
  corn: 'bg-yellow-400 text-yellow-900',
  indigo: 'bg-blue-500 text-white',
  sugar: 'bg-gray-200 text-gray-700',
  tobacco: 'bg-green-400 text-green-900',
  coffee: 'bg-amber-900 text-white',
};

const resourceLabel: Record<ResourceType, string> = {
  corn: 'Corn',
  indigo: 'Indigo',
  sugar: 'Sugar',
  tobacco: 'Tobacco',
  coffee: 'Coffee',
};

export default function PlayerPanel({ player, isCurrent, isGovernor }: PlayerPanelProps) {
  const { selectedRole, takePlantation } = useGameStore();

  const handleTakePlantation = (type: ResourceType | 'quarry') => {
    if (selectedRole === 'settler' && isCurrent) {
      takePlantation(player.id, type);
    }
  };

  const colonizedPlantations = player.plantations.filter(p => p.colonized).length;
  const usedBuildings = player.buildings.reduce((sum, b) => sum + b.occupied, 0);
  const maxBuildings = player.buildings.reduce((sum, b) => sum + b.maxOccupants, 0);

  return (
    <div className={`
      rounded-2xl overflow-hidden shadow-xl transition-all duration-300
      ${isCurrent
        ? 'ring-2 ring-amber-400 shadow-amber-400/30 shadow-2xl'
        : 'ring-1 ring-slate-600'}
    `}>
      {/* ── Card Header ── */}
      <div className={`
        px-5 py-3 flex items-center justify-between
        ${isCurrent
          ? 'bg-gradient-to-r from-amber-600 to-amber-500'
          : isGovernor
            ? 'bg-gradient-to-r from-yellow-700 to-yellow-600'
            : 'bg-gradient-to-r from-slate-700 to-slate-600'}
      `}>
        <div className="flex items-center gap-2">
          {isGovernor && <span className="text-yellow-300 text-lg" title="Governor">👑</span>}
          <span className="text-white font-bold text-base">{player.name}</span>
          {isCurrent && (
            <span className="ml-1 bg-white/20 text-white text-xs font-semibold px-2 py-0.5 rounded-full animate-pulse">
              Your Turn
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-black/25 rounded-lg px-3 py-1.5">
            <span className="text-base">💰</span>
            <span className="text-white font-bold text-sm">{player.doubloons}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-amber-400/80 rounded-lg px-3 py-1.5">
            <span className="text-base">⭐</span>
            <span className="text-amber-900 font-bold text-sm">{player.victoryPoints}</span>
          </div>
        </div>
      </div>

      {/* ── Card Body ── */}
      <div className="bg-amber-50 p-4 space-y-4">

        {/* Colonist stats */}
        <div className="flex items-center gap-3 text-xs text-amber-800 bg-amber-100 rounded-lg px-3 py-2">
          <span className="text-base">👷</span>
          <span>Colonists:</span>
          <span className="font-semibold">{colonizedPlantations}/{player.plantations.length} plantations</span>
          <span className="text-amber-400">·</span>
          <span className="font-semibold">{usedBuildings}/{maxBuildings} buildings</span>
        </div>

        {/* Goods row */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">📦 Goods</span>
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {(Object.entries(player.resources) as [ResourceType, number][]).map(([type, count]) => (
              <div key={type} className="flex flex-col items-center gap-1">
                <div className={`
                  w-11 h-11 rounded-xl flex items-center justify-center text-lg font-bold shadow-sm
                  ${resourceBg[type]}
                `}>
                  {resourceIcons[type]}
                </div>
                <span className={`
                  text-xs font-bold px-1.5 py-0.5 rounded min-w-[1.5rem] text-center
                  ${count > 0 ? 'bg-amber-600 text-white' : 'text-amber-400'}
                `}>
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Plantations grid */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">🌱 Plantations ({player.plantations.length})</span>
          </div>
          {player.plantations.length === 0 ? (
            <p className="text-xs text-amber-400 italic">No plantations yet</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {player.plantations.map((plantation, idx) => (
                <div
                  key={idx}
                  className={`
                    w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium
                    border-2 shadow-sm
                    ${plantation.colonized
                      ? 'border-amber-500 bg-amber-200'
                      : 'border-amber-300 bg-amber-50'}
                  `}
                  title={`${plantation.type}${plantation.colonized ? ' (colonized)' : ''}`}
                >
                  {plantation.type === 'quarry' ? '⛏️' : resourceIcons[plantation.type as ResourceType]}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Buildings */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">🏛️ Buildings ({player.buildings.length})</span>
          </div>
          {player.buildings.length === 0 ? (
            <p className="text-xs text-amber-400 italic">No buildings yet</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {player.buildings.map((building, idx) => (
                <div
                  key={idx}
                  className={`
                    px-2.5 py-1.5 rounded-lg text-xs font-semibold border shadow-sm
                    ${building.type === 'production'
                      ? 'bg-blue-100 text-blue-800 border-blue-300'
                      : 'bg-purple-100 text-purple-800 border-purple-300'}
                  `}
                  title={`${building.name} (${building.occupied}/${building.maxOccupants} colonized)`}
                >
                  {building.name}
                  {building.occupied > 0 && (
                    <span className="ml-1 text-amber-600 font-bold">·{building.occupied}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
