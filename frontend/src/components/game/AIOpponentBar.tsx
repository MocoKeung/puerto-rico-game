import useGameEngine from '../../store/gameEngine';
import AIOpponentCard from './AIOpponentCard';

export default function AIOpponentBar() {
  const { players, activePlayerSeat, governorSeat } = useGameEngine();
  const aiPlayers = players.filter(p => !p.isHuman);

  return (
    <div
      className="border-b px-4 py-3"
      style={{
        background: 'rgba(12,53,71,0.7)',
        backdropFilter: 'blur(8px)',
        borderColor: 'rgba(201,135,12,0.2)',
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-cinzel text-[10px] text-[#c9870c]/70 uppercase tracking-[0.2em]">Opponents</span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
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
