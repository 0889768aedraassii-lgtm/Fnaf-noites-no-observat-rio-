import React, { useEffect, useState, useCallback } from 'react';
import { NIGHTS } from '../constants';
import { GameScreen, NightConfig } from '../types';

interface Props {
  onStart: (config: NightConfig) => void;
  onCustom: () => void;
}

const MainMenu: React.FC<Props> = ({ onStart, onCustom }) => {
  const [unlockedNight, setUnlockedNight] = useState(1);
  const [selectedNight, setSelectedNight] = useState(1);

  useEffect(() => {
    const saved = localStorage.getItem('fnaf_clone_night');
    if (saved) {
      const level = parseInt(saved);
      setUnlockedNight(level);
      // Se a noite selecionada estiver bloqueada, volta para a 1
      if (selectedNight > level) setSelectedNight(1);
    }
  }, []);

  const handleStart = useCallback(() => {
    const config = NIGHTS.find(n => n.nightNumber === selectedNight);
    if (config) onStart(config);
  }, [selectedNight, onStart]);

  // Keyboard support for Night Selection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Numbers 1-6
      const num = parseInt(e.key);
      if (!isNaN(num) && num >= 1 && num <= 6) {
        if (num <= unlockedNight) {
          setSelectedNight(num);
        }
      }
      if (e.code === 'Enter' || e.code === 'Space') {
        handleStart();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [unlockedNight, handleStart]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative z-20 touch-none select-none">
      {/* Background Image - Absolute */}
      <div className="absolute inset-0 bg-[url('https://picsum.photos/id/1033/1920/1080')] bg-cover opacity-30 grayscale blur-sm z-0"></div>
      
      <div className="relative z-30 flex flex-col items-center w-full max-w-md">
        <h2 className="text-4xl md:text-5xl font-mono text-gray-300 tracking-widest mb-8 drop-shadow-lg text-center bg-black/50 px-4 py-2 border-b-2 border-red-800">
          SELEÇÃO DE TURNO
        </h2>

        <div className="flex flex-col gap-6 bg-black/80 p-8 border border-red-900 shadow-2xl shadow-red-900/20 w-full">
          <div className="space-y-4">
            <p className="text-gray-400 text-xl font-bold text-center pointer-events-none">SELECIONAR NOITE:</p>
            <div className="flex gap-3 justify-center flex-wrap">
              {[1, 2, 3, 4, 5].map(n => {
                const isLocked = n > unlockedNight;
                return (
                  <button
                    key={n}
                    disabled={isLocked}
                    onPointerDown={(e) => { e.preventDefault(); if (!isLocked) setSelectedNight(n); }}
                    className={`w-14 h-14 flex items-center justify-center border transition-all touch-manipulation ${
                      selectedNight === n 
                        ? 'bg-red-800 text-white border-red-500 shadow-[0_0_15px_red] scale-110 z-10 font-bold text-3xl' 
                        : isLocked 
                          ? 'bg-black/50 text-gray-700 border-gray-800 cursor-not-allowed opacity-70'
                          : 'bg-gray-800 text-gray-400 border-gray-600 hover:bg-gray-700 hover:text-white active:scale-95 font-bold text-3xl'
                    }`}
                  >
                    {isLocked ? <span className="text-lg">🔒</span> : n}
                  </button>
                );
              })}
            </div>
          </div>

          {unlockedNight >= 6 && (
            <button 
              onPointerDown={(e) => { e.preventDefault(); setSelectedNight(6); }}
              className={`text-xl font-bold border py-3 touch-manipulation transition-all ${
                selectedNight === 6 
                  ? 'bg-purple-900 text-white border-purple-500 shadow-[0_0_15px_purple]' 
                  : 'bg-gray-900 text-purple-700 border-purple-900 hover:bg-gray-800'
              }`}
            >
              NOITE EXTRA (6)
            </button>
          )}

          <button 
            onPointerDown={(e) => { e.preventDefault(); handleStart(); }}
            className="mt-2 py-6 px-8 bg-red-900 text-white text-4xl font-bold border-4 border-red-600 hover:bg-red-700 transition-all uppercase tracking-widest active:scale-95 shadow-[0_0_20px_rgba(255,0,0,0.4)] touch-manipulation"
          >
            INICIAR (ENTER)
          </button>

          {/* Custom Night só aparece se desbloquear a noite 6 (zerar o jogo) */}
          {unlockedNight >= 6 ? (
            <button 
              onPointerDown={(e) => { e.preventDefault(); onCustom(); }}
              className="py-4 text-gray-500 hover:text-white text-xl border border-transparent hover:border-gray-500 active:bg-gray-800 touch-manipulation transition-colors"
            >
              CUSTOM NIGHT
            </button>
          ) : (
            <div className="py-4 text-gray-800 text-xl text-center font-mono cursor-default select-none border border-transparent">
              ?????
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-4 text-gray-600 text-sm text-center px-4 z-30 pointer-events-none font-mono">
        <p>PC CONTROLS:</p>
        <p>[A] Porta Esq | [D] Porta Dir | [Q] Luz Esq | [E] Luz Dir</p>
        <p>[F/Espaço] Lanterna | [S] Câmera | [1-8] Câmeras</p>
      </div>
    </div>
  );
};

export default MainMenu;