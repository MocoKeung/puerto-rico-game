import useGameEngine from '../../store/gameEngine';
import { ROLE_LABELS } from '../../data/constants';

export default function GameHeader() {
  const { round, phase, governorSeat, activePlayerSeat, players, rolePickerSeat } = useGameEngine();
  const governor = players[governorSeat];
  const activePlayer = players[activePlayerSeat];
  const rolePicker = players[rolePickerSeat];

  const phaseLabel = phase === 'role_selection'
    ? 'Select a Role'
    : phase === 'game_over'
      ? 'Game Over'
      : `${ROLE_LABELS[phase as keyof typeof ROLE_LABELS] ?? phase}`;

  return (
    <header className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 text-white px-4 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        {/* Left: Title + Round */}
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold tracking-tight">
            <span className="text-2xl mr-1">🌴</span>Puerto Rico
          </h1>
          <div className="h-6 w-px bg-amber-600" />
          <span className="text-amber-200 text-sm font-medium">Round {round}</span>
        </div>

        {/* Center: Phase */}
        <div className="flex items-center gap-2">
          <div className="px-4 py-1.5 bg-amber-700/50 rounded-lg border border-amber-600/50">
            <span className="text-xs text-amber-300 uppercase tracking-wider">Phase</span>
            <span className="ml-2 font-bold text-amber-100">{phaseLabel}</span>
          </div>
          {phase !== 'role_selection' && phase !== 'game_over' && (
            <div className="px-3 py-1.5 bg-amber-700/30 rounded-lg text-xs text-amber-200">
              Selected by <strong>{rolePicker?.name}</strong>
            </div>
          )}
        </div>

        {/* Right: Governor + Active player */}
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1.5">
            <span className="text-amber-400">👑</span>
            <span className="text-amber-200">{governor?.name}</span>
          </div>
          <div className="h-4 w-px bg-amber-600" />
          <div className="flex items-center gap-1.5">
            {activePlayer?.isHuman ? (
              <span className="px-2 py-0.5 bg-emerald-500/80 text-white text-xs font-bold rounded animate-pulse">
                YOUR TURN
              </span>
            ) : (
              <span className="text-amber-300 text-xs">{activePlayer?.name}'s turn</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
