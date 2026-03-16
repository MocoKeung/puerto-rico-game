import { Leaf, Building2, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useGameEngine from '../../store/gameEngine';
import { ResourceIcon } from '../icons/ResourceIcons';
import { RESOURCE_COLORS } from '../../data/constants';
import type { PlantationTile, OwnedBuilding } from '../../store/gameEngine';

export default function PlayerIsland() {
  const { t } = useTranslation();
  const player = useGameEngine(s => s.players[0]);
  if (!player) return null;

  const usedSlots = player.buildings.reduce((s, b) => s + (b.def.size === 'large' ? 2 : 1), 0);

  return (
    <div className="space-y-3">
      {/* Plantations */}
      <section
        className="rounded-2xl overflow-hidden shadow-[0_6px_24px_rgba(0,0,0,0.25)]"
        style={{ background: 'rgba(245,230,200,0.97)', border: '1px solid rgba(45,106,79,0.25)' }}
      >
        <div className="px-4 py-2.5 flex items-center justify-between border-b border-[#2d6a4f]/15"
          style={{ background: 'rgba(45,106,79,0.08)' }}
        >
          <h3 className="font-cinzel font-bold text-[#2d6a4f] text-xs tracking-wider uppercase flex items-center gap-2">
            <Leaf size={13} strokeWidth={2.5} />
            {t('island.yourPlantations')}
          </h3>
          <span className="font-cinzel text-[10px] text-[#2d6a4f]/60 bg-[#2d6a4f]/10 px-2 py-0.5 rounded-full">
            {t('island.tiles', { n: player.plantations.length })}
          </span>
        </div>
        <div className="p-3 grid grid-cols-4 sm:grid-cols-5 xl:grid-cols-6 gap-2">
          {player.plantations.map((tile, i) => (
            <PlantationTileView key={i} tile={tile} />
          ))}
          {player.plantations.length === 0 && (
            <p className="col-span-full text-center text-xs text-[#5a2e10]/35 font-crimson italic py-6">
              {t('island.noPlantations')}
            </p>
          )}
        </div>
      </section>

      {/* Buildings */}
      <section
        className="rounded-2xl overflow-hidden shadow-[0_6px_24px_rgba(0,0,0,0.25)]"
        style={{ background: 'rgba(245,230,200,0.97)', border: '1px solid rgba(90,46,16,0.2)' }}
      >
        <div className="px-4 py-2.5 flex items-center justify-between border-b border-[#5a2e10]/12"
          style={{ background: 'rgba(90,46,16,0.07)' }}
        >
          <h3 className="font-cinzel font-bold text-[#5a2e10] text-xs tracking-wider uppercase flex items-center gap-2">
            <Building2 size={13} strokeWidth={2.5} />
            {t('island.yourCity')}
          </h3>
          <span className="font-cinzel text-[10px] text-[#5a2e10]/60 bg-[#5a2e10]/8 px-2 py-0.5 rounded-full">
            {t('island.slots', { used: usedSlots })}
          </span>
        </div>
        <div className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {player.buildings.map((building, i) => (
            <BuildingTileView key={i} building={building} />
          ))}
          {player.buildings.length === 0 && (
            <p className="col-span-full text-center text-xs text-[#5a2e10]/35 font-crimson italic py-6">
              {t('island.noBuildings')}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function PlantationTileView({ tile }: { tile: PlantationTile }) {
  const { t } = useTranslation();
  const isQuarry = tile.type === 'quarry';
  const color = isQuarry ? '#6b7280' : (RESOURCE_COLORS[tile.type as keyof typeof RESOURCE_COLORS] ?? '#888');
  const hasColonist = tile.colonist;

  return (
    <div
      className="relative rounded-xl p-2 flex flex-col items-center gap-1.5 transition-all duration-200"
      style={{
        background: hasColonist
          ? `linear-gradient(135deg, ${color}28, ${color}14)`
          : `linear-gradient(135deg, ${color}18, ${color}09)`,
        border: hasColonist ? `1.5px solid ${color}55` : `1px solid ${color}33`,
      }}
      title={`${tile.type}${hasColonist ? ' (colonized)' : ''}`}
    >
      {/* Resource token icon */}
      <ResourceIcon type={tile.type} size={28} />

      <span className="text-[9px] font-cinzel text-[#3d1f0a]/65 capitalize leading-none text-center">
        {t(`resources.${tile.type}`, { defaultValue: tile.type })}
      </span>

      {/* Colonist dot */}
      {hasColonist && (
        <div
          className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 rounded-full flex items-center justify-center shadow"
          style={{ backgroundColor: '#c9870c', border: '1.5px solid #f0a830', width: 16, height: 16 }}
        >
          <Users size={8} className="text-white" strokeWidth={2.5} />
        </div>
      )}
    </div>
  );
}

function BuildingTileView({ building }: { building: OwnedBuilding }) {
  const { t } = useTranslation();
  const isProduction = building.def.category === 'production';
  const accent = isProduction ? '#1e3a5f' : '#4a1d7a';
  const accentMid = isProduction ? '#2a5aab' : '#7c3fc0';

  return (
    <div
      className="rounded-xl p-2.5 transition-all duration-200 relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${accent}14, ${accentMid}0c)`,
        border: `1px solid ${accent}35`,
      }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-1 mb-2">
        <span className="font-cinzel font-bold text-[#3d1f0a] text-[10px] leading-tight flex-1">
          {building.def.name}
        </span>
        <span
          className="font-cinzel text-[10px] font-bold flex-shrink-0 flex items-center gap-0.5"
          style={{ color: '#c9870c' }}
        >
          <Star size={8} strokeWidth={2.5} style={{ color: '#c9870c' }} />
          {building.def.vp}
        </span>
      </div>

      {/* Production type */}
      {building.def.productionType && (
        <div className="flex items-center gap-1.5 mb-2">
          <ResourceIcon type={building.def.productionType} size={16} />
          <span className="text-[9px] text-[#5a2e10]/60 font-crimson capitalize">
            {t(`resources.${building.def.productionType}`, { defaultValue: building.def.productionType })}
          </span>
        </div>
      )}

      {/* Worker slots */}
      <div className="flex items-center gap-1 flex-wrap">
        {Array.from({ length: building.def.maxColonists }).map((_, i) => (
          <div
            key={i}
            className="w-3.5 h-3.5 rounded-full border-2 transition-all duration-200 flex items-center justify-center"
            style={{
              backgroundColor: i < building.colonists ? '#c9870c' : 'transparent',
              borderColor: i < building.colonists ? '#f0a830' : '#c9870c33',
            }}
          >
            {i < building.colonists && <Users size={6} className="text-white" strokeWidth={3} />}
          </div>
        ))}
        <span
          className="ml-auto text-[8px] font-cinzel px-1.5 py-0.5 rounded-sm"
          style={{ background: `${accent}20`, color: accent }}
        >
          {isProduction ? 'PROD' : 'SPEC'}
        </span>
      </div>

      {/* Description for violet buildings */}
      {building.def.category === 'violet' && building.def.description && (
        <p className="mt-1.5 text-[8px] text-[#5a2e10]/55 font-crimson italic leading-snug line-clamp-2">
          {building.def.description}
        </p>
      )}
    </div>
  );
}
