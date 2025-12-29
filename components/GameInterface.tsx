import React from 'react';
import { AnimatronicState, CameraLocation, AnimatronicId } from '../types';
import { TOTAL_HOURS, REAL_SECONDS_PER_GAME_HOUR } from '../constants';

interface Props {
  state: any;
  actions: any;
}

const GameInterface: React.FC<Props> = ({ state, actions }) => {
  // Determine visuals based on state
  const leftClosed = state.isLeftDoorClosed;
  const rightClosed = state.isRightDoorClosed;
  // Flashlight effective state (considering flicker)
  const lightEffective = state.isFlashlightOn && !state.flashlightFlicker;

  // Check for animatronics at doors/vents for visuals
  const shadowAtLeft = state.animatronics.find((a: AnimatronicState) => a.location === 'DOOR_LEFT');
  const widowAtRight = state.animatronics.find((a: AnimatronicState) => a.location === 'DOOR_RIGHT');
  const crawlerInVent = state.animatronics.find((a: AnimatronicState) => a.location === 'VENT_OPENING');
  const watcherInOffice = state.animatronics.find((a: AnimatronicState) => a.location === 'OFFICE_CORNER');

  // Usage bars
  const renderUsage = () => {
    const bars = [];
    for(let i=0; i<5; i++) {
      bars.push(
        <div key={i} className={`w-4 h-6 border ${i < state.usageBars ? 'bg-green-500' : 'bg-transparent'} ${i < state.usageBars && i > 2 ? 'bg-red-500 animate-pulse' : ''} border-gray-600 mx-0.5`}></div>
      );
    }
    return bars;
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-black select-none touch-none font-mono">
      
      {/* 3D Simulation Layout */}
      <div className="absolute inset-0 flex">
        
        {/* --- LEFT DOOR AREA --- */}
        <div className="w-1/4 h-full relative border-r-8 border-gray-900 bg-[#000]">
          
          {/* Background is BLACK by default. Light reveals texture */}
          <div className={`absolute inset-0 bg-[#1a1a1a] transition-opacity duration-75 ${state.isLeftLightOn ? 'opacity-100' : 'opacity-0'}`}>
              <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,#1a1a1a,#1a1a1a_10px,#111_10px,#111_12px)] opacity-50"></div>
              {/* Spotlight Effect */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_50%,_rgba(255,255,200,0.1)_0%,_transparent_60%)]"></div>
          </div>
          
          {/* Doorway Frame */}
          <div className="absolute top-[10%] bottom-[10%] right-0 w-full bg-transparent shadow-[inset_10px_0_20px_black] pointer-events-none z-20"></div>
          
          {/* Metal Door Shutter */}
          <div className={`absolute top-[10%] bottom-[10%] right-0 w-full bg-[linear-gradient(90deg,#333,#555,#333)] border-l-4 border-yellow-900 transition-transform duration-200 ease-linear origin-top z-10 ${leftClosed ? 'translate-y-0' : '-translate-y-full'}`}>
             <div className="absolute bottom-10 w-full h-20 bg-[repeating-linear-gradient(45deg,yellow,yellow_20px,black_20px,black_40px)] opacity-80"></div>
          </div>
          
          {/* The Shadow at Door (Visible ONLY if Light ON and Door OPEN) */}
          {!leftClosed && state.isLeftLightOn && shadowAtLeft && (
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0">
                <div className="w-32 h-64 bg-black rounded-t-full relative animate-pulse shadow-xl">
                   <div className="absolute top-12 left-4 w-4 h-4 bg-white rounded-full shadow-[0_0_20px_white]"></div>
                   <div className="absolute top-12 right-4 w-4 h-4 bg-white rounded-full shadow-[0_0_20px_white]"></div>
                   <div className="absolute top-32 -right-8 w-10 h-24 bg-black rotate-12 rounded-full"></div>
                </div>
             </div>
          )}

          {/* Controls */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-30">
             <button 
               onPointerDown={(e) => { e.preventDefault(); actions.toggleLeftDoor(); }}
               className={`w-16 h-16 md:w-20 md:h-20 rounded-lg border-b-8 shadow-lg flex items-center justify-center font-bold text-white transition-all active:translate-y-2 active:border-b-0 touch-manipulation text-xs md:text-base ${leftClosed ? 'bg-red-700 border-red-900 shadow-red-900/50' : 'bg-green-700 border-green-900 shadow-green-900/50'}`}
             >
               PORTA
             </button>
             <button 
                onPointerDown={(e) => { e.preventDefault(); actions.setLeftLight(true); }}
                onPointerUp={(e) => { e.preventDefault(); actions.setLeftLight(false); }}
                onPointerLeave={(e) => { e.preventDefault(); actions.setLeftLight(false); }}
                className={`w-14 h-14 md:w-16 md:h-16 rounded-full border-4 border-gray-600 flex items-center justify-center text-[10px] md:text-xs font-mono text-yellow-500 shadow-[0_0_10px_rgba(255,255,0,0.1)] transition-colors ${state.isLeftLightOn ? 'bg-white text-black shadow-[0_0_25px_white]' : 'bg-gray-800'}`}
             >
               LUZ
             </button>
          </div>
        </div>

        {/* --- CENTER AREA (The Breach / Office) --- */}
        <div className="w-2/4 h-full relative bg-black overflow-hidden">
          
          {/* FLASHLIGHT CONE */}
          <div className={`absolute inset-0 transition-opacity duration-75 ${lightEffective ? 'opacity-100' : 'opacity-10'}`}>
              
              <div className="absolute inset-0 bg-[#222]">
                 <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMjIyIi8+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMzMzMiLz4KPC9zdmc+')] opacity-20"></div>
                 <div className="absolute top-20 left-10 w-64 h-64 bg-black rounded-full blur-3xl opacity-40"></div>
              </div>

              {/* The VENTILATION SHAFT */}
              <div className="absolute top-[20%] left-[20%] right-[20%] bottom-[45%]">
                  <div className="w-full h-full bg-[#111] border-[10px] border-gray-700 shadow-lg relative overflow-hidden">
                     <div className="absolute inset-2 bg-black shadow-[inset_0_0_50px_black]">
                        <div className="w-full h-full border-4 border-[#222] opacity-50 transform scale-90"></div>
                        <div className="w-full h-full border-4 border-[#222] opacity-30 transform scale-75"></div>
                        <div className="w-full h-full border-4 border-[#222] opacity-10 transform scale-50"></div>
                     </div>
                     <div className="absolute bottom-[-20px] left-0 w-full h-12 bg-transparent border-t-8 border-gray-600 rotate-3 transform skew-x-12"></div>
                     
                     {/* CRAWLER MONSTER */}
                     {crawlerInVent && (
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-40 h-32 animate-bounce z-20" style={{ animationDuration: '0.1s' }}>
                           <div className="w-full h-full bg-[#151515] rounded-t-[3rem] border-t border-gray-800 shadow-2xl relative">
                              <div className="absolute top-10 left-8 w-8 h-8 bg-yellow-500 rounded-full shadow-[0_0_30px_yellow] border-2 border-yellow-200">
                                <div className="w-1 h-4 bg-black mx-auto mt-2 opacity-50"></div>
                              </div>
                              <div className="absolute top-10 right-8 w-8 h-8 bg-yellow-500 rounded-full shadow-[0_0_30px_yellow] border-2 border-yellow-200">
                                <div className="w-1 h-4 bg-black mx-auto mt-2 opacity-50"></div>
                              </div>
                              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-32 flex justify-center gap-1">
                                 <div className="w-4 h-10 bg-gray-300 rounded-b-lg"></div>
                                 <div className="w-4 h-12 bg-gray-300 rounded-b-lg"></div>
                                 <div className="w-4 h-12 bg-gray-300 rounded-b-lg"></div>
                                 <div className="w-4 h-10 bg-gray-300 rounded-b-lg"></div>
                              </div>
                           </div>
                        </div>
                     )}
                  </div>
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-yellow-900/50 text-yellow-500 text-[10px] px-2 border border-yellow-800">
                    VENTILAÇÃO PRINCIPAL
                  </div>
              </div>

              {/* WATCHER Hallucination (Only visible if Light is ON or random flash) */}
              {watcherInOffice && (
                <div className="absolute top-10 left-10 w-32 h-64 z-20 animate-pulse opacity-80 mix-blend-overlay">
                   <div className="w-full h-full bg-black rounded-full blur-sm transform skew-x-12"></div>
                   <div className="absolute top-10 left-8 w-2 h-2 bg-white rounded-full shadow-[0_0_15px_white]"></div>
                   <div className="absolute top-10 right-8 w-2 h-2 bg-white rounded-full shadow-[0_0_15px_white]"></div>
                </div>
              )}

              {/* The Desk */}
              <div className="absolute bottom-0 w-full h-[35%] bg-[#1a1c20] border-t-8 border-[#2a2c30] shadow-[0_-20px_50px_rgba(0,0,0,0.8)]">
                  <div className="absolute top-4 left-10 w-20 h-2 bg-white/10 rotate-3"></div>
                  <div className="absolute top-8 right-20 w-32 h-32 bg-black/40 rounded-lg transform skew-x-12 border border-gray-700"></div>
                  <div className="absolute top-[-30px] left-20 w-10 h-12 bg-gray-700 rounded-lg border-2 border-gray-600"></div>
              </div>

              {/* Flashlight Beam Overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_transparent_15%,_rgba(0,0,0,0.9)_70%)] pointer-events-none mix-blend-multiply"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.1)_0%,_transparent_50%)] pointer-events-none mix-blend-soft-light"></div>
          </div>
          
          {/* Always visible elements (dimly) - REVERTED TO DARK */}
          {!lightEffective && (
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
               <div className="w-1/2 h-1/2 border border-gray-800 rounded-[50%]"></div>
               {/* Minimal Office Outline */}
               <div className="absolute bottom-0 w-full h-[1px] bg-gray-800"></div>
               <div className="absolute left-10 top-1/2 h-20 w-[1px] bg-gray-800"></div>
               <div className="absolute right-10 top-1/2 h-20 w-[1px] bg-gray-800"></div>
            </div>
          )}

          {/* Touch Area for Flashlight */}
          <div className="absolute bottom-32 w-full flex justify-center z-30 pointer-events-none">
             <span className={`text-xs uppercase tracking-[0.3em] px-3 py-1 bg-black/50 border border-gray-700 rounded transition-opacity ${lightEffective ? 'opacity-0' : 'opacity-100 animate-pulse text-gray-500'}`}>
                Toque para Iluminar
             </span>
          </div>

          <div className="absolute bottom-10 left-4 w-24 h-32 opacity-40 md:opacity-60 pointer-events-none">
              <div className="w-24 h-24 border-4 border-[#333] rounded-full flex items-center justify-center relative bg-[#111]">
                 <div className="w-20 h-4 bg-[#222] absolute animate-spin" style={{ animationDuration: '0.2s' }}></div>
                 <div className="w-4 h-20 bg-[#222] absolute animate-spin" style={{ animationDuration: '0.2s' }}></div>
                 <div className="w-4 h-4 bg-[#444] rounded-full z-10"></div>
              </div>
              <div className="w-4 h-10 bg-[#222] mx-auto"></div>
              <div className="w-16 h-4 bg-[#222] mx-auto rounded-t-lg"></div>
          </div>
        </div>

        {/* --- RIGHT DOOR AREA --- */}
        <div className="w-1/4 h-full relative border-l-8 border-gray-900 bg-[#000]">
           <div className={`absolute inset-0 bg-[#1a1a1a] transition-opacity duration-75 ${state.isRightLightOn ? 'opacity-100' : 'opacity-0'}`}>
              <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,#1a1a1a,#1a1a1a_10px,#111_10px,#111_12px)] opacity-50"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_50%,_rgba(255,255,200,0.1)_0%,_transparent_60%)]"></div>
          </div>
          
          <div className="absolute top-[10%] bottom-[10%] left-0 w-full bg-transparent shadow-[inset_-10px_0_20px_black] pointer-events-none z-20"></div>
          
          <div className={`absolute top-[10%] bottom-[10%] left-0 w-full bg-[linear-gradient(90deg,#333,#555,#333)] border-r-4 border-yellow-900 transition-transform duration-200 ease-linear origin-top z-10 ${rightClosed ? 'translate-y-0' : '-translate-y-full'}`}>
            <div className="absolute bottom-10 w-full h-20 bg-[repeating-linear-gradient(-45deg,yellow,yellow_20px,black_20px,black_40px)] opacity-80"></div>
          </div>
          
          {!rightClosed && state.isRightLightOn && widowAtRight && (
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0">
                <div className="w-12 h-64 bg-black relative animate-shake">
                    <div className="absolute top-10 -left-16 w-32 h-2 bg-black rotate-45"></div>
                    <div className="absolute top-10 -right-16 w-32 h-2 bg-black -rotate-45"></div>
                    <div className="absolute top-20 -left-12 w-24 h-2 bg-black rotate-12"></div>
                    <div className="absolute top-20 -right-12 w-24 h-2 bg-black -rotate-12"></div>
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-16 h-20 bg-black rounded-b-full"></div>
                    <div className="absolute -top-4 left-2 w-2 h-2 bg-red-600 rounded-full shadow-[0_0_10px_red] animate-ping"></div>
                    <div className="absolute -top-4 right-2 w-2 h-2 bg-red-600 rounded-full shadow-[0_0_10px_red] animate-ping"></div>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-600 rounded-full shadow-[0_0_15px_red]"></div>
                </div>
             </div>
          )}

          <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-30">
             <button 
               onPointerDown={(e) => { e.preventDefault(); actions.toggleRightDoor(); }}
               className={`w-16 h-16 md:w-20 md:h-20 rounded-lg border-b-8 shadow-lg flex items-center justify-center font-bold text-white transition-all active:translate-y-2 active:border-b-0 touch-manipulation text-xs md:text-base ${rightClosed ? 'bg-red-700 border-red-900 shadow-red-900/50' : 'bg-green-700 border-green-900 shadow-green-900/50'}`}
             >
               PORTA
             </button>
             <button 
                onPointerDown={(e) => { e.preventDefault(); actions.setRightLight(true); }}
                onPointerUp={(e) => { e.preventDefault(); actions.setRightLight(false); }}
                onPointerLeave={(e) => { e.preventDefault(); actions.setRightLight(false); }}
                className={`w-14 h-14 md:w-16 md:h-16 rounded-full border-4 border-gray-600 flex items-center justify-center text-[10px] md:text-xs font-mono text-yellow-500 shadow-[0_0_10px_rgba(255,255,0,0.1)] transition-colors ${state.isRightLightOn ? 'bg-white text-black shadow-[0_0_25px_white]' : 'bg-gray-800'}`}
             >
               LUZ
             </button>
          </div>
        </div>
      </div>

      {/* --- HUD --- */}
      <div className="absolute bottom-4 left-4 text-white z-20 font-mono pointer-events-none bg-black/50 p-2 rounded border border-gray-800">
        <div className={`text-xl md:text-2xl font-bold flex items-center gap-2 ${state.power < 20 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
           <span className="material-icons text-yellow-500 text-sm">⚡</span>
           {Math.floor(state.power)}%
        </div>
        <div className="flex mt-1 gap-1 h-3 items-end">
          {renderUsage()}
        </div>
      </div>

      <div className="absolute top-4 right-4 text-white z-20 text-right pointer-events-none">
        <div className="text-4xl md:text-5xl font-bold font-mono tracking-widest">{state.timeHour === 0 ? '12' : state.timeHour} AM</div>
        <div className="text-xs text-gray-400 uppercase tracking-[0.2em] mt-1">Noite {state.night}</div>
        
        {/* Progress Bar (Time) */}
        <div className="mt-2 w-32 h-2 bg-gray-900 border border-gray-700 relative overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full bg-white transition-all duration-1000 ease-linear"
            style={{ width: `${(state.elapsedSeconds / (TOTAL_HOURS * REAL_SECONDS_PER_GAME_HOUR)) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* --- INTERACTION ZONES --- */}
      
      {/* Flashlight Touch Zone (Center Screen) */}
      <button 
        className="absolute top-[20%] left-[25%] right-[25%] bottom-[30%] z-10 opacity-0 cursor-crosshair touch-none"
        onPointerDown={(e) => { e.preventDefault(); actions.toggleFlashlight(); }}
        onPointerUp={(e) => { e.preventDefault(); actions.toggleFlashlight(); }}
        onPointerLeave={(e) => { 
          if(state.isFlashlightOn) actions.toggleFlashlight(); 
        }}
      >
        Flashlight Area
      </button>

      {/* Camera Toggle Button */}
      <div className="absolute bottom-0 right-1/4 left-1/4 flex justify-center z-40">
        <button 
           onClick={actions.toggleCamera}
           className="w-full max-w-sm bg-[#0a0a0a] border-t border-x border-gray-700 text-gray-400 py-1 px-6 rounded-t-lg hover:bg-gray-800 hover:text-white active:bg-black transition-all transform active:scale-95 shadow-lg flex flex-col items-center group"
        >
           <div className="h-0.5 w-12 bg-gray-600 rounded-full mb-1 group-hover:bg-green-500"></div>
           <span className="font-bold tracking-[0.2em] text-lg font-vt323">ABRIR MONITOR</span>
        </button>
      </div>

      {/* Global Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle,transparent_50%,black_100%)] z-10"></div>
    </div>
  );
};

export default GameInterface;