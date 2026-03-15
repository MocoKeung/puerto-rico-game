import useGameEngine from '../../../store/gameEngine';

export default function MayorPanel() {
  // Mayor auto-distributes colonists. This panel shows the result.
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="text-4xl mb-3">👑</div>
        <h2 className="text-lg font-bold text-amber-900 mb-2">Mayor — Colonists Distributed!</h2>
        <p className="text-sm text-amber-600 max-w-md">
          Colonists have been automatically assigned to your plantations and buildings.
          Check your island board to see the updated assignments.
        </p>
      </div>
    </div>
  );
}
