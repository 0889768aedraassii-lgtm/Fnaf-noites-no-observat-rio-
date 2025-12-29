import React from 'react';

const WinScreen: React.FC<{ onMenu: () => void }> = ({ onMenu }) => {
  return (
    <div className="absolute inset-0 z-[100] bg-black flex flex-col items-center justify-center text-center">
      <h1 className="text-8xl font-bold text-white font-mono animate-bounce mb-4">6:00 AM</h1>
      <p className="text-2xl text-yellow-500 font-mono mb-12">TURNO ENCERRADO COM SUCESSO</p>
      
      <div className="flex gap-2 mb-8">
        <div className="w-4 h-4 rounded-full bg-red-500 animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="w-4 h-4 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-4 h-4 rounded-full bg-yellow-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>

      <button 
        onClick={onMenu}
        className="px-8 py-3 border-2 border-white text-white font-mono hover:bg-white hover:text-black transition-colors"
      >
        VOLTAR AO MENU
      </button>
    </div>
  );
};

export default WinScreen;