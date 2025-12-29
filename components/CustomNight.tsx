import React, { useState } from 'react';
import { AnimatronicId } from '../types';

interface Props {
  onStart: (levels: Record<AnimatronicId, number>) => void;
  onBack: () => void;
}

const CustomNight: React.FC<Props> = ({ onStart, onBack }) => {
  const [levels, setLevels] = useState<Record<AnimatronicId, number>>({
    [AnimatronicId.SHADOW]: 0,
    [AnimatronicId.WIDOW]: 0,
    [AnimatronicId.CRAWLER]: 0,
    [AnimatronicId.WATCHER]: 0,
  });

  const changeLevel = (id: AnimatronicId, delta: number) => {
    setLevels(prev => ({
      ...prev,
      [id]: Math.max(0, Math.min(20, prev[id] + delta))
    }));
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 z-20 font-mono touch-none select-none">
      <h2 className="text-4xl text-white mb-8 border-b-2 border-red-900 pb-2">CUSTOM NIGHT</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
        {Object.values(AnimatronicId).map(id => (
          <div key={id} className="flex flex-col items-center bg-black p-4 border border-gray-700">
            <div className="w-24 h-24 bg-gray-800 mb-4 overflow-hidden rounded-full">
               <img src={`https://picsum.photos/seed/${id}/200/200`} className="w-full h-full grayscale contrast-150" alt={id}/>
            </div>
            <span className="text-yellow-600 font-bold mb-2">{id}</span>
            <div className="flex items-center gap-4">
              <button 
                 onPointerDown={(e) => { e.preventDefault(); changeLevel(id, -1); }}
                 className="w-12 h-12 flex items-center justify-center bg-red-900 text-white font-bold hover:bg-red-700 touch-manipulation active:scale-95 transition-transform"
              >-</button>
              <span className="text-2xl text-white w-8 text-center">{levels[id]}</span>
              <button 
                 onPointerDown={(e) => { e.preventDefault(); changeLevel(id, 1); }}
                 className="w-12 h-12 flex items-center justify-center bg-green-900 text-white font-bold hover:bg-green-700 touch-manipulation active:scale-95 transition-transform"
              >+</button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <button 
          onPointerDown={(e) => { e.preventDefault(); onBack(); }}
          className="px-8 py-4 border border-gray-500 text-gray-400 hover:text-white touch-manipulation active:bg-gray-800"
        >
          VOLTAR
        </button>
        <button 
          onPointerDown={(e) => { e.preventDefault(); onStart(levels); }}
          className="px-8 py-4 bg-yellow-900 text-yellow-100 font-bold hover:bg-yellow-700 border border-yellow-500 touch-manipulation active:scale-95"
        >
          PRONTO
        </button>
      </div>
    </div>
  );
};

export default CustomNight;