import React, { useEffect } from 'react';

interface Props {
  onStart: () => void;
}

const TitleScreen: React.FC<Props> = ({ onStart }) => {
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        onStart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStart]);

  return (
    <div 
      className="w-full h-full flex flex-col items-center justify-center relative z-50 bg-black cursor-pointer"
      onClick={onStart}
    >
      <div className="absolute inset-0 bg-[url('https://picsum.photos/id/1033/1920/1080')] bg-cover opacity-20 grayscale blur-sm"></div>
      
      <h1 className="text-7xl md:text-9xl font-['Creepster'] text-red-600 tracking-widest mb-4 drop-shadow-lg flicker animate-pulse text-center leading-none z-10 select-none">
        NOITES NO<br/>OBSERVATÓRIO
      </h1>

      <div className="mt-16 text-center animate-bounce z-10">
        <p className="text-2xl md:text-3xl text-white font-mono bg-black/50 px-4 py-2 rounded border border-gray-700">
          CLIQUE NA TELA ou PRESSIONE ESPAÇO
        </p>
      </div>

      <div className="absolute bottom-4 text-gray-500 text-xs font-mono uppercase tracking-widest">
        Um jogo de terror original
      </div>
    </div>
  );
};

export default TitleScreen;