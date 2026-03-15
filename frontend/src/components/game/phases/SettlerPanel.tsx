import useGameEngine from '../../../store/gameEngine';
import { ResourceIcon } from '../../icons/ResourceIcons';
import type { PlantationType } from '../../../data/constants';

export default function SettlerPanel() {
  const { visiblePlantations, quarriesRemaining, settlerTakePlantation, waitingForHuman,
          rolePickerSeat, activePlayerSeat, players } = useGameEngine();
  const player = players[activePlayerSeat];
  const isRolePicker = activePlayerSeat === rolePickerSeat;

  if (!waitingForHuman) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-bounce text-4xl mb-3">🌱</div>
          <p className="text-amber-600 font-medium">{player?.name} is choosing a plantation...</p>
        </div>
      </div>
    );
  }

  const humanPlayer = players[0];
  const hasConstructionHut = humanPlayer?.buildings.some(b => b.def.id === 'construction_hut' && b.colonists > 0);
  const canTakeQuarry = (isRolePicker || hasConstructionHut) && quarriesRemaining > 0;

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-bold text-amber-900">🌱 Settler — Choose a Plantation</h2>
        <p className="text-sm text-amber-600">
          Take one plantation tile to add to your island.
          {isRolePicker && ' As the Settler, you may also take a quarry.'}
        </p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {visiblePlantations.map((type, i) => (
          <button
            key={`${type}-${i}`}
            onClick={() => settlerTakePlantation(0, type)}
            className="p-4 rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-white to-emerald-50 hover:border-emerald-400 hover:shadow-lg hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 flex flex-col items-center gap-2"
          >
            <ResourceIcon type={type} size={40} />
            <span className="text-sm font-bold text-emerald-800 capitalize">{type}</span>
          </button>
        ))}

        {canTakeQuarry && (
          <button
            onClick={() => settlerTakePlantation(0, 'quarry')}
            className="p-4 rounded-xl border-2 border-gray-300 bg-gradient-to-br from-white to-gray-100 hover:border-gray-400 hover:shadow-lg hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 flex flex-col items-center gap-2"
          >
            <ResourceIcon type="quarry" size={40} />
            <span className="text-sm font-bold text-gray-700">Quarry</span>
            <span className="text-[10px] text-gray-500">-1 building cost</span>
          </button>
        )}
      </div>

      {quarriesRemaining > 0 && (
        <p className="mt-3 text-xs text-amber-500">
          {quarriesRemaining} quarries remaining in supply
        </p>
      )}
    </div>
  );
}
