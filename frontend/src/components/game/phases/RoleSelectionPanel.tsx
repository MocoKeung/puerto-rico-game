import useGameEngine from '../../../store/gameEngine';
import { ROLE_LABELS, ROLE_DESCRIPTIONS, type RoleType } from '../../../data/constants';

const ROLE_ICONS: Record<RoleType, string> = {
  settler: '🌱',
  builder: '🏗️',
  mayor: '👑',
  craftsman: '⚒️',
  captain: '⛵',
  trader: '💰',
  prospector: '🪙',
};

const ROLE_GRADIENTS: Record<RoleType, string> = {
  settler: 'from-emerald-500 to-green-600',
  builder: 'from-blue-500 to-indigo-600',
  mayor: 'from-purple-500 to-violet-600',
  craftsman: 'from-orange-500 to-amber-600',
  captain: 'from-sky-500 to-cyan-600',
  trader: 'from-amber-500 to-yellow-600',
  prospector: 'from-gray-500 to-slate-600',
};

export default function RoleSelectionPanel() {
  const { roles, selectRole, waitingForHuman } = useGameEngine();

  if (!waitingForHuman) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-3">🤔</div>
          <p className="text-amber-600 font-medium">AI is choosing a role...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-bold text-amber-900">Choose a Role</h2>
        <p className="text-sm text-amber-600">
          Select a role to activate. You go first, then all players take the role action.
        </p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {roles.map(role => {
          const disabled = !role.available;
          return (
            <button
              key={role.type}
              onClick={() => !disabled && selectRole(0, role.type)}
              disabled={disabled}
              className={`
                relative p-4 rounded-xl border-2 text-left transition-all duration-200
                ${disabled
                  ? 'border-gray-200 bg-gray-50 opacity-40 cursor-not-allowed'
                  : 'border-amber-200 bg-white hover:border-amber-400 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
                }
              `}
            >
              {/* Bonus badge */}
              {role.bonusDoubloons > 0 && !disabled && (
                <div className="absolute -top-2 -right-2 w-7 h-7 bg-amber-500 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-xs font-bold text-white">+{role.bonusDoubloons}</span>
                </div>
              )}

              {/* Icon + gradient bar */}
              <div className={`w-full h-1.5 rounded-full bg-gradient-to-r ${ROLE_GRADIENTS[role.type]} mb-3`} />

              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-2xl">{ROLE_ICONS[role.type]}</span>
                <span className="font-bold text-amber-900">{ROLE_LABELS[role.type]}</span>
              </div>

              <p className="text-xs text-amber-600 leading-relaxed">
                {ROLE_DESCRIPTIONS[role.type]}
              </p>

              {disabled && role.selectedBySeat !== null && (
                <p className="mt-2 text-xs text-gray-400 italic">Already selected</p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
