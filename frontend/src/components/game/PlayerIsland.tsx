import { Leaf, Building2, Users, Coins, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useGameEngine from '../../store/gameEngine';
import { ResourceIcon } from '../icons/ResourceIcons';
import { RESOURCE_COLORS, RESOURCE_ORDER } from '../../data/constants';
import { BUILDING_IMAGES } from '../../data/buildingImages';
import type { PlantationTile, OwnedBuilding } from '../../store/gameEngine';

const MAX_PLANTATION_SLOTS = 12;
const MAX_CITY_SLOTS = 12;

export default function PlayerIsland() {
  const { t } = useTranslation();
  const player = useGameEngine(s => s.players[0]);
  if (!player) return null;

  const usedSlots = player.buildings.reduce((s, b) => s + (b.def.size === 'large' ? 2 : 1), 0);
  const remainingCitySlots = MAX_CITY_SLOTS - usedSlots;
  const remainingPlantationSlots = MAX_PLANTATION_SLOTS - player.plantations.length;

  return (
    <div className="space-y-3">

      {/* ── Coins & Resources ────────────────────────────────── */}
      <section
        className="rounded-3xl overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.15)]"
        style={{ background: 'rgba(245,230,200,0.97)', border: '1px solid rgba(201,135,12,0.3)' }}
      >
        <div className="px-4 py-2.5 flex items-center gap-4">
          {/* Doubloons — big & prominent */}
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-2xl flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, rgba(201,135,12,0.2), rgba(201,135,12,0.1))', border: '1px solid rgba(201,135,12,0.4)' }}
          >
            <Coins size={20} className="text-[#c9870c]" strokeWidth={2} />
            <span className="font-cinzel font-black text-[#3d1f0a] text-2xl tabular-nums leading-none">
              {player.doubloons}
            </span>
          </div>

          {/* Divider */}
          <div className="w-px self-stretch bg-[#c9870c]/20" />

          {/* Resources — 5 slots */}
          <div className="flex items-center gap-2 flex-1">
            {RESOURCE_ORDER.map(r => {
              const qty = player.goods[r];
              return (
                <div
                  key={r}
                  className="flex flex-col items-center gap-1 flex-1 py-2 rounded-xl transition-all"
                  style={{
                    background: qty > 0 ? `${RESOURCE_COLORS[r]}18` : 'rgba(61,31,10,0.03)',
                    border: qty > 0 ? `1px solid ${RESOURCE_COLORS[r]}40` : '1px solid rgba(61,31,10,0.08)',
                  }}
                >
                  <ResourceIcon type={r} size={20} />
                  <span
                    className="font-cinzel font-bold text-sm tabular-nums leading-none"
                    style={{ color: qty > 0 ? '#3d1f0a' : 'rgba(61,31,10,0.25)' }}
                  >
                    {qty}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Plantations ──────────────────────────────────────── */}
      <section
        className="rounded-3xl overflow-hidden shadow-[0_6px_24px_rgba(0,0,0,0.2)]"
        style={{ background: 'rgba(245,230,200,0.97)', border: '1px solid rgba(45,106,79,0.25)' }}
      >
        <div className="px-4 py-2.5 flex items-center justify-between border-b border-[#2d6a4f]/15"
          style={{ background: 'rgba(45,106,79,0.08)' }}
        >
          <h3 className="font-cinzel font-bold text-[#2d6a4f] text-xs tracking-wider uppercase flex items-center gap-2">
            <Leaf size={13} strokeWidth={2.5} />
            {t('island.yourPlantations')}
          </h3>
          <div className="flex items-center gap-2">
            <span className="font-cinzel text-[10px] text-[#2d6a4f] font-bold">
              {player.plantations.length}/{MAX_PLANTATION_SLOTS}
            </span>
            {remainingPlantationSlots > 0 && (
              <span className="font-cinzel text-[9px] text-[#2d6a4f]/60 bg-[#2d6a4f]/10 px-2 py-0.5 rounded-full">
                {remainingPlantationSlots} left
              </span>
            )}
          </div>
        </div>
        <div className="p-3 grid grid-cols-4 xl:grid-cols-6 gap-2">
          {player.plantations.map((tile, i) => (
            <PlantationTileView key={i} tile={tile} />
          ))}
          {Array.from({ length: remainingPlantationSlots }).map((_, i) => (
            <EmptySlot key={`empty-p-${i}`} color="#2d6a4f" />
          ))}
        </div>
      </section>

      {/* ── City / Buildings ──────────────────────────────────── */}
      <section
        className="rounded-3xl overflow-hidden shadow-[0_6px_24px_rgba(0,0,0,0.2)]"
        style={{ background: 'rgba(245,230,200,0.97)', border: '1px solid rgba(90,46,16,0.2)' }}
      >
        <div className="px-4 py-2.5 flex items-center justify-between border-b border-[#5a2e10]/12"
          style={{ background: 'rgba(90,46,16,0.07)' }}
        >
          <h3 className="font-cinzel font-bold text-[#5a2e10] text-xs tracking-wider uppercase flex items-center gap-2">
            <Building2 size={13} strokeWidth={2.5} />
            {t('island.yourCity')}
          </h3>
          <div className="flex items-center gap-2">
            <span className="font-cinzel text-[10px] text-[#5a2e10] font-bold">
              {usedSlots}/{MAX_CITY_SLOTS}
            </span>
            {remainingCitySlots > 0 && (
              <span className="font-cinzel text-[9px] text-[#5a2e10]/60 bg-[#5a2e10]/08 px-2 py-0.5 rounded-full">
                {remainingCitySlots} left
              </span>
            )}
          </div>
        </div>
        <div className="p-3 grid grid-cols-4 gap-2 items-start">
          {player.buildings.map((building, i) => (
            <BuildingTileView key={i} building={building} />
          ))}
          {/* Show all remaining city slots — aspectRatio matches BuildingTileView's 3/4 card */}
          {Array.from({ length: remainingCitySlots }).map((_, i) => (
            <EmptySlot key={`empty-b-${i}`} color="#5a2e10" aspectRatio="3/4" />
          ))}
        </div>
      </section>
    </div>
  );
}

function EmptySlot({ color, aspectRatio }: { color: string; aspectRatio?: string }) {
  return (
    <div
      className="rounded-xl"
      style={{
        border: `1.5px dashed ${color}22`,
        background: `${color}04`,
        ...(aspectRatio ? { aspectRatio } : { height: 62 }),
      }}
    />
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
      <ResourceIcon type={tile.type} size={28} />
      <span className="text-[9px] font-cinzel text-[#3d1f0a]/65 capitalize leading-none text-center">
        {t(`resources.${tile.type}`, { defaultValue: tile.type })}
      </span>
      {hasColonist && (
        <div
          className="absolute -top-1.5 -right-1.5 rounded-full flex items-center justify-center shadow"
          style={{ backgroundColor: '#c9870c', border: '1.5px solid #f0a830', width: 16, height: 16 }}
        >
          <Users size={8} className="text-white" strokeWidth={2.5} />
        </div>
      )}
    </div>
  );
}

function BuildingTileView({ building }: { building: OwnedBuilding }) {
  const isProduction = building.def.category === 'production';
  const isLarge = building.def.size === 'large';
  const accent = isProduction ? '#1e3a5f' : '#4a1d7a';
  const accentLight = isProduction ? '#2a5aab' : '#7c3fc0';
  const image = BUILDING_IMAGES[building.def.id];

  return (
    <div
      className={`rounded-2xl overflow-hidden relative flex flex-col ${isLarge ? 'col-span-2' : ''}`}
      style={{ border: `1.5px solid ${accent}50`, background: '#f5e6c8' }}
    >
      {/* Image — portrait card displayed with object-contain so whole card is visible */}
      <div
        className="relative flex items-center justify-center overflow-hidden"
        style={{ background: `${accent}18`, aspectRatio: '3/4', maxHeight: 180 }}
      >
        {image ? (
          <img
            src={image}
            alt={building.def.name}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            {building.def.productionType
              ? <ResourceIcon type={building.def.productionType} size={44} />
              : <Star size={36} className="text-amber-400" strokeWidth={1.5} />
            }
          </div>
        )}
        {/* VP badge */}
        <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 bg-black/55 text-white text-[9px] font-cinzel px-1.5 py-0.5 rounded-full">
          <Star size={7} strokeWidth={2.5} className="text-[#f0a830]" />{building.def.vp}
        </div>
        {/* Production icon */}
        {building.def.productionType && (
          <div className="absolute top-1.5 left-1.5">
            <ResourceIcon type={building.def.productionType} size={14} />
          </div>
        )}
      </div>

      {/* Info area */}
      <div className="px-2 pt-1 pb-1.5 flex flex-col gap-1">
        <span className="font-cinzel font-bold text-[#3d1f0a] text-[10px] leading-tight line-clamp-1">
          {building.def.name}
        </span>
        {/* Colonist slots */}
        {building.def.maxColonists > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            {Array.from({ length: building.def.maxColonists }).map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-full border flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: i < building.colonists ? accentLight : 'transparent',
                  borderColor: i < building.colonists ? accentLight : `${accent}44`,
                }}
              >
                {i < building.colonists && <Users size={5} className="text-white" strokeWidth={3} />}
              </div>
            ))}
            <span className="text-[9px] font-cinzel text-[#5a2e10]/50 ml-0.5">
              {building.colonists}/{building.def.maxColonists}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
