import useGameEngine from '../../store/gameEngine';
import { ResourceIcon } from '../icons/ResourceIcons';
import { RESOURCE_COLORS } from '../../data/constants';
import type { PlantationTile, OwnedBuilding } from '../../store/gameEngine';

export default function PlayerIsland() {
  const player = useGameEngine(s => s.players[0]);
  if (!player) return null;

  return (
    <div className="space-y-3">
      {/* Plantations */}
      <div
        className="rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
        style={{ background: 'rgba(245,230,200,0.95)', border: '1px solid rgba(201,135,12,0.3)' }}
      >
        {/* Section header */}
        <div className="px-4 py-2.5 flex items-center justify-between bg-[#2d6a4f]/10 border-b border-[#2d6a4f]/20">
          <h3 className="font-cinzel font-bold text-[#2d6a4f] text-xs tracking-wider uppercase flex items-center gap-1.5">
            <span>🌱</span> Your Plantations
          </h3>
          <span className="font-cinzel text-[10px] text-[#2d6a4f]/70">
            {player.plantations.length} tiles
          </span>
        </div>
        <div className="p-3 grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-4 xl:grid-cols-6 gap-2">
          {player.plantations.map((tile, i) => (
            <PlantationTileView key={i} tile={tile} />
          ))}
          {player.plantations.length === 0 && (
            <p className="col-span-full text-center text-xs text-[#5a2e10]/40 font-crimson italic py-6">
              No plantations yet
            </p>
          )}
        </div>
      </div>

      {/* Buildings */}
      <div
        className="rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
        style={{ background: 'rgba(245,230,200,0.95)', border: '1px solid rgba(201,135,12,0.3)' }}
      >
        <div className="px-4 py-2.5 flex items-center justify-between bg-[#5a2e10]/10 border-b border-[#5a2e10]/20">
          <h3 className="font-cinzel font-bold text-[#5a2e10] text-xs tracking-wider uppercase flex items-center gap-1.5">
            <span>🏛️</span> Your City
          </h3>
          <span className="font-cinzel text-[10px] text-[#5a2e10]/70">
            {player.buildings.reduce((s, b) => s + (b.def.size === 'large' ? 2 : 1), 0)}/12 slots
          </span>
        </div>
        <div className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {player.buildings.map((building, i) => (
            <BuildingTileView key={i} building={building} />
          ))}
          {player.buildings.length === 0 && (
            <p className="col-span-full text-center text-xs text-[#5a2e10]/40 font-crimson italic py-6">
              No buildings yet — use the Builder role
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function PlantationTileView({ tile }: { tile: PlantationTile }) {
  const isQuarry = tile.type === 'quarry';
  const color = isQuarry ? '#6b6b6b' : (RESOURCE_COLORS[tile.type as keyof typeof RESOURCE_COLORS] ?? '#888');
  const hasColonist = tile.colonist;

  return (
    <div
      className={`
        relative rounded-lg p-2 flex flex-col items-center gap-1
        transition-all duration-200
        ${hasColonist ? 'ring-2 ring-offset-1 ring-[#c9870c]/60' : ''}
      `}
      style={{
        background: `linear-gradient(135deg, ${color}22, ${color}11)`,
        border: `1.5px solid ${color}55`,
      }}
      title={`${tile.type}${hasColonist ? ' (colonized)' : ''}`}
    >
      <ResourceIcon type={tile.type} size={26} />
      <span className="text-[9px] font-cinzel text-[#3d1f0a]/70 capitalize">{tile.type}</span>
      {hasColonist && (
        <div
          className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center shadow-sm"
          style={{ backgroundColor: '#c9870c', border: '1px solid #f0a830' }}
        >
          <span className="text-[8px] text-white">●</span>
        </div>
      )}
    </div>
  );
}

function BuildingTileView({ building }: { building: OwnedBuilding }) {
  const isProduction = building.def.category === 'production';
  const accent = isProduction ? '#1e3a5f' : '#4a1d7a';
  const accentLight = isProduction ? '#2a5aab' : '#7c3fc0';

  return (
    <div
      className="rounded-lg p-2.5 transition-all duration-200 relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${accent}18, ${accentLight}12)`,
        border: `1px solid ${accent}40`,
      }}
    >
      <div className="flex items-start justify-between gap-1 mb-1.5">
        <span className="font-cinzel font-bold text-[#3d1f0a] text-[10px] leading-tight">
          {building.def.name}
        </span>
        <span className="font-cinzel text-[10px] text-[#c9870c] font-bold flex-shrink-0">
          ⭐{building.def.vp}
        </span>
      </div>

      {building.def.productionType && (
        <div className="flex items-center gap-1 mb-1.5">
          <ResourceIcon type={building.def.productionType} size={13} />
          <span className="text-[9px] text-[#5a2e10]/60 font-crimson capitalize">
            {building.def.productionType}
          </span>
        </div>
      )}

      {/* Colonist slots */}
      <div className="flex items-center gap-1">
        {Array.from({ length: building.def.maxColonists }).map((_, i) => (
          <div
            key={i}
            className="w-3.5 h-3.5 rounded-full border-2 transition-colors"
            style={{
              backgroundColor: i < building.colonists ? '#c9870c' : 'transparent',
              borderColor: i < building.colonists ? '#f0a830' : '#c9870c44',
            }}
          />
        ))}
        <span
          className="ml-auto text-[8px] font-cinzel px-1.5 py-0.5 rounded-sm"
          style={{
            background: `${accent}25`,
            color: accent,
          }}
        >
          {isProduction ? 'PROD' : 'SPEC'}
        </span>
      </div>

      {building.def.category === 'violet' && building.def.description && (
        <p className="mt-1.5 text-[8px] text-[#5a2e10]/60 font-crimson italic leading-tight line-clamp-2">
          {building.def.description}
        </p>
      )}
    </div>
  );
}
