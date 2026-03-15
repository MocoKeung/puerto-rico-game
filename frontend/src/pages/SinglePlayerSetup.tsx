import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useGameEngine from '../store/gameEngine';
import type { Difficulty } from '../data/constants';

export default function SinglePlayerSetup() {
  const navigate = useNavigate();
  const initGame = useGameEngine(s => s.initGame);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');

  function handleStart() {
    initGame(difficulty);
    navigate('/local/play');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-950 via-sky-900 to-cyan-900 flex items-center justify-center p-4">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative bg-gradient-to-b from-amber-50 to-amber-100 rounded-3xl shadow-2xl max-w-lg w-full p-8 border border-amber-200">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-900 mb-2">
            <span className="text-5xl">🌴</span> Puerto Rico
          </h1>
          <p className="text-amber-700 text-lg">Single Player vs 4 AI Opponents</p>
        </div>

        {/* Difficulty Selection */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-amber-800 uppercase tracking-wider mb-3">
            AI Difficulty
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setDifficulty('easy')}
              className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                difficulty === 'easy'
                  ? 'border-emerald-500 bg-emerald-50 shadow-md scale-[1.02]'
                  : 'border-amber-200 bg-white hover:border-amber-400'
              }`}
            >
              <div className="text-lg font-bold text-amber-900">Easy</div>
              <p className="text-xs text-amber-600 mt-1">
                Simple decisions. Great for learning the game.
              </p>
            </button>
            <button
              onClick={() => setDifficulty('medium')}
              className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                difficulty === 'medium'
                  ? 'border-amber-500 bg-amber-50 shadow-md scale-[1.02]'
                  : 'border-amber-200 bg-white hover:border-amber-400'
              }`}
            >
              <div className="text-lg font-bold text-amber-900">Medium</div>
              <p className="text-xs text-amber-600 mt-1">
                Strategic play. AI prioritizes production chains.
              </p>
            </button>
          </div>
        </div>

        {/* Game Info */}
        <div className="bg-amber-800/5 rounded-xl p-4 mb-6 text-sm text-amber-700 space-y-1">
          <p><strong>Players:</strong> You + 4 AI opponents</p>
          <p><strong>Goal:</strong> Earn the most Victory Points through shipping goods, buying buildings, and producing resources</p>
          <p><strong>Duration:</strong> ~15-25 minutes</p>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStart}
          className="w-full py-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-lg rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]"
        >
          Start Game
        </button>

        {/* Back Link */}
        <button
          onClick={() => navigate('/lobby')}
          className="w-full mt-3 py-2 text-amber-600 hover:text-amber-800 text-sm transition-colors"
        >
          ← Back to Lobby
        </button>
      </div>
    </div>
  );
}
