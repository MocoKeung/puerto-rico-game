import useGameEngine from '../../store/gameEngine';
import AIOpponentCard from './AIOpponentCard';

export default function AIOpponentBar() {
  const { players, activePlayerSeat, governorSeat } = useGameEngine();
  const aiPlayers = players.filter(p => !p.isHuman);

  if (aiPlayers.length === 0) return null;

  return (
    <div
      className="flex-shrink-0 border-b px-3 py-2"
      style={{
        background: 'rgba(12,53,71,0.85)',
        backdropFilter: 'blur(8px)',
        borderColor: 'rgba(201,135,12,0.2)',
      }}
    >
      <div className="max-w-screen-xl mx-auto">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="font-cinzel text-[9px] text-[#c9870c]/60 uppercase tracking-[0.2em]">
            Opponents
          </span>
        </div>
        {/* Horizontal scroll on small screens, wrap on large */}
        <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
          {aiPlayers.map(player => (
            <AIOpponentCard
              key={player.seat}
              player={player}
              isActive={player.seat === activePlayerSeat}
              isGovernor={player.seat === governorSeat}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
