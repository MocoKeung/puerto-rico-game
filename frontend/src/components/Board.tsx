import PlayerPanel from './PlayerPanel';
import RoleSelector from './RoleSelector';
import ResourceTracker from './ResourceTracker';
import BuildingMarket from './BuildingMarket';
import ShipArea from './ShipArea';
import { useGameStore } from '../store/gameStore';

export default function Board() {
  const { players, currentPlayerIndex, gamePhase, currentRound, governorIndex, selectedRole, gameLog } = useGameStore();
  
  const currentPlayer = players[currentPlayerIndex];
  const governor = players[governorIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 via-yellow-50 to-amber-100 p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-gradient-to-r from-amber-800 to-amber-700 rounded-xl shadow-lg p-4 text-white">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">🌴 Puerto Rico</h1>
              <p className="text-amber-200">Round {currentRound} | Governor: {governor?.name}</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold">
                Phase: <span className="text-amber-300">{gamePhase === 'roleSelection' ? 'Select Role' : selectedRole ? `Action: ${selectedRole}` : 'Action Phase'}</span>
              </div>
              <div className="text-sm text-amber-200">
                Current: {currentPlayer?.name}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column - Players */}
        <div className="lg:col-span-3 space-y-3">
          <h2 className="text-xl font-bold text-amber-800 px-2">👥 Players</h2>
          {players.map((player, index) => (
            <PlayerPanel 
              key={player.id} 
              player={player} 
              isCurrent={index === currentPlayerIndex}
              isGovernor={index === governorIndex}
            />
          ))}
        </div>

        {/* Middle Column - Role Selection & Resources */}
        <div className="lg:col-span-5 space-y-4">
          <RoleSelector />
          
          {selectedRole && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4">
              <h3 className="font-bold text-amber-800 mb-2">
                🎭 Current Role: {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
              </h3>
              <p className="text-sm text-amber-700">
                {selectedRole === 'settler' && 'Take a plantation tile and add it to your board'}
                {selectedRole === 'builder' && 'Buy a building at a discount (-1 doubloon)'}
                {selectedRole === 'mayor' && 'Take colonists and distribute them to your plantations and buildings'}
                {selectedRole === 'trader' && 'Sell a good to the trading house'}
                {selectedRole === 'captain' && 'Ship goods on cargo ships for victory points'}
              </p>
            </div>
          )}
          
          <ResourceTracker />
        </div>

        {/* Right Column - Market & Ships */}
        <div className="lg:col-span-4 space-y-4">
          <BuildingMarket />
          <ShipArea />
          
          {/* Game Log */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
              <h3 className="font-bold text-gray-700">📜 Game Log</h3>
            </div>
            <div className="max-h-48 overflow-y-auto p-3 space-y-1">
              {gameLog.slice(0, 10).map((log, i) => (
                <p key={i} className="text-sm text-gray-600 border-b border-gray-100 pb-1">
                  {log.message}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
