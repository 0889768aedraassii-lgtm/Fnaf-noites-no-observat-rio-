import { AnimatronicId, NightConfig } from "./types";

export const TOTAL_HOURS = 6; // 12am to 6am
export const REAL_SECONDS_PER_GAME_HOUR = 20; // 20 seconds real time = 1 hour game time (MUITO Rápido)
export const MAX_POWER = 100;

// Power usage per second (Reduzido para balanceamento)
export const USAGE_PASSIVE = 0.05; // Era 0.1
export const USAGE_DOOR = 0.35;    // Era 0.8 (Portas agora gastam menos da metade)
export const USAGE_DOOR_LIGHT = 0.15; // Era 0.5
export const USAGE_CAMERA = 0.15;   // Era 0.3
export const USAGE_FLASHLIGHT = 0.45; // Era 1.2 (Lanterna agora é muito mais econômica)
export const DRAIN_WIDOW = 1.0; // Era 2.5 (Widow drena menos energia)

export const CAMERAS = [
  { id: 'CAM_1A', label: '1A - Palco' },
  { id: 'CAM_1B', label: '1B - Jantar' },
  { id: 'CAM_5', label: '5 - Cozinha' },
  { id: 'CAM_2A', label: '2A - Corr. Esq.' },
  { id: 'CAM_2B', label: '2B - Canto Esq.' },
  { id: 'CAM_3A', label: '3A - Corr. Dir.' },
  { id: 'CAM_3B', label: '3B - Canto Dir.' },
  { id: 'CAM_4', label: '4 - Ventilação' },
];

export const NIGHTS: NightConfig[] = [
  {
    nightNumber: 1,
    aiLevels: {
      [AnimatronicId.SHADOW]: 2,
      [AnimatronicId.WIDOW]: 0,
      [AnimatronicId.CRAWLER]: 0,
      [AnimatronicId.WATCHER]: 0,
      [AnimatronicId.JESTER]: 0,
    },
    powerDrainMultiplier: 0.8,
  },
  {
    nightNumber: 2,
    aiLevels: {
      [AnimatronicId.SHADOW]: 4,
      [AnimatronicId.WIDOW]: 2,
      [AnimatronicId.CRAWLER]: 1,
      [AnimatronicId.WATCHER]: 0,
      [AnimatronicId.JESTER]: 0,
    },
    powerDrainMultiplier: 0.9, // Reduzido de 1.0
  },
  {
    nightNumber: 3,
    aiLevels: {
      [AnimatronicId.SHADOW]: 6,
      [AnimatronicId.WIDOW]: 5,
      [AnimatronicId.CRAWLER]: 3,
      [AnimatronicId.WATCHER]: 1,
      [AnimatronicId.JESTER]: 10, // Introduce Jester
    },
    powerDrainMultiplier: 1.0,
  },
  {
    nightNumber: 4,
    aiLevels: {
      [AnimatronicId.SHADOW]: 10,
      [AnimatronicId.WIDOW]: 10,
      [AnimatronicId.CRAWLER]: 8,
      [AnimatronicId.WATCHER]: 5,
      [AnimatronicId.JESTER]: 15,
    },
    powerDrainMultiplier: 1.1,
  },
  {
    nightNumber: 5,
    aiLevels: {
      [AnimatronicId.SHADOW]: 15,
      [AnimatronicId.WIDOW]: 15,
      [AnimatronicId.CRAWLER]: 12,
      [AnimatronicId.WATCHER]: 10,
      [AnimatronicId.JESTER]: 20,
    },
    powerDrainMultiplier: 1.2,
  },
  {
    nightNumber: 6, // Nightmare
    aiLevels: {
      [AnimatronicId.SHADOW]: 20,
      [AnimatronicId.WIDOW]: 20,
      [AnimatronicId.CRAWLER]: 20,
      [AnimatronicId.WATCHER]: 20,
      [AnimatronicId.JESTER]: 20,
    },
    powerDrainMultiplier: 1.3,
  }
];