import React, { useState, useEffect } from 'react';
import { CAMERAS } from '../constants';
import { AnimatronicState, CameraLocation, AnimatronicId } from '../types';
import { useGenAIImages } from '../hooks/useGenAIImages';

interface Props {
  state: any;
  actions: any;
}

const CameraSystem: React.FC<Props> = ({ state, actions }) => {
  const [staticNoise, setStaticNoise] = useState(0.2);
  const [cameraOffline, setCameraOffline] = useState(false);
  const [interference, setInterference] = useState(0);
  
  // GenAI Image Hook
  const { images, loading, generateImage } = useGenAIImages();

  // Trigger generation when camera changes
  useEffect(() => {
    if (state.currentCamera) {
      generateImage(state.currentCamera);
    }
  }, [state.currentCamera, generateImage]);

  // Random static pulses and camera failure simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setStaticNoise(Math.random() * 0.15 + 0.1);
      
      // Random glitch lines
      if (Math.random() > 0.7) setInterference(Math.random() * 10);
      else setInterference(0);

      // Random camera failure (rare)
      if (Math.random() > 0.98) {
          setCameraOffline(true);
          setTimeout(() => setCameraOffline(false), 2000);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const animatronicsHere = state.animatronics.filter((a: AnimatronicState) => a.location === state.currentCamera);
  
  // Is Watcher causing interference here?
  const watcherActive = state.animatronics.find((a: AnimatronicState) => a.id === AnimatronicId.WATCHER && a.location !== 'OFFICE_CORNER');
  
  // --- ROOM RENDERING (GenAI Background + CSS Fallback) ---
  const renderRoomBackground = (id: string) => {
    const commonRoomStyle = "absolute inset-0 bg-slate-900 overflow-hidden sepia-[0.3] hue-rotate-180 contrast-125 brightness-75";
    const bgImage = images[id];
    const isLoading = loading[id];

    return (
      <div className={commonRoomStyle}>
        {/* Camada 1: Fallback Geométrico (Sempre renderizado primeiro para não ficar tela preta) */}
        {renderCSSFallback(id)}

        {/* Camada 2: Imagem GenAI (Fade in quando pronta) */}
        {bgImage && (
          <img 
            src={bgImage} 
            alt="Camera Feed" 
            className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity filter contrast-125 grayscale animate-pulse"
            style={{ animationDuration: '3s' }}
          />
        )}

        {/* Camada 3: Loading Indicator (Discreto no canto) */}
        {isLoading && !bgImage && (
           <div className="absolute top-10 left-4 bg-black/50 px-2 py-1 flex items-center gap-2 border border-green-900/50">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
             <span className="text-[10px] text-green-500 font-mono tracking-widest">RECEBENDO DADOS DE VÍDEO...</span>
           </div>
        )}
      </div>
    );
  };

  const renderCSSFallback = (id: string) => {
    // Basic geometric shapes to represent rooms if AI is loading/failed
    const wallColor = "bg-[#111]";
    const floorColor = "bg-[#0a0a0a]";
    
    switch(id) {
      case 'CAM_1A': // Palco
        return (
          <div className="absolute inset-0 bg-black">
             <div className="absolute top-0 w-full h-[80%] bg-[#1a1a1a]"></div> {/* Cortinas Fundo */}
             <div className="absolute bottom-0 w-full h-[20%] bg-[repeating-linear-gradient(90deg,black,black_20px,#111_20px,#111_40px)]"></div> {/* Chão */}
             <div className="absolute top-0 left-0 w-[10%] h-[80%] bg-purple-900/20 border-r border-black"></div>
             <div className="absolute top-0 right-0 w-[10%] h-[80%] bg-purple-900/20 border-l border-black"></div>
          </div>
        );
      case 'CAM_1B': // Jantar
        return (
          <div className="absolute inset-0 bg-black">
             <div className="absolute bottom-0 w-full h-[30%] bg-[#111]"></div>
             {/* Tables */}
             <div className="absolute bottom-10 left-10 w-20 h-10 bg-[#222] rounded-t-lg skew-x-12"></div>
             <div className="absolute bottom-20 right-20 w-20 h-10 bg-[#222] rounded-t-lg -skew-x-12"></div>
             <div className="absolute bottom-32 left-1/3 w-20 h-10 bg-[#222] rounded-t-lg"></div>
          </div>
        );
      case 'CAM_5': // Cozinha (Audio only usually, but visual static here)
        return <div className="absolute inset-0 bg-[#050505]"><div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#222_10px,#222_11px)]"></div></div>;
      case 'CAM_4': // Ventilação
         return (
           <div className="absolute inset-0 bg-[#080808] flex items-center justify-center">
              <div className="w-[80%] h-[80%] border-4 border-[#222] bg-[#111] relative overflow-hidden">
                 <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_20px,rgba(0,0,0,0.5)_20px,rgba(0,0,0,0.5)_22px)]"></div>
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full border-4 border-[#333] animate-spin" style={{ animationDuration: '3s' }}>
                       <div className="w-full h-2 bg-[#333] absolute top-1/2 -translate-y-1/2"></div>
                       <div className="h-full w-2 bg-[#333] absolute left-1/2 -translate-x-1/2"></div>
                    </div>
                 </div>
              </div>
           </div>
         );
      default: // Corredores
        return (
          <div className="absolute inset-0 bg-black perspective-[500px]">
             <div className="absolute inset-0 bg-gradient-to-b from-black via-[#111] to-[#050505]"></div>
             <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-[#111] transform scale-x-150 origin-bottom"></div>
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-yellow-900/20 rounded-full blur-xl"></div>
          </div>
        );
    }
  };

  // --- MONSTER RENDERING (Overlays) ---
  const renderAnimatronic = (anim: AnimatronicState, positionIndex: number = 0) => {
    if (anim.id === AnimatronicId.WATCHER) return null;

    const isStage = state.currentCamera === 'CAM_1A';
    let containerStyle: React.CSSProperties = { zIndex: 20 + positionIndex };
    
    if (isStage) {
       if (anim.id === AnimatronicId.SHADOW) containerStyle = { ...containerStyle, left: '0%' };
       else if (anim.id === AnimatronicId.WIDOW) containerStyle = { ...containerStyle, left: '30%' };
    }

    // Visuals are silhouettes/glowing eyes to blend with the realistic AI Background
    switch (anim.id) {
      case AnimatronicId.SHADOW:
        return (
          <div className="absolute inset-0 flex items-end justify-center pb-10 pointer-events-none mix-blend-multiply" style={containerStyle}>
            <div className="relative w-64 h-[28rem] opacity-90">
               <div className="absolute inset-0 bg-[#050505] rounded-t-[50px] shadow-2xl blur-sm"></div>
               {/* Eyes */}
               <div className="absolute top-16 left-8 w-2 h-2 bg-white rounded-full animate-pulse shadow-[0_0_15px_white]"></div>
               <div className="absolute top-16 right-8 w-2 h-2 bg-white rounded-full animate-pulse shadow-[0_0_15px_white]"></div>
            </div>
          </div>
        );
      
      case AnimatronicId.WIDOW:
        return (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={containerStyle}>
             <div className="relative w-full h-full opacity-80 filter blur-[1px]">
                <div className="absolute top-0 right-0 w-2 h-[60%] bg-black rotate-12"></div>
                <div className="absolute top-1/4 right-1/4 w-32 h-64 bg-[#0a0a0a] rounded-b-full flex flex-col items-center pt-10">
                   <div className="w-24 h-32 bg-black rounded-full relative">
                      <div className="absolute top-10 left-4 w-1.5 h-1.5 bg-red-600 rounded-full animate-ping"></div>
                      <div className="absolute top-10 right-4 w-1.5 h-1.5 bg-red-600 rounded-full animate-ping"></div>
                   </div>
                </div>
             </div>
          </div>
        );

      case AnimatronicId.CRAWLER:
        return (
          <div className="absolute bottom-0 w-full h-1/2 flex justify-center items-end pointer-events-none" style={containerStyle}>
             <div className="w-[80%] h-48 bg-[#050505] rounded-t-full relative border-t border-slate-900 blur-sm">
                <div className="absolute top-10 left-[20%] w-4 h-4 bg-yellow-600 rounded-full animate-bounce shadow-[0_0_10px_yellow]"></div>
                <div className="absolute top-10 right-[20%] w-4 h-4 bg-yellow-600 rounded-full animate-bounce shadow-[0_0_10px_yellow]"></div>
             </div>
          </div>
        );
        
      default: return null;
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-black flex flex-col font-mono select-none">
      {/* Main Feed */}
      <div className="relative flex-grow border-b-4 border-gray-800 overflow-hidden bg-black">
        
        {/* Rec Indicator */}
        <div className="absolute top-4 left-4 z-40 flex items-center gap-2">
          <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
          <span className="text-white text-lg tracking-widest font-bold font-vt323 opacity-80">REC • LIVE</span>
        </div>
        
        {/* Camera Label */}
        <div className="absolute top-4 right-4 z-40 text-green-500 text-xl font-vt323 tracking-widest bg-black/50 px-2">
          {CAMERAS.find(c => c.id === state.currentCamera)?.label}
        </div>

        {/* The Viewport */}
        {!cameraOffline && state.currentCamera !== 'CAM_5' ? (
           <div className="relative w-full h-full overflow-hidden">
             
             {renderRoomBackground(state.currentCamera)}

             {animatronicsHere.map((anim: AnimatronicState, idx: number) => (
                <React.Fragment key={idx}>
                  {renderAnimatronic(anim, idx)}
                </React.Fragment>
             ))}

             {/* Interference Lines */}
             <div className="absolute inset-0 pointer-events-none opacity-20 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,#000_3px)]" style={{ transform: `translateY(${interference}px)` }}></div>

           </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#050505]">
            <div className="text-6xl text-white font-bold animate-pulse">NO SIGNAL</div>
            <div className="text-gray-500 mt-4 text-xl">CONNECTION LOST</div>
            <div className="w-64 h-2 bg-gray-800 mt-8 relative overflow-hidden">
               <div className="absolute top-0 left-0 h-full w-1/3 bg-gray-600 animate-[ping_1s_infinite]"></div>
            </div>
          </div>
        )}

        {/* Static Overlay (TV Noise) - Intensified if Watcher is active generally */}
        <div 
          className="absolute inset-0 pointer-events-none bg-noise mix-blend-hard-light z-30"
          style={{ opacity: watcherActive ? staticNoise * 2 : staticNoise }}
        ></div>
        
        {/* Vignette */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle,transparent_30%,black_100%)] z-20"></div>
      </div>

      {/* Map UI */}
      <div className="h-1/3 bg-[#0a0a0a] border-t-2 border-slate-700 p-2 relative">
        <div className="absolute top-[-30px] left-1/2 transform -translate-x-1/2 bg-[#0a0a0a] px-8 py-1 border-t border-x border-slate-600 text-slate-300 font-bold cursor-pointer hover:bg-slate-800 transition-colors uppercase text-sm tracking-widest"
             onClick={actions.toggleCamera}
        >
          Desligar Monitor
        </div>

        <div className="w-full h-full max-w-3xl mx-auto grid grid-cols-4 gap-2 p-2">
            {CAMERAS.map(cam => (
              <button
                key={cam.id}
                onClick={() => actions.switchCamera(cam.id)}
                className={`relative border flex flex-col items-center justify-center py-1 transition-all active:scale-95
                  ${state.currentCamera === cam.id 
                    ? 'bg-slate-800 border-green-500 text-green-400 shadow-[0_0_10px_rgba(0,255,0,0.2)]' 
                    : 'bg-black border-slate-800 text-slate-600 hover:bg-slate-900 hover:text-slate-400'}`
                }
              >
                <span className="font-bold text-lg md:text-xl font-vt323">{cam.id.replace('CAM_', '')}</span>
                {state.currentCamera === cam.id && (
                  <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></div>
                )}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default CameraSystem;