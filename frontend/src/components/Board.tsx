import React from 'react';
import PlayerPanel from './PlayerPanel';
import RoleSelector from './RoleSelector';
import ResourceTracker from './ResourceTracker';
import BuildingMarket from './BuildingMarket';
import ShipArea from './ShipArea';
import useGameStore from '../store/gameStore';

const Board: React.FC = () => {
  const { players } = useGameStore();
  
  return (
    <div className="max-w-6xl mx-auto bg-amber-100 rounded-xl shadow-lg p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Players */}
        <div className="lg:col-span-1 space-y-4">
          {players.map((player, index) => (
            <PlayerPanel 
              key={player.id} 
              player={player} 
              isCurrent={index === 0} // Simplified for demo
            />
          ))}
        </div>
        
        {/* Middle Column - Main Game Area */}
        <div className="lg:col-span-1 space-y-6">
          <RoleSelector />
          <div className="bg-amber-200 rounded-lg p-4 shadow">
            <h2 className="text-xl font-bold text-amber-800 mb-2">Game Board</h2>
            <div className="h-64 flex items-center justify-center bg-amber-300 rounded border-2 border-amber-400">
              <p className="text-amber-700">Main Board Area</p>
            </div>
          </div>
          <ResourceTracker />
        </div>
        
        {/* Right Column - Market and Ships */}
        <div className="lg:col-span-1 space-y-6">
          <BuildingMarket />
          <ShipArea />
        </div>
      </div>
    </div>
  );
};

export default Board;