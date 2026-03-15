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
    <div className="min-h-screen bg-ocean-pattern flex items-center justify-center p-4 relative overflow-hidden">

      {/* Decorative orbs */}
      <div className="absolute top-[-80px] left-[-80px] w-[300px] h-[300px] rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #0e6b9e, transparent)' }} />
      <div className="absolute bottom-[-60px] right-[-60px] w-[250px] h-[250px] rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #2d6a4f, transparent)' }} />
      <div className="absolute top-[40%] left-[60%] w-[180px] h-[180px] rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #c9870c, transparent)' }} />

      {/* Card */}
      <div
        className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
        style={{ background: '#f5e6c8', border: '2px solid rgba(201,135,12,0.4)' }}
      >
        {/* Inner border */}
        <div className="absolute inset-[6px] rounded-xl pointer-events-none z-10"
          style={{ border: '1px solid rgba(201,135,12,0.3)' }} />

        {/* Top accent */}
        <div className="h-1.5 bg-gradient-to-r from-[#2d6a4f] via-[#c9870c] to-[#1e3a5f]" />

        <div className="relative z-20 px-8 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-3 filter drop-shadow-lg">🌴</div>
            <h1 className="font-cinzel font-black text-[#3d1f0a] text-4xl tracking-wide mb-1">
              Puerto Rico
            </h1>
            <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-[#c9870c] to-transparent my-3" />
            <p className="font-crimson text-[#5a2e10] text-lg italic">
              Single Player — You vs 4 Rivals
            </p>
          </div>

          {/* Difficulty */}
          <div className="mb-7">
            <h2 className="font-cinzel text-xs text-[#5a2e10]/70 uppercase tracking-[0.2em] mb-3">
              AI Difficulty
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {(['easy', 'medium'] as Difficulty[]).map(d => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`
                    p-4 rounded-xl text-left transition-all duration-200
                    ${difficulty === d
                      ? 'shadow-md scale-[1.02]'
                      : 'opacity-70 hover:opacity-90'
                    }
                  `}
                  style={{
                    border: difficulty === d
                      ? `2px solid ${d === 'easy' ? '#2d6a4f' : '#c9870c'}`
                      : '2px solid rgba(61,31,10,0.15)',
                    background: difficulty === d
                      ? d === 'easy' ? 'rgba(45,106,79,0.1)' : 'rgba(201,135,12,0.1)'
                      : 'rgba(61,31,10,0.04)',
                  }}
                >
                  <div className="font-cinzel font-bold text-[#3d1f0a] text-sm capitalize mb-1">
                    {d === 'easy' ? '🌿 Easy' : '⚔️ Medium'}
                  </div>
                  <p className="font-crimson text-[#5a2e10]/70 text-xs leading-snug">
                    {d === 'easy'
                      ? 'Relaxed play. Great for learning the game.'
                      : 'Strategic rivals who prioritize production chains.'
                    }
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Game info */}
          <div
            className="rounded-xl p-4 mb-6 space-y-1.5 text-sm"
            style={{ background: 'rgba(61,31,10,0.06)', border: '1px solid rgba(61,31,10,0.1)' }}
          >
            <InfoRow icon="👥" text="You + 4 AI opponents (5 players)" />
            <InfoRow icon="🎯" text="Most Victory Points through shipping, building, producing" />
            <InfoRow icon="⏱️" text="~15–25 minutes per game" />
          </div>

          {/* Start button */}
          <button
            onClick={handleStart}
            className="w-full py-4 rounded-xl font-cinzel font-bold text-white text-lg tracking-wide transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #c9870c 0%, #f0a830 50%, #c9870c 100%)',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
            }}
          >
            Begin the Game
          </button>

          {/* Back */}
          <button
            onClick={() => navigate('/lobby')}
            className="w-full mt-3 py-2 font-crimson text-[#5a2e10]/60 hover:text-[#5a2e10] text-sm transition-colors italic"
          >
            ← Back to Lobby
          </button>
        </div>

        {/* Bottom accent */}
        <div className="h-1 bg-gradient-to-r from-[#1e3a5f] via-[#c9870c] to-[#2d6a4f]" />
      </div>
    </div>
  );
}

function InfoRow({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-sm flex-shrink-0 mt-0.5">{icon}</span>
      <span className="font-crimson text-[#3d1f0a]/80 text-sm">{text}</span>
    </div>
  );
}
