import useGameStore, { type RoleType } from '../store/gameStore';

const roleDetails: Record<RoleType, {
  name: string;
  icon: string;
  description: string;
  color: string;
}> = {
  settler: {
    name: 'Settler',
    icon: '🌱',
    description: 'Take a plantation',
    color: 'from-green-500 to-green-600',
  },
  builder: {
    name: 'Builder',
    icon: '🔨',
    description: 'Buy building (-1 coin)',
    color: 'from-blue-500 to-blue-600',
  },
  mayor: {
    name: 'Mayor',
    icon: '📢',
    description: 'Get colonists (+1)',
    color: 'from-purple-500 to-purple-600',
  },
  trader: {
    name: 'Trader',
    icon: '💰',
    description: 'Sell goods',
    color: 'from-amber-500 to-amber-600',
  },
  captain: {
    name: 'Captain',
    icon: '⛵',
    description: 'Ship for VP',
    color: 'from-sky-500 to-sky-600',
  },
  prospector: {
    name: 'Prospector',
    icon: '🪙',
    description: 'Take doubloon',
    color: 'from-orange-500 to-orange-600',
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
    // Auto advance to next player for role selection
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
    // Reset current player to governor for action phase
    const { governorIndex: govIndex } = useGameStore.getState();
    useGameStore.setState({ currentPlayerIndex: govIndex });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-amber-700 to-amber-600 px-4 py-3">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span>🎭</span>
          Select Your Role
          {selectedCount > 0 && (
            <span className="text-sm font-normal text-amber-200 ml-auto">
              ({selectedCount}/{players.length} selected)
            </span>
          )}
        </h2>
      </div>
      
      <div className="p-4">
        {/* Role Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {(roles.map((role) => {
            const details = roleDetails[role.type];
            const isSelected = role.selected;
            const selector = isSelected ? (role.selectedBy !== null ? players[role.selectedBy]?.name : '') : '';

            return (
              <button
                key={role.type}
                onClick={() => !isSelected && gamePhase === 'roleSelection' && handleSelectRole(role.type)}
                disabled={isSelected || gamePhase !== 'roleSelection'}
                className={`
                  relative rounded-lg p-3 text-left transition-all duration-200
                  ${isSelected 
                    ? 'bg-gray-100 border-2 border-gray-300 cursor-not-allowed opacity-60' 
                    : gamePhase === 'roleSelection'
                      ? `bg-gradient-to-br ${details.color} hover:scale-105 hover:shadow-lg text-white border-2 border-transparent`
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                  }
                `}
              >
                {role.doubloons > 0 && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-yellow-900 shadow-md">
                    {role.doubloons}
                  </div>
                )}
                
                {/* CSS Placeholder for Role Card - used for prospector and when icon doesn't exist */}
                <div className={`
                  ${!details.icon || role.type === 'prospector' 
                    ? 'prospector-placeholder w-full h-16 rounded-md flex items-center justify-center text-lg font-bold' 
                    : 'text-3xl mb-1'
                  }
                  ${!details.icon || role.type === 'prospector'
                    ? 'bg-gradient-to-r from-orange-700 to-orange-600 border border-orange-500 text-amber-100'
                    : ''
                  }`
                  }
                >
                  {role.type === 'prospector' ? 'PROSPECTOR' : (details.icon || '?')}
                </div>
                
                <div className="font-bold text-sm">{details.name}</div>
                <div className="text-xs opacity-80 mt-1">{details.description}</div>
                {isSelected && selector && (
                  <div className="mt-2 text-xs font-semibold text-gray-500">
                    ✓ Selected by {selector}
                  </div>
                )}
              </button>
            );
          }))}
        </div>

        {/* Phase Controls */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {gamePhase === 'roleSelection' ? (
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Waiting for {players[currentPlayerIndex]?.name} to select a role
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                Action phase: {selectedRole || 'Ready'}
              </span>
            )}
          </div>
          
          {allSelected && gamePhase === 'roleSelection' && (
            <button
              onClick={handleEndRolePhase}
              className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              Start Actions
            </button>
          )}
          
          {gamePhase === 'action' && (
            <button
              onClick={() => {
                const { nextRound } = useGameStore.getState();
                nextRound();
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              End Round
            </button>
          )}
        </div>
      </div>
    </div>
  );
}