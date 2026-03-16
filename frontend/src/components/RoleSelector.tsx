import useGameStore, { type RoleType } from '../store/gameStore';

const roleDetails: Record<RoleType, {
  name: string;
  icon: string;
  description: string;
  accent: string;
  bg: string;
}> = {
  settler: {
    name: 'Settler',
    icon: '🌱',
    description: 'Take a plantation',
    accent: 'border-green-400',
    bg: 'hover:bg-green-600 bg-green-700 focus:ring-green-400',
  },
  builder: {
    name: 'Builder',
    icon: '🔨',
    description: 'Buy building (−1 coin)',
    accent: 'border-blue-400',
    bg: 'hover:bg-blue-600 bg-blue-700 focus:ring-blue-400',
  },
  mayor: {
    name: 'Mayor',
    icon: '📢',
    description: 'Get colonists (+1)',
    accent: 'border-purple-400',
    bg: 'hover:bg-purple-600 bg-purple-700 focus:ring-purple-400',
  },
  trader: {
    name: 'Trader',
    icon: '💰',
    description: 'Sell goods',
    accent: 'border-amber-400',
    bg: 'hover:bg-amber-600 bg-amber-700 focus:ring-amber-400',
  },
  captain: {
    name: 'Captain',
    icon: '⛵',
    description: 'Ship for VP',
    accent: 'border-sky-400',
    bg: 'hover:bg-sky-600 bg-sky-700 focus:ring-sky-400',
  },
  prospector: {
    name: 'Prospector',
    icon: '🪙',
    description: 'Take a doubloon',
    accent: 'border-orange-400',
    bg: 'hover:bg-orange-600 bg-orange-700 focus:ring-orange-400',
  },
};

export default function RoleSelector() {
  const { roles, selectRole, nextPlayer, endRolePhase, gamePhase, currentPlayerIndex, governorIndex, selectedRole, players } = useGameStore();

  const isGovernor = currentPlayerIndex === governorIndex;
  const selectedCount = roles.filter(r => r.selected).length;
  const allSelected = selectedCount === players.length;

  const handleSelectRole = (roleType: RoleType) => {
    const role = roles.find(r => r.type === roleType);
    if (role?.selected) return;

    selectRole(roleType);
    setTimeout(() => {
      const { roles: newRoles, players: newPlayers } = useGameStore.getState();
      const newSelectedCount = newRoles.filter(r => r.selected).length;
      if (newSelectedCount < newPlayers.length) {
        useGameStore.getState().nextPlayer();
      }
    }, 100);
  };

  const handleEndRolePhase = () => {
    endRolePhase();
    const { governorIndex: govIndex } = useGameStore.getState();
    useGameStore.setState({ currentPlayerIndex: govIndex });
  };

  return (
    <div className="bg-slate-800 border border-slate-600 rounded-2xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="px-5 py-3.5 bg-slate-700 border-b border-slate-600 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🎭</span>
          <h2 className="text-white font-bold text-lg">Select Your Role</h2>
        </div>
        {selectedCount > 0 && (
          <span className="bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold px-3 py-1 rounded-full">
            {selectedCount}/{players.length} selected
          </span>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Role Button Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {roles.map((role) => {
            const details = roleDetails[role.type];
            const isSelected = role.selected;
            const isSelectable = !isSelected && gamePhase === 'roleSelection';
            const selector = isSelected && role.selectedBy !== null ? players[role.selectedBy]?.name : null;

            return (
              <button
                key={role.type}
                onClick={() => isSelectable && handleSelectRole(role.type)}
                disabled={isSelected || gamePhase !== 'roleSelection'}
                className={`
                  relative flex flex-col items-center gap-1.5 px-3 py-4 rounded-xl border-2
                  font-semibold text-sm transition-all duration-150 outline-none
                  focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800
                  ${isSelected
                    ? 'bg-slate-700 border-slate-500 text-slate-500 cursor-not-allowed opacity-50'
                    : isSelectable
                      ? `${details.bg} border-transparent text-white cursor-pointer active:scale-95 shadow-lg`
                      : 'bg-slate-700/50 border-slate-600 text-slate-500 cursor-not-allowed opacity-40'}
                `}
              >
                {/* Doubloon bonus badge */}
                {role.doubloons > 0 && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-yellow-400 text-yellow-900 rounded-full flex items-center justify-center text-xs font-bold shadow">
                    {role.doubloons}
                  </div>
                )}
                {/* Selected tick */}
                {isSelected && (
                  <div className="absolute -top-2 -left-2 w-5 h-5 bg-slate-500 rounded-full flex items-center justify-center text-xs text-white">
                    ✓
                  </div>
                )}

                <span className="text-2xl">{details.icon}</span>
                <span className="text-center leading-tight">{details.name}</span>
                <span className="text-[10px] text-center opacity-75 font-normal leading-tight">{details.description}</span>
                {selector && (
                  <span className="text-[10px] text-slate-400 font-normal">by {selector}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Status + Action Row */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2 text-sm">
            {gamePhase === 'roleSelection' ? (
              <>
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-slate-300">
                  Waiting for <span className="text-white font-semibold">{players[currentPlayerIndex]?.name}</span> to pick
                </span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                <span className="text-slate-300">
                  Action phase: <span className="text-amber-300 font-semibold capitalize">{selectedRole || 'Ready'}</span>
                </span>
              </>
            )}
          </div>

          <div className="flex gap-2">
            {allSelected && gamePhase === 'roleSelection' && (
              <button
                onClick={handleEndRolePhase}
                className="bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-white font-bold px-5 py-2 rounded-lg shadow-lg transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-800"
              >
                Start Actions →
              </button>
            )}

            {gamePhase === 'action' && (
              <button
                onClick={() => useGameStore.getState().nextRound()}
                className="bg-green-600 hover:bg-green-500 active:bg-green-700 text-white font-bold px-5 py-2 rounded-lg shadow-lg transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-slate-800"
              >
                End Round →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
