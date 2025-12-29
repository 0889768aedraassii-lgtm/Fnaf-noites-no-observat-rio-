import { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatronicId, AnimatronicState, CameraLocation, GameScreen, NightConfig } from '../types';
import { REAL_SECONDS_PER_GAME_HOUR, TOTAL_HOURS, MAX_POWER, USAGE_PASSIVE, USAGE_DOOR, USAGE_DOOR_LIGHT, USAGE_CAMERA, USAGE_FLASHLIGHT, DRAIN_WIDOW } from '../constants';

interface GameState {
  screen: GameScreen;
  night: number;
  timeHour: number;
  elapsedSeconds: number;
  power: number;
  isLeftDoorClosed: boolean;
  isRightDoorClosed: boolean;
  isLeftLightOn: boolean;
  isRightLightOn: boolean;
  isCameraOpen: boolean;
  isFlashlightOn: boolean;
  flashlightFlicker: boolean;
  currentCamera: string;
  animatronics: AnimatronicState[];
  usageBars: number;
  jumpscareId: AnimatronicId | null;
}

// --- AUDIO ENGINE ---
const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
let fanOscillator: AudioBufferSourceNode | null = null;
let fanGain: GainNode | null = null;

const SoundEngine = {
  resume: () => {
    if (audioCtx.state === 'suspended') audioCtx.resume();
  },

  startFan: () => {
    if (fanOscillator) return;
    const bufferSize = audioCtx.sampleRate * 2;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 180;
    filter.Q.value = 1;
    const gain = audioCtx.createGain();
    gain.gain.value = 0.08;
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    noise.start();
    fanOscillator = noise;
    fanGain = gain;
  },

  stopFan: () => {
    if (fanOscillator) {
      try {
        fanOscillator.stop();
        fanOscillator.disconnect();
      } catch (e) { /* ignore */ }
      fanOscillator = null;
    }
  },
  
  playTone: (freq: number, type: OscillatorType, duration: number, vol: number = 0.1) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  },

  playNoise: (duration: number, vol: number = 0.5) => {
    const bufferSize = audioCtx.sampleRate * duration;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    noise.connect(gain);
    gain.connect(audioCtx.destination);
    noise.start();
  },

  playScare: () => {
    const osc1 = audioCtx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(600, audioCtx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 1.5);
    const gain1 = audioCtx.createGain();
    gain1.gain.setValueAtTime(0.8, audioCtx.currentTime);
    gain1.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.5);

    const osc2 = audioCtx.createOscillator();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(150, audioCtx.currentTime);
    osc2.frequency.linearRampToValueAtTime(50, audioCtx.currentTime + 1.5);
    const gain2 = audioCtx.createGain();
    gain2.gain.setValueAtTime(0.6, audioCtx.currentTime);
    gain2.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.5);

    const bufferSize = audioCtx.sampleRate * 1.5;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.8;
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    const gain3 = audioCtx.createGain();
    gain3.gain.setValueAtTime(0.5, audioCtx.currentTime);

    osc1.connect(gain1);
    osc2.connect(gain2);
    noise.connect(gain3);
    gain1.connect(audioCtx.destination);
    gain2.connect(audioCtx.destination);
    gain3.connect(audioCtx.destination);

    osc1.start();
    osc2.start();
    noise.start();
    osc1.stop(audioCtx.currentTime + 1.5);
    osc2.stop(audioCtx.currentTime + 1.5);
  },

  playFootstepLeft: () => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const panner = audioCtx.createStereoPanner();
    osc.frequency.setValueAtTime(60, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.6, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
    panner.pan.value = -0.8; 
    osc.connect(gain);
    gain.connect(panner);
    panner.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.4);
  },

  playFootstepRight: () => {
    const panner = audioCtx.createStereoPanner();
    panner.pan.value = 0.8;
    panner.connect(audioCtx.destination);
    for(let i=0; i<4; i++) {
      setTimeout(() => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(500, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(panner);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.05);
      }, i * 80);
    }
  },

  playVentNoise: () => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(40, audioCtx.currentTime);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(150, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 2.0);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 2.0);
  },
  
  playGlitch: () => {
      const osc = audioCtx.createOscillator();
      osc.frequency.setValueAtTime(1000 + Math.random() * 500, audioCtx.currentTime);
      osc.type = 'sawtooth';
      const gain = audioCtx.createGain();
      gain.gain.value = 0.05;
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
  },

  playLaugh: () => {
    SoundEngine.playTone(600, 'sawtooth', 0.1, 0.2);
    setTimeout(() => SoundEngine.playTone(550, 'sawtooth', 0.1, 0.2), 150);
    setTimeout(() => SoundEngine.playTone(500, 'sawtooth', 0.2, 0.2), 300);
  }
};

export const useGameEngine = () => {
  const [state, setState] = useState<GameState>({
    screen: GameScreen.TITLE,
    night: 1,
    timeHour: 0,
    elapsedSeconds: 0,
    power: MAX_POWER,
    isLeftDoorClosed: false,
    isRightDoorClosed: false,
    isLeftLightOn: false,
    isRightLightOn: false,
    isCameraOpen: false,
    isFlashlightOn: false,
    flashlightFlicker: false,
    currentCamera: 'CAM_1A',
    animatronics: [],
    usageBars: 1,
    jumpscareId: null
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const flashlightTimerRef = useRef<number>(0);

  const playSound = (type: 'door' | 'light' | 'step' | 'scare' | 'win' | 'vent' | 'glitch' | 'laugh') => {
    switch (type) {
      case 'door': SoundEngine.playNoise(0.3, 0.4); break;
      case 'light': SoundEngine.playTone(800, 'sine', 0.1, 0.05); break;
      case 'scare': SoundEngine.playScare(); break;
      case 'win': SoundEngine.playTone(440, 'triangle', 1.0, 0.3); break;
      case 'vent': SoundEngine.playVentNoise(); break;
      case 'glitch': SoundEngine.playGlitch(); break;
      case 'laugh': SoundEngine.playLaugh(); break;
    }
  };

  const startGame = (nightConfig: NightConfig) => {
    SoundEngine.resume();
    SoundEngine.startFan();
    
    // Configuração dos animatronics com tempos agressivos (3s a 6s de reação)
    const initialAnimatronics: AnimatronicState[] = [
      // SHADOW: Padrão, mas letal se ignorado na porta por 4 segundos
      { id: AnimatronicId.SHADOW, location: CameraLocation.CAM_1A, aiLevel: nightConfig.aiLevels[AnimatronicId.SHADOW], movementCooldown: 5 },
      // WIDOW: Drenadora, mas te mata em 6 segundos se ficar na porta
      { id: AnimatronicId.WIDOW, location: CameraLocation.CAM_1A, aiLevel: nightConfig.aiLevels[AnimatronicId.WIDOW], movementCooldown: 8 },
      // CRAWLER: Rápido no duto, 4 segundos para piscar a luz
      { id: AnimatronicId.CRAWLER, location: CameraLocation.CAM_4, aiLevel: nightConfig.aiLevels[AnimatronicId.CRAWLER], movementCooldown: 10, patience: 0 },
      // WATCHER: Fantasma
      { id: AnimatronicId.WATCHER, location: CameraLocation.CAM_5, aiLevel: nightConfig.aiLevels[AnimatronicId.WATCHER], movementCooldown: 20, patience: 100 },
      // JESTER: Teleporta na hora cheia, 3 segundos para fechar a porta
      { id: AnimatronicId.JESTER, location: 'OFFICE_CORNER', aiLevel: nightConfig.aiLevels[AnimatronicId.JESTER], movementCooldown: 0, doorWaitTime: 0 }
    ];

    setState(prev => ({
      ...prev,
      screen: GameScreen.PLAYING,
      night: nightConfig.nightNumber,
      timeHour: 0,
      elapsedSeconds: 0,
      power: MAX_POWER,
      isLeftDoorClosed: false,
      isRightDoorClosed: false,
      isLeftLightOn: false,
      isRightLightOn: false,
      isCameraOpen: false,
      isFlashlightOn: false,
      flashlightFlicker: false,
      animatronics: initialAnimatronics,
      jumpscareId: null
    }));
  };

  const endGame = (won: boolean, killerId?: AnimatronicId) => {
    SoundEngine.stopFan();
    if (timerRef.current) clearInterval(timerRef.current);
    
    if (won) {
      playSound('win');
      setState(prev => ({ ...prev, screen: GameScreen.WIN }));
      const unlocked = parseInt(localStorage.getItem('fnaf_clone_night') || '1');
      if (state.night >= unlocked && state.night < 5) {
        localStorage.setItem('fnaf_clone_night', (state.night + 1).toString());
      } else if (state.night === 5) {
        localStorage.setItem('fnaf_clone_night', '6');
      }
    } else {
      playSound('scare');
      setState(prev => ({ ...prev, jumpscareId: killerId || null, screen: GameScreen.GAMEOVER }));
    }
  };

  useEffect(() => {
    return () => SoundEngine.stopFan();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if(['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }

      if (state.screen !== GameScreen.PLAYING) return;
      if (state.power <= 0) return;
      if (e.repeat) return;

      switch(e.code) {
        case 'KeyA':
          SoundEngine.playNoise(0.3, 0.4);
          setState(s => ({ ...s, isLeftDoorClosed: !s.isLeftDoorClosed }));
          break;
        case 'KeyD':
          SoundEngine.playNoise(0.3, 0.4);
          setState(s => ({ ...s, isRightDoorClosed: !s.isRightDoorClosed }));
          break;
        case 'KeyQ':
          SoundEngine.playTone(800, 'sine', 0.1, 0.05);
          setState(s => ({ ...s, isLeftLightOn: true, isCameraOpen: false }));
          break;
        case 'KeyE':
          SoundEngine.playTone(800, 'sine', 0.1, 0.05);
          setState(s => ({ ...s, isRightLightOn: true, isCameraOpen: false }));
          break;
        case 'KeyF': 
        case 'Space': 
          if (!state.isCameraOpen) {
             SoundEngine.playTone(800, 'sine', 0.1, 0.05);
             setState(s => ({ ...s, isFlashlightOn: true }));
          }
          break;
        case 'KeyS':
        case 'ArrowDown':
        case 'ArrowUp':
          setState(s => ({ ...s, isCameraOpen: !s.isCameraOpen, isFlashlightOn: false, isLeftLightOn: false, isRightLightOn: false }));
          break;
      }

      if (state.isCameraOpen) {
        const camMap: Record<string, string> = {
          'Digit1': 'CAM_1A', 'Digit2': 'CAM_1B', 'Digit3': 'CAM_5',
          'Digit4': 'CAM_2A', 'Digit5': 'CAM_2B', 'Digit6': 'CAM_3A',
          'Digit7': 'CAM_3B', 'Digit8': 'CAM_4'
        };
        if (camMap[e.code]) {
          setState(s => ({ ...s, currentCamera: camMap[e.code] }));
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (state.screen !== GameScreen.PLAYING) return;
      switch(e.code) {
        case 'KeyQ': setState(s => ({ ...s, isLeftLightOn: false })); break;
        case 'KeyE': setState(s => ({ ...s, isRightLightOn: false })); break;
        case 'KeyF': 
        case 'Space': setState(s => ({ ...s, isFlashlightOn: false })); break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [state.screen, state.power, state.isCameraOpen]);

  useEffect(() => {
    if (state.screen !== GameScreen.PLAYING) return;

    timerRef.current = setInterval(() => {
      setState(curr => {
        const nextElapsed = curr.elapsedSeconds + 1;
        const maxSeconds = TOTAL_HOURS * REAL_SECONDS_PER_GAME_HOUR;
        
        if (nextElapsed >= maxSeconds) {
           setTimeout(() => endGame(true), 0);
           return { ...curr, elapsedSeconds: maxSeconds, timeHour: TOTAL_HOURS };
        }
        
        const nextHour = Math.floor(nextElapsed / REAL_SECONDS_PER_GAME_HOUR);
        const hourChanged = nextHour > curr.timeHour;

        let usage = USAGE_PASSIVE;
        if (curr.isLeftDoorClosed) usage += USAGE_DOOR;
        if (curr.isRightDoorClosed) usage += USAGE_DOOR;
        if (curr.isCameraOpen) usage += USAGE_CAMERA;
        if (curr.isFlashlightOn) usage += USAGE_FLASHLIGHT;
        if (curr.isLeftLightOn) usage += USAGE_DOOR_LIGHT;
        if (curr.isRightLightOn) usage += USAGE_DOOR_LIGHT;

        const widow = curr.animatronics.find(a => a.id === AnimatronicId.WIDOW);
        if (widow && widow.location === 'DOOR_RIGHT' && !curr.isRightDoorClosed) {
           usage += DRAIN_WIDOW; 
        }

        const newPower = Math.max(0, curr.power - usage);
        const newUsageBars = Math.min(5, Math.ceil(usage));

        let flicker = false;
        if (curr.isFlashlightOn && newPower < 20) {
           flicker = Math.random() > 0.7; 
        }

        if (curr.isFlashlightOn) {
           flashlightTimerRef.current += 1;
        } else {
           flashlightTimerRef.current = Math.max(0, flashlightTimerRef.current - 0.5);
        }
        
        if (newPower <= 0) {
           if (curr.power > 0) return { ...curr, power: 0, isLeftDoorClosed: false, isRightDoorClosed: false, isLeftLightOn: false, isRightLightOn: false, isCameraOpen: false, isFlashlightOn: false };
           if (Math.random() < 0.2) { endGame(false, AnimatronicId.SHADOW); return curr; }
           return { ...curr, power: 0 };
        }

        const newAnimatronics = curr.animatronics.map(anim => {
          if (anim.id === AnimatronicId.JESTER) {
            if (anim.aiLevel > 0) {
               if (hourChanged) {
                  const target = Math.random() > 0.5 ? 'DOOR_LEFT' : 'DOOR_RIGHT';
                  SoundEngine.playLaugh(); 
                  if (target === 'DOOR_LEFT') SoundEngine.playFootstepLeft();
                  else SoundEngine.playFootstepRight();
                  return { ...anim, location: target, doorWaitTime: 3 }; // 3 Segundos
               }
               if (anim.location === 'DOOR_LEFT') {
                  if (curr.isLeftDoorClosed) return { ...anim, location: 'OFFICE_CORNER' }; 
                  const wait = (anim.doorWaitTime || 0) - 1;
                  if (wait <= 0) { endGame(false, AnimatronicId.JESTER); return anim; }
                  return { ...anim, doorWaitTime: wait };
               }
               if (anim.location === 'DOOR_RIGHT') {
                  if (curr.isRightDoorClosed) return { ...anim, location: 'OFFICE_CORNER' }; 
                   const wait = (anim.doorWaitTime || 0) - 1;
                   if (wait <= 0) { endGame(false, AnimatronicId.JESTER); return anim; }
                   return { ...anim, doorWaitTime: wait };
               }
            }
            return anim;
          }

          if (anim.movementCooldown > 0) return { ...anim, movementCooldown: anim.movementCooldown - 1 };

          let aggressionBonus = flashlightTimerRef.current > 5 ? 5 : 0;
          const roll = Math.random() * 20;
          if (roll > (anim.aiLevel + aggressionBonus)) return anim;

          if (anim.id === AnimatronicId.SHADOW) {
            let nextLocation = anim.location;
            switch (anim.location) {
              case CameraLocation.CAM_1A: nextLocation = CameraLocation.CAM_1B; break;
              case CameraLocation.CAM_1B: nextLocation = CameraLocation.CAM_2A; break;
              case CameraLocation.CAM_2A: nextLocation = CameraLocation.CAM_2B; break;
              case CameraLocation.CAM_2B: nextLocation = 'DOOR_LEFT'; break;
              case 'DOOR_LEFT':
                if (curr.isLeftDoorClosed) {
                  playSound('door'); 
                  nextLocation = CameraLocation.CAM_1A;
                } else {
                  if ((anim.doorWaitTime || 0) <= 0) { endGame(false, AnimatronicId.SHADOW); return anim; }
                  return { ...anim, doorWaitTime: (anim.doorWaitTime || 0) - 1 };
                }
                break;
            }
            if (nextLocation !== anim.location) {
               if (nextLocation === CameraLocation.CAM_2B) SoundEngine.playFootstepLeft(); 
               if (nextLocation === 'DOOR_LEFT') SoundEngine.playFootstepLeft(); 
               return { ...anim, location: nextLocation, movementCooldown: 8, doorWaitTime: 4 }; // 4 Segundos
            }
          }

          if (anim.id === AnimatronicId.WIDOW) {
            let nextLocation = anim.location;
            switch (anim.location) {
              case CameraLocation.CAM_1A: nextLocation = CameraLocation.CAM_1B; break;
              case CameraLocation.CAM_1B: nextLocation = CameraLocation.CAM_3A; break;
              case CameraLocation.CAM_3A: nextLocation = CameraLocation.CAM_3B; break;
              case CameraLocation.CAM_3B: nextLocation = 'DOOR_RIGHT'; break;
              case 'DOOR_RIGHT':
                if (curr.isRightDoorClosed) {
                  playSound('door'); 
                  nextLocation = CameraLocation.CAM_1A; 
                } else {
                   if ((anim.doorWaitTime || 0) <= 0) { endGame(false, AnimatronicId.WIDOW); return anim; }
                   return { ...anim, doorWaitTime: (anim.doorWaitTime || 0) - 1 };
                }
                break;
            }
            if (nextLocation !== anim.location) {
               if (nextLocation === CameraLocation.CAM_3B) SoundEngine.playFootstepRight();
               if (nextLocation === 'DOOR_RIGHT') SoundEngine.playFootstepRight();
               return { ...anim, location: nextLocation, movementCooldown: 8, doorWaitTime: 6 }; // 6 Segundos
            }
          }

          if (anim.id === AnimatronicId.CRAWLER) {
            if (anim.location === CameraLocation.CAM_4) {
               playSound('vent'); 
               return { ...anim, location: 'VENT_OPENING', patience: 4 }; 
            }
            if (anim.location === 'VENT_OPENING') {
              if (curr.isFlashlightOn && !flicker) { 
                 playSound('scare'); 
                 return { ...anim, location: CameraLocation.CAM_4, movementCooldown: 15 };
              }
              const newPatience = (anim.patience || 0) - 1;
              if (newPatience <= 0) { endGame(false, AnimatronicId.CRAWLER); return anim; }
              return { ...anim, patience: newPatience };
            }
          }

          if (anim.id === AnimatronicId.WATCHER) {
             if (curr.isCameraOpen && Math.random() < 0.1) {
                 playSound('glitch');
             }
             if (anim.location !== 'OFFICE_CORNER' && Math.random() < 0.05) {
                 playSound('glitch');
                 return { ...anim, location: 'OFFICE_CORNER', patience: 5 }; 
             }
             if (anim.location === 'OFFICE_CORNER') {
                 if (curr.isCameraOpen || (curr.isFlashlightOn && !flicker)) {
                     return { ...anim, location: CameraLocation.CAM_5, movementCooldown: 20 }; 
                 }
                 const newPatience = (anim.patience || 0) - 1;
                 if (newPatience <= 0) { endGame(false, AnimatronicId.WATCHER); return anim; }
                 return { ...anim, patience: newPatience };
             }
          }
          return anim;
        });

        return { 
          ...curr, 
          elapsedSeconds: nextElapsed, 
          timeHour: nextHour,
          power: newPower, 
          usageBars: newUsageBars, 
          flashlightFlicker: flicker, 
          animatronics: newAnimatronics 
        };
      });
    }, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [state.screen]);

  const toggleLeftDoor = () => { SoundEngine.resume(); if (state.power <= 0) return; playSound('door'); setState(s => ({ ...s, isLeftDoorClosed: !s.isLeftDoorClosed })); };
  const toggleRightDoor = () => { SoundEngine.resume(); if (state.power <= 0) return; playSound('door'); setState(s => ({ ...s, isRightDoorClosed: !s.isRightDoorClosed })); };
  const setLeftLight = (on: boolean) => { SoundEngine.resume(); if (state.power <= 0) return; if (on && !state.isLeftLightOn) playSound('light'); setState(s => ({ ...s, isLeftLightOn: on, isCameraOpen: false })); };
  const setRightLight = (on: boolean) => { SoundEngine.resume(); if (state.power <= 0) return; if (on && !state.isRightLightOn) playSound('light'); setState(s => ({ ...s, isRightLightOn: on, isCameraOpen: false })); };
  const toggleCamera = () => { SoundEngine.resume(); if (state.power <= 0) return; setState(s => ({ ...s, isCameraOpen: !s.isCameraOpen, isFlashlightOn: false, isLeftLightOn: false, isRightLightOn: false })); };
  const toggleFlashlight = () => { SoundEngine.resume(); if (state.power <= 0 || state.isCameraOpen) return; playSound('light'); setState(s => ({ ...s, isFlashlightOn: !s.isFlashlightOn })); };
  const switchCamera = (camId: string) => setState(s => ({ ...s, currentCamera: camId }));
  const goToMenu = () => setState(s => ({ ...s, screen: GameScreen.MENU }));
  const returnToMenu = () => setState(s => ({ ...s, screen: GameScreen.TITLE }));

  return {
    state,
    actions: { startGame, toggleLeftDoor, toggleRightDoor, setLeftLight, setRightLight, toggleCamera, toggleFlashlight, switchCamera, goToMenu, returnToMenu }
  };
};