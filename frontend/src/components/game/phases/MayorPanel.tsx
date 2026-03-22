import { useState, useEffect } from 'react';
import { Crown, Leaf, Building2, CheckCircle, Users } from 'lucide-react';
import useGameEngine from '../../../store/gameEngine';
import { ResourceIcon } from '../../icons/ResourceIcons';
import { RESOURCE_COLORS } from '../../../data/constants';

function totalColonists(player: ReturnType<typeof useGameEngine.getState>['players'][0]) {
  const onPlantations = player.plantations.filter(p => p.colonist).length;
  const onBuildings = player.buildings.reduce((s, b) => s + b.colonists, 0);
  return player.colonists + onPlantations + onBuildings;
}

// A single colonist token — white circle with person silhouette
function ColonistToken({ size = 28, faded = false }: { size?: number; faded?: boolean }) {
  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0 shadow-md transition-all"
      style={{
        width: size,
        height: size,
        background: faded
          ? 'rgba(74,29,122,0.15)'
          : 'linear-gradient(135deg, #7c3fc0, #4a1d7a)',
        border: faded
          ? '2px dashed rgba(74,29,122,0.3)'
          : '2px solid rgba(255,255,255,0.35)',
        opacity: faded ? 0.5 : 1,
      }}
    >
      {!faded && <Users size={size * 0.45} className="text-white" strokeWidth={2.5} />}
    </div>
  );
}

export default function MayorPanel() {
  const { players, colonistSupply, mayorAssignColonists, mayorConfirm, waitingForHuman } = useGameEngine();
  const player = players[0];

  const [plantations, setPlantations] = useState<boolean[]>([]);
  const [buildings, setBuildings] = useState<number[]>([]);

  // Seed local state from auto-distributed result whenever the panel mounts/resets
  useEffect(() => {
    if (!player) return;
    setPlantations(player.plantations.map(p => p.colonist));
    setBuildings(player.buildings.map(b => b.colonists));
  }, [player?.plantations.length, player?.buildings.length, waitingForHuman]);

  if (!player) return null;

  const total = totalColonists(player);
  const assigned = plantations.filter(Boolean).length + buildings.reduce((s, n) => s + n, 0);
  const pool = total - assigned; // unassigned colonists still in the "hand"

  // Click a plantation tile: if colonised → recall; if empty → place from pool
  const togglePlantation = (idx: number) => {
    const next = [...plantations];
    if (next[idx]) {
      next[idx] = false;
    } else {
      if (pool <= 0) return;
      next[idx] = true;
    }
    setPlantations(next);
  };

  // Click an individual colonist circle on a building
  const toggleBuildingSlot = (bIdx: number, slotIdx: number) => {
    const current = buildings[bIdx] ?? 0;
    const max = player.buildings[bIdx].def.maxColonists;
    const next = [...buildings];
    if (slotIdx < current) {
      // Recall the last colonist (always remove from the highest filled slot)
      next[bIdx] = current - 1;
    } else {
      // Place a colonist into this slot
      if (pool <= 0) return;
      if (current >= max) return;
      next[bIdx] = current + 1;
    }
    setBuildings(next);
  };

  const handleConfirm = () => {
    mayorAssignColonists(0, { plantations, buildings });
    mayorConfirm();
  };

  if (!waitingForHuman) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full border-2 border-[#4a1d7a]/40 border-t-[#4a1d7a] animate-spin" />
          <p className="text-[#5a2e10] font-cinzel text-sm">Mayor distributing colonists…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crown size={18} className="text-[#4a1d7a]" strokeWidth={2} />
          <h2 className="font-cinzel font-bold text-[#3d1f0a] text-base">Place Your Colonists</h2>
        </div>
        <button
          onClick={handleConfirm}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-cinzel font-bold text-white text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
          style={{ background: 'linear-gradient(135deg, #4a1d7a, #7c3fc0)' }}
        >
          <CheckCircle size={14} strokeWidth={2.5} />
          Confirm
        </button>
      </div>

      {/* ── Token pool ── */}
      <div
        className="rounded-2xl p-3"
        style={{ background: 'rgba(74,29,122,0.07)', border: '1.5px solid rgba(74,29,122,0.2)' }}
      >
        <div className="flex items-center justify-between mb-2.5">
          <span className="font-cinzel text-[10px] text-[#4a1d7a] uppercase tracking-[0.18em] font-bold">
            Colonist Pool
          </span>
          <span className="font-cinzel font-black text-[#4a1d7a] text-sm tabular-nums">
            {pool} / {total}
          </span>
        </div>

        {/* Token chips — filled = in pool, hollow = already placed */}
        <div className="flex flex-wrap gap-2 min-h-[36px] items-center">
          {Array.from({ length: total }).map((_, i) => (
            <ColonistToken key={i} size={30} faded={i >= pool} />
          ))}
          {total === 0 && (
            <span className="font-crimson text-xs italic text-[#5a2e10]/40">No colonists received this round</span>
          )}
        </div>

        {pool > 0 && (
          <p className="mt-2 font-crimson text-[11px] text-[#4a1d7a]/60 italic">
            {pool} unplaced — click a slot below to assign
          </p>
        )}
        {pool === 0 && total > 0 && (
          <p className="mt-2 font-crimson text-[11px] text-emerald-700 italic">
            All colonists placed! Confirm when ready.
          </p>
        )}
      </div>

      {/* ── Plantations ── */}
      {player.plantations.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2.5">
            <Leaf size={12} className="text-[#2d6a4f]" strokeWidth={2.5} />
            <span className="font-cinzel text-[10px] text-[#2d6a4f] uppercase tracking-[0.16em] font-bold">
              Plantations
            </span>
            <span className="font-cinzel text-[9px] text-[#2d6a4f]/50 ml-1">
              ({plantations.filter(Boolean).length} colonised)
            </span>
          </div>
          <div className="grid grid-cols-4 xl:grid-cols-6 gap-2">
            {player.plantations.map((tile, i) => {
              const color = tile.type === 'quarry'
                ? '#6b7280'
                : (RESOURCE_COLORS[tile.type as keyof typeof RESOURCE_COLORS] ?? '#888');
              const hasColonist = plantations[i] ?? false;
              const canPlace = !hasColonist && pool > 0;

              return (
                <button
                  key={i}
                  onClick={() => togglePlantation(i)}
                  disabled={!hasColonist && pool <= 0}
                  className="rounded-xl flex flex-col items-center gap-1.5 py-2 px-1 transition-all duration-150 hover:scale-[1.05] active:scale-[0.97] disabled:cursor-not-allowed"
                  style={{
                    background: hasColonist ? `${color}28` : canPlace ? `${color}10` : `${color}07`,
                    border: hasColonist
                      ? `2px solid ${color}70`
                      : `1.5px dashed ${color}${canPlace ? '55' : '30'}`,
                  }}
                  title={hasColonist ? 'Click to recall colonist' : canPlace ? 'Click to place colonist' : 'No colonists left'}
                >
                  <ResourceIcon type={tile.type} size={24} />
                  {/* Colonist slot */}
                  {hasColonist ? (
                    <ColonistToken size={20} />
                  ) : (
                    <div
                      className="rounded-full"
                      style={{
                        width: 20,
                        height: 20,
                        border: `2px dashed ${color}${canPlace ? '55' : '30'}`,
                        background: 'transparent',
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Buildings ── */}
      {player.buildings.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2.5">
            <Building2 size={12} className="text-[#5a2e10]" strokeWidth={2.5} />
            <span className="font-cinzel text-[10px] text-[#5a2e10] uppercase tracking-[0.16em] font-bold">
              Buildings
            </span>
            <span className="font-cinzel text-[9px] text-[#5a2e10]/50 ml-1">
              (click a slot to fill / recall)
            </span>
          </div>
          <div className="space-y-2">
            {player.buildings.map((b, bIdx) => {
              const current = buildings[bIdx] ?? 0;
              const max = b.def.maxColonists;
              return (
                <div
                  key={bIdx}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                  style={{ background: 'rgba(61,31,10,0.05)', border: '1px solid rgba(61,31,10,0.1)' }}
                >
                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <span className="font-cinzel font-bold text-[#3d1f0a] text-[11px] leading-tight line-clamp-1">
                      {b.def.name}
                    </span>
                  </div>

                  {/* Colonist slot circles — each individually clickable */}
                  {max > 0 ? (
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {Array.from({ length: max }).map((_, slotIdx) => {
                        const filled = slotIdx < current;
                        const canFill = !filled && pool > 0;
                        return (
                          <button
                            key={slotIdx}
                            onClick={() => toggleBuildingSlot(bIdx, slotIdx)}
                            disabled={!filled && pool <= 0}
                            className="transition-all duration-150 hover:scale-110 active:scale-95 disabled:cursor-not-allowed rounded-full"
                            title={filled ? 'Click to recall colonist' : canFill ? 'Click to place colonist' : 'No colonists left'}
                          >
                            {filled ? (
                              <ColonistToken size={26} />
                            ) : (
                              <div
                                className="rounded-full transition-colors"
                                style={{
                                  width: 26,
                                  height: 26,
                                  border: `2px dashed rgba(74,29,122,${canFill ? '0.45' : '0.2'})`,
                                  background: canFill ? 'rgba(74,29,122,0.06)' : 'transparent',
                                }}
                              />
                            )}
                          </button>
                        );
                      })}
                      <span className="font-cinzel text-[9px] text-[#5a2e10]/40 tabular-nums ml-1">
                        {current}/{max}
                      </span>
                    </div>
                  ) : (
                    <span className="font-cinzel text-[9px] text-[#5a2e10]/30 italic">no slots</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Supply footnote ── */}
      <p className="text-center font-crimson text-[11px] text-[#5a2e10]/40 italic">
        Global colonist supply remaining: {colonistSupply}
      </p>

    </div>
  );
}
