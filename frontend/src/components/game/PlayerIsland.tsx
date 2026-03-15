import useGameEngine from '../../store/gameEngine';
import { ResourceIcon } from '../icons/ResourceIcons';
import { RESOURCE_COLORS } from '../../data/constants';
import type { PlantationTile, OwnedBuilding } from '../../store/gameEngine';

export default function PlayerIsland() {
  const player = useGameEngine(s => s.players[0]);
  if (!player) return null;

  return (
    <div className="space-y-4">
      {/* Plantations */}
      <div className="bg-gradient-to-br from-emerald-50 to-amber-50 rounded-xl border border-emerald-200/50 p-4">
        <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <span>🌱</span> Your Plantations
          <span className="ml-auto text-xs font-normal text-emerald-600">
            {player.plantations.length} tiles
          </span>
        </h3>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {player.plantations.map((tile, i) => (
            <PlantationTileView key={i} tile={tile} />
          ))}
          {player.plantations.length === 0 && (
            <p className="col-span-full text-center text-sm text-emerald-400 italic py-4">
              No plantations yet
            </p>
          )}
        </div>
      </div>

      {/* Buildings */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200/50 p-4">
        <h3 className="text-sm font-bold text-amber-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <span>🏛️</span> Your City
          <span className="ml-auto text-xs font-normal text-amber-600">
            {player.buildings.reduce((s, b) => s + (b.def.size === 'large' ? 2 : 1), 0)}/12 slots
          </span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {player.buildings.map((building, i) => (
            <BuildingTileView key={i} building={building} />
          ))}
          {player.buildings.length === 0 && (
            <p className="col-span-full text-center text-sm text-amber-400 italic py-4">
              No buildings yet — use the Builder role to buy buildings
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function PlantationTileView({ tile }: { tile: PlantationTile }) {
  const borderColor = tile.colonist ? 'border-emerald-400 ring-2 ring-emerald-300/50' : 'border-amber-200';
  const bgColor = tile.type === 'quarry'
    ? 'bg-gray-100'
    : `bg-gradient-to-br from-white to-amber-50`;

  return (
    <div
      className={`relative rounded-lg border-2 ${borderColor} ${bgColor} p-2 flex flex-col items-center gap-1 transition-all duration-200`}
      title={`${tile.type}${tile.colonist ? ' (colonized)' : ''}`}
    >
      <ResourceIcon type={tile.type} size={28} />
      <span className="text-[10px] font-medium text-amber-700 capitalize">{tile.type}</span>
      {tile.colonist && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-600 rounded-full flex items-center justify-center">
          <span className="text-[8px] text-white">👷</span>
        </div>
      )}
    </div>
  );
}

function BuildingTileView({ building }: { building: OwnedBuilding }) {
  const isProduction = building.def.category === 'production';
  const bgGradient = isProduction
    ? 'from-blue-50 to-blue-100 border-blue-200'
    : 'from-purple-50 to-purple-100 border-purple-200';
  const textColor = isProduction ? 'text-blue-800' : 'text-purple-800';
  const badgeColor = isProduction ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700';

  return (
    <div className={`rounded-lg border bg-gradient-to-br ${bgGradient} p-2.5 transition-all duration-200`}>
      <div className="flex items-start justify-between gap-1">
        <span className={`text-xs font-bold ${textColor} leading-tight`}>{building.def.name}</span>
        <span className="text-[10px] text-amber-600 font-bold">⭐{building.def.vp}</span>
      </div>
      {building.def.productionType && (
        <div className="mt-1 flex items-center gap-1">
          <ResourceIcon type={building.def.productionType} size={14} />
          <span className="text-[10px] text-amber-600 capitalize">{building.def.productionType}</span>
        </div>
      )}
      <div className="mt-1.5 flex items-center gap-1">
        {Array.from({ length: building.def.maxColonists }).map((_, i) => (
          <div
            key={i}
            className={`w-3.5 h-3.5 rounded-full border ${
              i < building.colonists
                ? 'bg-amber-500 border-amber-600'
                : 'bg-white border-amber-300'
            }`}
          />
        ))}
        <span className={`ml-auto text-[10px] ${badgeColor} px-1 rounded`}>
          {isProduction ? 'PROD' : 'SPEC'}
        </span>
      </div>
      {building.def.category === 'violet' && (
        <p className="mt-1 text-[9px] text-amber-600 leading-tight italic">
          {building.def.description}
        </p>
      )}
    </div>
  );
}
