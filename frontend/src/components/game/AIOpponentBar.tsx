import useGameEngine from '../../store/gameEngine';
import AIOpponentCard from './AIOpponentCard';

export default function AIOpponentBar() {
  const { players, activePlayerSeat, governorSeat } = useGameEngine();
  const aiPlayers = players.filter(p => !p.isHuman);

  return (
    <div className="bg-gradient-to-r from-amber-100/80 to-amber-50/80 backdrop-blur-sm border-b border-amber-200/50 px-4 py-3">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Opponents</span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1">
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
