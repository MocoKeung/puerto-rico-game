import { type Player } from '../store/gameStore';

interface PlayerPanelProps {
  player: Player;
  isCurrent: boolean;
}

export default function PlayerPanel({ player, isCurrent }: PlayerPanelProps) {
  return (
    <div className={`rounded-xl p-4 shadow ${isCurrent ? 'bg-amber-300 border-2 border-amber-500' : 'bg-amber-200'}`}>
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-bold text-amber-800">{player.name}</h2>
        <span className="bg-amber-500 text-white px-2 py-1 rounded-full text-sm">
          {player.victoryPoints} VP
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-amber-100 p-2 rounded">
          <p className="text-sm text-amber-600">Colonists</p>
          <p className="font-bold text-amber-800">{player.colonists}</p>
        </div>
        <div className="bg-amber-100 p-2 rounded">
          <p className="text-sm text-amber-600">Doubloons</p>
          <p className="font-bold text-amber-800">{player.doubloons}</p>
        </div>
      </div>

      <div className="mb-3">
        <h3 className="font-semibold text-amber-700 mb-1">Resources</h3>
        <div className="grid grid-cols-5 gap-1">
          <div className="text-center">
            <div className="bg-yellow-200 rounded-full w-8 h-8 flex items-center justify-center mx-auto text-xs">🌽</div>
            <p className="text-xs mt-1">{player.resources.corn}</p>
          </div>
          <div className="text-center">
            <div className="bg-blue-200 rounded-full w-8 h-8 flex items-center justify-center mx-auto text-xs">🫐</div>
            <p className="text-xs mt-1">{player.resources.indigo}</p>
          </div>
          <div className="text-center">
            <div className="bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center mx-auto text-xs">🍬</div>
            <p className="text-xs mt-1">{player.resources.sugar}</p>
          </div>
          <div className="text-center">
            <div className="bg-green-200 rounded-full w-8 h-8 flex items-center justify-center mx-auto text-xs">🌿</div>
            <p className="text-xs mt-1">{player.resources.tobacco}</p>
          </div>
          <div className="text-center">
            <div className="bg-amber-800 rounded-full w-8 h-8 flex items-center justify-center mx-auto text-xs">☕</div>
            <p className="text-xs mt-1">{player.resources.coffee}</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-amber-700 mb-1">Buildings</h3>
        <div className="flex flex-wrap gap-1">
          {player.buildings.map((building, index) => (
            <span key={index} className="bg-amber-500 text-white text-xs px-2 py-1 rounded">{building}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
