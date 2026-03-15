import useGameEngine from '../../store/gameEngine';

interface GameLogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GameLog({ isOpen, onClose }: GameLogProps) {
  const gameLog = useGameEngine(s => s.gameLog);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="bg-amber-800 text-white px-4 py-3 flex items-center justify-between">
          <h2 className="font-bold">📜 Game Log</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-amber-700 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto h-[calc(100%-52px)] p-3 space-y-1">
          {gameLog.map((entry, i) => (
            <div
              key={i}
              className={`text-xs px-2 py-1.5 rounded ${
                entry.seat === null
                  ? 'bg-amber-50 text-amber-700 font-medium'
                  : entry.seat === 0
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-gray-600'
              }`}
            >
              {entry.message}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
