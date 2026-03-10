import React from 'react';
import useGameStore from '../store/gameStore';

const ResourceTracker: React.FC = () => {
  const { collectResources } = useGameStore();
  
  return (
    <div className="bg-amber-200 rounded-lg p-4 shadow">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-bold text-amber-800">Resources</h2>
        <button 
          onClick={collectResources}
          className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded text-sm"
        >
          Collect
        </button>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between bg-amber-100 p-2 rounded">
          <span className="flex items-center">
            <span className="mr-2">🌽</span>
            <span>Corn</span>
          </span>
          <span className="font-bold">Available: 8</span>
        </div>
        <div className="flex items-center justify-between bg-amber-100 p-2 rounded">
          <span className="flex items-center">
            <span className="mr-2">🫐</span>
            <span>Indigo</span>
          </span>
          <span className="font-bold">Available: 8</span>
        </div>
        <div className="flex items-center justify-between bg-amber-100 p-2 rounded">
          <span className="flex items-center">
            <span className="mr-2">🍬</span>
            <span>Sugar</span>
          </span>
          <span className="font-bold">Available: 8</span>
        </div>
        <div className="flex items-center justify-between bg-amber-100 p-2 rounded">
          <span className="flex items-center">
            <span className="mr-2">🌿</span>
            <span>Tobacco</span>
          </span>
          <span className="font-bold">Available: 8</span>
        </div>
        <div className="flex items-center justify-between bg-amber-100 p-2 rounded">
          <span className="flex items-center">
            <span className="mr-2">☕</span>
            <span>Coffee</span>
          </span>
          <span className="font-bold">Available: 8</span>
        </div>
      </div>
    </div>
  );
};

export default ResourceTracker;