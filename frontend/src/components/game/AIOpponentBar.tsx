import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useGameEngine, { type PlayerState } from '../../store/gameEngine';
import AIOpponentCard from './AIOpponentCard';
import OpponentDetailModal from './OpponentDetailModal';

export default function AIOpponentBar() {
  const { t } = useTranslation();
  const { players, activePlayerSeat, governorSeat } = useGameEngine();
  const aiPlayers = players.filter(p => !p.isHuman);
  const [selected, setSelected] = useState<PlayerState | null>(null);

  if (aiPlayers.length === 0) return null;

  const colClass =
    aiPlayers.length <= 2 ? 'grid-cols-2' :
    aiPlayers.length === 3 ? 'grid-cols-3' : 'grid-cols-4';

  return (
    <>
      <div
        className="flex-shrink-0 border-b"
        style={{
          background: 'rgba(12,53,71,0.88)',
          borderColor: 'rgba(201,135,12,0.25)',
        }}
      >
        <div className="max-w-screen-xl mx-auto px-4 py-2">
          <div className="mb-1.5">
            <span className="font-cinzel text-[11px] text-[#c9870c]/70 uppercase tracking-[0.22em]">
              {t('common.opponents')}
            </span>
          </div>
          <div className={`grid ${colClass} gap-2`}>
            {aiPlayers.map(player => (
              <AIOpponentCard
                key={player.seat}
                player={player}
                isActive={player.seat === activePlayerSeat}
                isGovernor={player.seat === governorSeat}
                onClick={() => setSelected(player)}
              />
            ))}
          </div>
        </div>
      </div>

      {selected && (
        <OpponentDetailModal
          key={selected.seat}
          player={selected}
          isGovernor={selected.seat === governorSeat}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
