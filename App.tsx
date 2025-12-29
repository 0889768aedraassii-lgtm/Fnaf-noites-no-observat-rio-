import React, { useState } from 'react';
import { useGameEngine } from './hooks/useGameEngine';
import { GameScreen, NightConfig } from './types';
import MainMenu from './components/MainMenu';
import TitleScreen from './components/TitleScreen';
import GameInterface from './components/GameInterface';
import CameraSystem from './components/CameraSystem';
import Jumpscare from './components/Jumpscare';
import WinScreen from './components/WinScreen';
import CustomNight from './components/CustomNight';

const App: React.FC = () => {
  const { state, actions } = useGameEngine();

  return (
    <div className="w-screen h-screen bg-black overflow-hidden relative select-none">
      {/* Global CSS Effects */}
      <div className="scanline z-[60] pointer-events-none"></div>
      <div className="noise z-[55] pointer-events-none"></div>

      {state.screen === GameScreen.TITLE && (
        <TitleScreen onStart={actions.goToMenu} />
      )}

      <MenuWrapper 
        screen={state.screen} 
        onStart={actions.startGame} 
      />

      {state.screen === GameScreen.PLAYING && (
        <>
          <GameInterface state={state} actions={actions} />
          {state.isCameraOpen && <CameraSystem state={state} actions={actions} />}
        </>
      )}

      {state.screen === GameScreen.GAMEOVER && (
        <Jumpscare killerId={state.jumpscareId} onRetry={actions.goToMenu} />
      )}

      {state.screen === GameScreen.WIN && (
        <WinScreen onMenu={actions.goToMenu} />
      )}
    </div>
  );
};

// Helper component to handle menu switching
const MenuWrapper: React.FC<{ screen: GameScreen, onStart: (c: NightConfig) => void }> = ({ screen, onStart }) => {
  const [isCustom, setIsCustom] = React.useState(false);

  if (screen !== GameScreen.MENU) return null;

  if (isCustom) {
    return <CustomNight 
      onBack={() => setIsCustom(false)} 
      onStart={(levels) => onStart({ nightNumber: 7, aiLevels: levels, powerDrainMultiplier: 1.0 })} 
    />;
  }

  return <MainMenu onStart={onStart} onCustom={() => setIsCustom(true)} />;
};

export default App;