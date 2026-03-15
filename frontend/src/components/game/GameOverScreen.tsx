import useGameEngine from '../../store/gameEngine';
import { useNavigate } from 'react-router-dom';

export default function GameOverScreen() {
  const navigate = useNavigate();
  const { gameOverScores, players, initGame, difficulty } = useGameEngine();

  if (!gameOverScores) return null;

  const winner = players[gameOverScores[0].seat];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-amber-50 to-white rounded-3xl shadow-2xl max-w-lg w-full p-8 border border-amber-200">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🏆</div>
          <h1 className="text-3xl font-bold text-amber-900">Game Over!</h1>
          <p className="text-amber-600 mt-1">
            <strong style={{ color: winner.color }}>{winner.name}</strong> wins with{' '}
            <strong>{gameOverScores[0].total} VP</strong>!
          </p>
        </div>

        {/* Scoreboard */}
        <div className="space-y-2 mb-6">
          {gameOverScores.map((score, rank) => {
            const player = players[score.seat];
            return (
              <div
                key={score.seat}
                className={`flex items-center gap-3 p-3 rounded-xl ${
                  rank === 0
                    ? 'bg-amber-100 border-2 border-amber-400 shadow-md'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <span className="text-2xl font-bold text-amber-800 w-8">
                  {rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : `#${rank + 1}`}
                </span>
                <div
                  className="w-3 h-8 rounded-full"
                  style={{ backgroundColor: player.color }}
                />
                <div className="flex-1">
                  <div className="font-bold text-amber-900">
                    {player.name}
                    {player.isHuman && <span className="ml-1 text-xs text-emerald-600">(You)</span>}
                  </div>
                  <div className="text-xs text-amber-600 flex gap-2">
                    <span>🏛 Buildings: {score.breakdown.buildings}</span>
                    <span>⛵ Shipping: {score.breakdown.shipping}</span>
                    {score.breakdown.bonusBuildings > 0 && (
                      <span>⭐ Bonus: {score.breakdown.bonusBuildings}</span>
                    )}
                  </div>
                </div>
                <span className="text-2xl font-bold text-amber-800">{score.total}</span>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => initGame(difficulty)}
            className="flex-1 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold rounded-xl transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
          >
            Play Again
          </button>
          <button
            onClick={() => navigate('/local')}
            className="px-6 py-3 border-2 border-amber-300 text-amber-700 rounded-xl hover:bg-amber-50 transition-colors"
          >
            Settings
          </button>
        </div>
      </div>
    </div>
  );
}
