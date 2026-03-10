import React from 'react';
import useGameStore from '../store/gameStore';

const BuildingMarket: React.FC = () => {
  const { buildingsAvailable, buyBuilding } = useGameStore();
  
  return (
    <div className="bg-amber-200 rounded-lg p-4 shadow">
      <h2 className="text-xl font-bold text-amber-800 mb-3">Building Market</h2>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {buildingsAvailable.map((building, index) => (
          <div 
            key={index} 
            className="flex justify-between items-center bg-amber-100 p-3 rounded hover:bg-amber-300 transition-colors"
          >
            <div>
              <div className="font-semibold">{building.name}</div>
              <div className="text-sm text-amber-600">
                {building.type} • {building.spaces} space{building.spaces > 1 ? 's' : ''}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-bold">{building.cost}💰</span>
              <button 
                onClick={() => buyBuilding(building.name)}
                className="bg-amber-500 hover:bg-amber-600 text-white px-2 py-1 rounded text-sm"
              >
                Buy
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BuildingMarket;