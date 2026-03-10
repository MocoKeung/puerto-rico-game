import React from 'react';
import useGameStore from '../store/gameStore';

const roles = [
  { id: 'settler', name: 'Settler', description: 'Get a plantation' },
  { id: 'mayor', name: 'Mayor', description: 'Get colonists' },
  { id: 'builder', name: 'Builder', description: 'Buy a building' },
  { id: 'craftsman', name: 'Craftsman', description: 'Produce goods' },
  { id: 'trader', name: 'Trader', description: 'Sell goods' },
  { id: 'captain', name: 'Captain', description: 'Ship goods' },
  { id: 'prospector', name: 'Prospector', description: 'Get doubloons' },
];

const RoleSelector: React.FC = () => {
  const { selectRole, selectedRole } = useGameStore();
  
  return (
    <div className="bg-amber-200 rounded-lg p-4 shadow">
      <h2 className="text-xl font-bold text-amber-800 mb-3">Select a Role</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {roles.map((role) => (
          <button
            key={role.id}
            onClick={() => selectRole(role.id)}
            className={`p-2 rounded text-center transition-all ${
              selectedRole === role.id
                ? 'bg-amber-600 text-white ring-2 ring-amber-800'
                : 'bg-amber-100 hover:bg-amber-300 text-amber-800'
            }`}
          >
            <div className="font-semibold">{role.name}</div>
            <div className="text-xs opacity-80">{role.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RoleSelector;