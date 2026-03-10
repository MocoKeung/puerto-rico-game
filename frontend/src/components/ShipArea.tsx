import React from 'react';

const ShipArea: React.FC = () => {
  return (
    <div className="bg-amber-200 rounded-lg p-4 shadow">
      <h2 className="text-xl font-bold text-amber-800 mb-3">Ships</h2>
      <div className="space-y-3">
        <div className="bg-blue-100 border-2 border-blue-300 rounded-lg p-3">
          <div className="flex justify-between mb-2">
            <span className="font-semibold text-blue-800">Small Ship</span>
            <span className="text-sm">Capacity: 4</span>
          </div>
          <div className="h-6 bg-blue-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-amber-500 rounded-full" 
              style={{ width: '50%' }}
            ></div>
          </div>
          <div className="text-right text-sm mt-1">
            <span>2/4</span>
          </div>
        </div>
        
        <div className="bg-blue-100 border-2 border-blue-300 rounded-lg p-3">
          <div className="flex justify-between mb-2">
            <span className="font-semibold text-blue-800">Medium Ship</span>
            <span className="text-sm">Capacity: 6</span>
          </div>
          <div className="h-6 bg-blue-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-amber-500 rounded-full" 
              style={{ width: '0%' }}
            ></div>
          </div>
          <div className="text-right text-sm mt-1">
            <span>0/6</span>
          </div>
        </div>
        
        <div className="bg-blue-100 border-2 border-blue-300 rounded-lg p-3">
          <div className="flex justify-between mb-2">
            <span className="font-semibold text-blue-800">Large Ship</span>
            <span className="text-sm">Capacity: 8</span>
          </div>
          <div className="h-6 bg-blue-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-amber-500 rounded-full" 
              style={{ width: '12.5%' }}
            ></div>
          </div>
          <div className="text-right text-sm mt-1">
            <span>1/8</span>
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t border-amber-300">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-amber-700">Colonists on Ship:</span>
          <span className="text-lg font-bold">3</span>
        </div>
      </div>
    </div>
  );
};

export default ShipArea;