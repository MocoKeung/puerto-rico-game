import useGameEngine from '../../store/gameEngine';
import AIOpponentCard from './AIOpponentCard';

export default function AIOpponentBar() {
  const { players, activePlayerSeat, governorSeat } = useGameEngine();
  const aiPlayers = players.filter(p => !p.isHuman);

  if (aiPlayers.length === 0) return null;

  // Spread all opponents equally across the full width.
  // grid-cols-N fills the bar evenly regardless of count (2, 3, or 4 opponents).
  const colClass =
    aiPlayers.length <= 2 ? 'grid-cols-2' :
    aiPlayers.length === 3 ? 'grid-cols-3' : 'grid-cols-4';

  return (
    <div
      className="flex-shrink-0 border-b"
      style={{
        background: 'rgba(12,53,71,0.88)',
        backdropFilter: 'blur(8px)',
        borderColor: 'rgba(201,135,12,0.25)',
      }}
    >
      <div className="max-w-screen-xl mx-auto px-4 py-2">
        {/* Label */}
        <div className="mb-1.5">
          <span className="font-cinzel text-[9px] text-[#c9870c]/60 uppercase tracking-[0.22em]">
            Opponents
          </span>
        </div>

        {/* Equal-width grid — fills the full container width */}
        <div className={`grid ${colClass} gap-2`}>
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
