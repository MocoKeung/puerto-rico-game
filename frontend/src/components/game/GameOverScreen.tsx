import { Trophy, Building2, Ship, Star, RotateCcw, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useGameContext } from '../../contexts/GameContext';
import { useNavigate } from 'react-router-dom';

export default function GameOverScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { gameOverScores, players, initGame, difficulty } = useGameContext();

  if (!gameOverScores) return null;

  const winner = players[gameOverScores[0].seat];
  const medals = ['1st', '2nd', '3rd'];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-amber-50 to-white rounded-3xl shadow-2xl max-w-lg w-full p-8 border border-amber-200">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-3 shadow-inner">
            <Trophy size={32} className="text-amber-600" strokeWidth={2} />
          </div>
          <h1 className="text-3xl font-cinzel font-bold text-amber-900">
            {t('gameOver.title', { defaultValue: 'Game Over!' })}
          </h1>
          <p className="text-amber-700 mt-2 text-lg font-crimson">
            <strong style={{ color: winner.color }}>{winner.name}</strong>{' '}
            {t('gameOver.winsWith', { defaultValue: 'wins with' })}{' '}
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
                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                  rank === 0
                    ? 'bg-amber-100 border-2 border-amber-400 shadow-md'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <span className="text-lg font-cinzel font-bold text-amber-800 w-8 text-center">
                  {rank < 3 ? medals[rank] : `#${rank + 1}`}
                </span>
                <div
                  className="w-3 h-8 rounded-full"
                  style={{ backgroundColor: player.color }}
                />
                <div className="flex-1">
                  <div className="font-cinzel font-bold text-amber-900">
                    {player.name}
                    {player.isHuman && (
                      <span className="ml-1 text-xs text-emerald-600 font-crimson">
                        ({t('gameOver.you', { defaultValue: 'You' })})
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-amber-700 flex gap-3 mt-0.5 font-crimson">
                    <span className="flex items-center gap-1">
                      <Building2 size={11} strokeWidth={2} />
                      {t('gameOver.buildings', { defaultValue: 'Buildings' })}: {score.breakdown.buildings}
                    </span>
                    <span className="flex items-center gap-1">
                      <Ship size={11} strokeWidth={2} />
                      {t('gameOver.shipping', { defaultValue: 'Shipping' })}: {score.breakdown.shipping}
                    </span>
                    {score.breakdown.bonusBuildings > 0 && (
                      <span className="flex items-center gap-1">
                        <Star size={11} strokeWidth={2} />
                        {t('gameOver.bonus', { defaultValue: 'Bonus' })}: {score.breakdown.bonusBuildings}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-2xl font-cinzel font-bold text-amber-800">{score.total}</span>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => initGame(difficulty)}
            className="flex-1 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-cinzel font-bold rounded-xl transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <RotateCcw size={16} />
            {t('gameOver.playAgain', { defaultValue: 'Play Again' })}
          </button>
          <button
            onClick={() => navigate('/local')}
            className="px-6 py-3 border-2 border-amber-300 text-amber-700 rounded-xl hover:bg-amber-50 active:scale-[0.98] transition-all font-cinzel flex items-center gap-2"
          >
            <Settings size={16} />
            {t('gameOver.settings', { defaultValue: 'Settings' })}
          </button>
        </div>
      </div>
    </div>
  );
}
