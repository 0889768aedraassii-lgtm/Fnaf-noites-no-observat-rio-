import React, { useEffect, useState } from 'react';
import { AnimatronicId } from '../types';

interface Props {
  killerId: AnimatronicId | null;
  onRetry: () => void;
}

const Jumpscare: React.FC<Props> = ({ killerId, onRetry }) => {
  const [showStatic, setShowStatic] = useState(false);

  useEffect(() => {
    // 1.5s of scream/face, then cut to static
    const timer = setTimeout(() => {
      setShowStatic(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Visual settings based on Killer
  const getMonsterConfig = (id: AnimatronicId | null) => {
    switch (id) {
      case AnimatronicId.SHADOW:
        return {
          bgClass: 'bg-black',
          imgFilter: 'grayscale(100%) contrast(200%) brightness(50%)',
          shakeClass: 'animate-violent-shake',
          overlay: (
             <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-32 h-32 bg-white rounded-full blur-xl animate-pulse absolute top-[30%] left-[20%]"></div>
                 <div className="w-32 h-32 bg-white rounded-full blur-xl animate-pulse absolute top-[30%] right-[20%]"></div>
                 <div className="w-full h-full border-[50px] border-black absolute inset-0 rounded-[50%]"></div>
             </div>
          )
        };
      case AnimatronicId.WIDOW:
        return {
          bgClass: 'bg-red-900',
          imgFilter: 'sepia(100%) saturate(500%) hue-rotate(-50deg) contrast(150%)',
          shakeClass: 'animate-fast-zoom',
          overlay: (
             <div className="absolute inset-0 flex items-center justify-center">
                 {/* Multi-eyes */}
                 <div className="absolute top-[20%] left-[30%] w-8 h-8 bg-red-500 rounded-full shadow-[0_0_20px_red] animate-ping"></div>
                 <div className="absolute top-[20%] right-[30%] w-8 h-8 bg-red-500 rounded-full shadow-[0_0_20px_red] animate-ping"></div>
                 <div className="absolute top-[40%] left-[40%] w-12 h-12 bg-red-500 rounded-full shadow-[0_0_20px_red] animate-ping" style={{animationDelay:'0.1s'}}></div>
                 <div className="absolute top-[40%] right-[40%] w-12 h-12 bg-red-500 rounded-full shadow-[0_0_20px_red] animate-ping" style={{animationDelay:'0.1s'}}></div>
             </div>
          )
        };
      case AnimatronicId.CRAWLER:
        return {
          bgClass: 'bg-yellow-900',
          imgFilter: 'sepia(100%) brightness(80%) contrast(150%)',
          shakeClass: 'animate-violent-shake',
          overlay: (
             <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                 <div className="absolute bottom-0 w-full h-[60%] bg-black rounded-t-[100%] border-t-8 border-yellow-600"></div>
                 <div className="absolute top-[20%] left-[25%] w-24 h-24 bg-yellow-400 rounded-full shadow-[0_0_50px_yellow]"></div>
                 <div className="absolute top-[20%] right-[25%] w-24 h-24 bg-yellow-400 rounded-full shadow-[0_0_50px_yellow]"></div>
                 {/* Teeth */}
                 <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-[80%] flex justify-around">
                     {[...Array(8)].map((_, i) => <div key={i} className="w-8 h-24 bg-white clip-triangle"></div>)}
                 </div>
             </div>
          )
        };
      case AnimatronicId.JESTER:
        return {
          bgClass: 'bg-purple-900',
          imgFilter: 'invert(100%) contrast(200%)',
          shakeClass: 'animate-spin-shake',
          overlay: (
             <div className="absolute inset-0 flex items-center justify-center">
                 <div className="absolute inset-0 bg-[repeating-conic-gradient(black_0deg_10deg,purple_10deg_20deg)] opacity-30 animate-spin"></div>
                 <div className="text-[200px] text-white font-bold animate-bounce">:)</div>
             </div>
          )
        };
      case AnimatronicId.WATCHER:
      default:
        return {
          bgClass: 'bg-gray-900',
          imgFilter: 'grayscale(100%) contrast(150%) brightness(150%) blur(2px)',
          shakeClass: 'animate-violent-shake',
          overlay: (
            <div className="absolute inset-0 bg-white/10 mix-blend-difference animate-pulse"></div>
          )
        };
    }
  };

  const config = getMonsterConfig(killerId);

  return (
    <div className="absolute inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden">
      <style>{`
        @keyframes violent-shake {
          0% { transform: translate(0, 0) scale(1.1) rotate(0deg); }
          25% { transform: translate(-15px, 15px) scale(1.2) rotate(-5deg); }
          50% { transform: translate(15px, -15px) scale(1.3) rotate(5deg); }
          75% { transform: translate(-15px, -15px) scale(1.2) rotate(-5deg); }
          100% { transform: translate(15px, 15px) scale(1.1) rotate(5deg); }
        }
        @keyframes fast-zoom {
          0% { transform: scale(0.5); opacity: 0; }
          10% { transform: scale(1.5); opacity: 1; }
          100% { transform: scale(1.1) translate(Math.random()*10px, Math.random()*10px); }
        }
        @keyframes spin-shake {
           0% { transform: rotate(0deg) scale(1); }
           50% { transform: rotate(10deg) scale(1.5); }
           100% { transform: rotate(-10deg) scale(1.2); }
        }
        .animate-violent-shake { animation: violent-shake 0.1s infinite; }
        .animate-fast-zoom { animation: fast-zoom 1.5s linear; }
        .animate-spin-shake { animation: spin-shake 0.1s infinite; }
        .clip-triangle { clip-path: polygon(50% 0%, 0% 100%, 100% 100%); }
      `}</style>

      {!showStatic ? (
        <div className={`relative w-full h-full overflow-hidden ${config.bgClass}`}>
           {/* Background Flashing */}
           <div className="absolute inset-0 bg-white animate-pulse opacity-20 z-10"></div>
           
           {/* The Container for the "Face" */}
           <div className={`w-full h-full relative ${config.shakeClass} z-20`}>
               
               {/* Base abstract texture from picsum, heavily filtered to look like skin/fur/metal */}
               <img 
                  src={`https://picsum.photos/seed/${killerId || 'death'}/1000/1000`} 
                  className="absolute inset-0 w-full h-full object-cover mix-blend-multiply"
                  style={{ filter: config.imgFilter }}
                  alt="Scare"
               />
               
               {/* Custom CSS Features (Eyes, Teeth, etc) */}
               {config.overlay}

               {/* Vignette */}
               <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_0%,black_90%)]"></div>
           </div>
        </div>
      ) : (
        /* Static Game Over Screen */
        <div className="text-center space-y-8 z-10 w-full h-full flex flex-col items-center justify-center bg-black relative">
           <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E')]"></div>
           
           <h1 className="text-6xl md:text-8xl text-red-600 font-['Creepster'] flicker drop-shadow-[0_0_10px_red]">GAME OVER</h1>
           
           <div className="border border-red-900 p-8 bg-black/80 backdrop-blur">
             <p className="text-gray-400 font-mono text-xl mb-4">Sinal perdido...</p>
             <p className="text-red-500 font-bold uppercase tracking-[0.5em] text-sm animate-pulse">
               {killerId || 'DESCONHECIDO'}
             </p>
           </div>
           
           <button 
             onClick={onRetry}
             className="mt-12 px-10 py-4 bg-white text-black font-bold font-mono hover:bg-red-600 hover:text-white transition-all uppercase tracking-widest active:scale-95 z-50"
           >
             TENTAR NOVAMENTE
           </button>
        </div>
      )}
    </div>
  );
};

export default Jumpscare;