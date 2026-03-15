import useGameEngine from '../../store/gameEngine';
import { ROLE_LABELS } from '../../data/constants';

export default function GameHeader() {
  const { round, phase, governorSeat, activePlayerSeat, players, rolePickerSeat } = useGameEngine();
  const governor = players[governorSeat];
  const activePlayer = players[activePlayerSeat];
  const rolePicker = players[rolePickerSeat];

  const phaseLabel = phase === 'role_selection'
    ? 'Role Selection'
    : phase === 'game_over'
      ? 'Game Over'
      : (ROLE_LABELS[phase as keyof typeof ROLE_LABELS] ?? phase);

  const isYourTurn = activePlayer?.isHuman;

  return (
    <header className="bg-wood shadow-[0_2px_20px_rgba(0,0,0,0.5)] relative overflow-hidden">
      {/* Subtle wood grain lines */}
      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.03) 40px, rgba(255,255,255,0.03) 41px)',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3 flex-wrap">

        {/* Left: Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌴</span>
            <h1 className="font-cinzel font-bold text-[#f0a830] text-lg tracking-widest uppercase">
              Puerto Rico
            </h1>
          </div>
          <div className="h-5 w-px bg-[#c9870c]/40" />
          <div className="flex items-center gap-1.5">
            <span className="text-[#c9870c]/60 text-xs font-cinzel">Round</span>
            <span className="font-cinzel font-bold text-[#f0a830] text-sm">{round}</span>
          </div>
        </div>

        {/* Center: Phase */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white/8 border border-white/15 rounded-lg px-4 py-1.5 backdrop-blur-sm">
            <span className="text-[10px] text-white/50 font-cinzel tracking-[0.15em] uppercase">Phase</span>
            <span className="font-cinzel font-bold text-white text-sm">{phaseLabel}</span>
          </div>
          {phase !== 'role_selection' && phase !== 'game_over' && rolePicker && (
            <div className="text-xs text-white/50 font-crimson italic hidden sm:block">
              by <span className="text-white/70 not-italic font-semibold">{rolePicker.name}</span>
            </div>
          )}
        </div>

        {/* Right: Governor + Turn */}
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1.5 text-white/60">
            <span className="text-[#f0a830] text-base">👑</span>
            <span className="font-crimson text-sm">{governor?.name}</span>
          </div>

          <div className="h-4 w-px bg-white/20" />

          {isYourTurn ? (
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f0a830] opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#f0a830]" />
              </span>
              <span className="font-cinzel font-bold text-[#f0a830] text-xs tracking-wide uppercase">
                Your Turn
              </span>
            </div>
          ) : (
            <span className="text-white/50 font-crimson text-sm italic">
              {activePlayer?.name}'s turn
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
