import PlayerPanel from './PlayerPanel';
import RoleSelector from './RoleSelector';
import ResourceTracker from './ResourceTracker';
import BuildingMarket from './BuildingMarket';
import ShipArea from './ShipArea';
import useGameStore from '../store/gameStore';

export default function Board() {
  const { players, currentPlayerIndex, gamePhase, currentRound, governorIndex, selectedRole, gameLog } = useGameStore();

  const currentPlayer = players[currentPlayerIndex];
  const governor = players[governorIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 border-b-4 border-amber-600 shadow-2xl">
        <div className="max-w-screen-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-amber-100 tracking-wide">🌴 Puerto Rico</h1>
              <p className="text-amber-300 text-sm mt-0.5">Round {currentRound} | Governor: {governor?.name}</p>
            </div>
            <div className="text-right">
              <div className="text-amber-200 font-semibold text-sm uppercase tracking-wider">
                Phase
              </div>
              <div className="text-white font-bold text-lg">
                {gamePhase === 'roleSelection' ? 'Select Role' : selectedRole
                  ? selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)
                  : 'Action Phase'}
              </div>
              <div className="text-amber-300 text-sm">
                Current: <span className="text-white font-semibold">{currentPlayer?.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="max-w-screen-2xl mx-auto px-4 py-5 grid grid-cols-1 xl:grid-cols-12 gap-5">

        {/* ── LEFT: Player Boards ── */}
        <div className="xl:col-span-5 space-y-4">
          <div className="flex items-center gap-3 px-1">
            <div className="w-1 h-6 bg-amber-500 rounded-full"></div>
            <h2 className="text-lg font-bold text-amber-200 uppercase tracking-widest">Player Boards</h2>
          </div>

          {players.map((player, index) => (
            <PlayerPanel
              key={player.id}
              player={player}
              isCurrent={index === currentPlayerIndex}
              isGovernor={index === governorIndex}
            />
          ))}
        </div>

        {/* ── RIGHT: Shared Game State ── */}
        <div className="xl:col-span-7 space-y-4">
          <div className="flex items-center gap-3 px-1">
            <div className="w-1 h-6 bg-sky-400 rounded-full"></div>
            <h2 className="text-lg font-bold text-sky-200 uppercase tracking-widest">Game Board</h2>
          </div>

          {/* Role Selection */}
          <RoleSelector />

          {/* Current Role Banner */}
          {selectedRole && (
            <div className="flex items-center gap-3 bg-amber-500/20 border border-amber-500/50 rounded-xl px-5 py-3">
              <span className="text-2xl">🎭</span>
              <div>
                <div className="text-amber-200 text-xs uppercase tracking-wider font-semibold">Active Role</div>
                <div className="text-white font-bold text-lg">
                  {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
                </div>
              </div>
              <div className="ml-auto text-amber-300 text-sm">
                {selectedRole === 'settler' && 'Take a plantation tile'}
                {selectedRole === 'builder' && 'Buy a building (−1 doubloon)'}
                {selectedRole === 'mayor' && 'Distribute colonists'}
                {selectedRole === 'trader' && 'Sell a good to the trading house'}
                {selectedRole === 'captain' && 'Ship goods for victory points'}
                {selectedRole === 'prospector' && 'Collect a doubloon'}
              </div>
            </div>
          )}

          {/* Resources + Ships side by side on wide screens */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ResourceTracker />
            <ShipArea />
          </div>

          {/* Building Market */}
          <BuildingMarket />

          {/* Game Log */}
          <div className="bg-slate-800 border border-slate-600 rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-700 border-b border-slate-600 flex items-center gap-2">
              <span className="text-slate-300">📜</span>
              <h3 className="font-semibold text-slate-200 text-sm uppercase tracking-wider">Game Log</h3>
            </div>
            <div className="max-h-36 overflow-y-auto p-3 space-y-1">
              {gameLog.length === 0 ? (
                <p className="text-slate-500 text-sm italic">No events yet.</p>
              ) : (
                gameLog.slice(0, 15).map((log, i) => (
                  <p key={i} className="text-sm text-slate-400 border-b border-slate-700 pb-1 last:border-0">
                    {log.message}
                  </p>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
