import useGameEngine from '../../../store/gameEngine';
import RoleCard from '../RoleCard';

export default function RoleSelectionPanel() {
  const { roles, selectRole, waitingForHuman } = useGameEngine();

  if (!waitingForHuman) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full border-2 border-[#c9870c]/40 border-t-[#c9870c] animate-spin" />
          <p className="text-[#5a2e10] font-cinzel text-sm tracking-wide">
            Opponent is choosing…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-5 text-center">
        <h2 className="font-cinzel text-xl font-bold text-[#3d1f0a] tracking-wide">
          Choose Your Role
        </h2>
        <p className="font-crimson text-sm text-[#5a2e10] mt-1 italic">
          Select a role to activate its privilege and action for all players.
        </p>
      </div>

      {/* Card fan — horizontal scroll on all sizes */}
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide justify-start px-1">
        {roles.map((role, i) => (
          <RoleCard
            key={role.type}
            role={role}
            disabled={!role.available}
            onSelect={() => selectRole(0, role.type)}
            animationDelay={i * 60}
          />
        ))}
      </div>

      <p className="text-center text-[10px] text-[#8a6a40] mt-1 font-crimson italic">
        Scroll to see all roles →
      </p>
    </div>
  );
}
