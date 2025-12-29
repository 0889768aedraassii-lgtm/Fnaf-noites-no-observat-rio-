export enum GameScreen {
  TITLE = 'TITLE', // Nova tela inicial
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAMEOVER = 'GAMEOVER',
  WIN = 'WIN',
  CUSTOM_SETUP = 'CUSTOM_SETUP'
}

export enum AnimatronicId {
  SHADOW = 'The Shadow', // Left Door
  WIDOW = 'The Widow',   // Right Door
  CRAWLER = 'The Crawler', // Center Vent
  WATCHER = 'The Watcher', // Passive/Cam disabler
  JESTER = 'The Jester' // Hourly Event (Night 3+)
}

export enum CameraLocation {
  // CRITICAL FIX: Values must match the IDs used in state.currentCamera
  CAM_1A = 'CAM_1A',
  CAM_1B = 'CAM_1B',
  CAM_2A = 'CAM_2A',
  CAM_2B = 'CAM_2B',
  CAM_3A = 'CAM_3A',
  CAM_3B = 'CAM_3B',
  CAM_4 = 'CAM_4',
  CAM_5 = 'CAM_5', 
  OFFICE = 'OFFICE'
}

export interface AnimatronicState {
  id: AnimatronicId;
  location: CameraLocation | 'DOOR_LEFT' | 'DOOR_RIGHT' | 'VENT_OPENING' | 'OFFICE_CORNER';
  aiLevel: number; // 0-20
  movementCooldown: number;
  // Specific states
  patience?: number; // For Crawler at vent
  doorWaitTime?: number; // Time waiting at door before entering
}

export interface NightConfig {
  nightNumber: number;
  aiLevels: Record<AnimatronicId, number>;
  powerDrainMultiplier: number;
}