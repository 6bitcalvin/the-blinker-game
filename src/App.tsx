import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Play, 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  Award, 
  AlertTriangle, 
  Sparkles,
  Info,
  ChevronRight,
  X
} from 'lucide-react';

// --- Types ---
interface Player {
  id: string;
  name: string;
  score: number;
  device: 'cartridge' | 'disposable' | 'muhameds' | 'boutiq';
  oilLevel: number; // 0.0 to 1.0 (Only for cartridge)
  batteryLevel: number; // 0.0 to 1.0 (Only for disposable)
  status: 'IDLE' | 'INHALING' | 'SUCCESS' | 'TAPPED_OUT';
  isEliminated?: boolean;
  totalBlinks: number;
  totalAttempts: number;
  totalDuration: number;
  streak: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  vRot: number;
  opacity: number;
  symbol: string;
}

interface TrailParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  maxSize: number;
  opacity: number;
  color: string;
  blur: string;
  life: number;
  maxLife: number;
}

// --- 8-Bit Pixel Detailed SVG Icons ---
const PixelCartridgeIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block align-middle pixelated select-none pointer-events-none">
    {/* Mouthpiece */}
    <rect x="6" y="0" width="4" height="3" fill="#cbd5e1" />
    <rect x="7" y="1" width="2" height="2" fill="#94a3b8" />
    {/* Metal collar */}
    <rect x="5" y="3" width="6" height="2" fill="#94a3b8" />
    {/* Glass tube with Gold Oil inside */}
    <rect x="5" y="5" width="6" height="8" fill="#facc15" />
    {/* Glass highlight */}
    <rect x="5" y="5" width="1" height="8" fill="#eab308" />
    <rect x="10" y="5" width="1" height="8" fill="#ffffff" opacity="0.7" />
    {/* Air intake tube (center metal post) */}
    <rect x="7" y="5" width="2" height="8" fill="#94a3b8" />
    {/* Thread connector (bottom) */}
    <rect x="6" y="13" width="4" height="2" fill="#475569" />
    <rect x="7" y="15" width="2" height="1" fill="#334155" />
  </svg>
);

const PixelDisposableIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block align-middle pixelated select-none pointer-events-none">
    {/* Mouthpiece */}
    <rect x="7" y="0" width="2" height="3" fill="#1e1b4b" />
    {/* Body */}
    <rect x="4" y="3" width="8" height="11" fill="#06b6d4" rx="1" />
    {/* Accent stripe */}
    <rect x="4" y="3" width="2" height="11" fill="#0891b2" />
    {/* View window / display details */}
    <rect x="7" y="5" width="3" height="4" fill="#10b981" />
    <rect x="8" y="6" width="1" height="2" fill="#34d399" />
    {/* Indicator light */}
    <rect x="7" y="11" width="2" height="1" fill="#39ff14" />
    {/* Bottom metal trim */}
    <rect x="5" y="14" width="6" height="2" fill="#475569" />
  </svg>
);

const PixelCrownIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block align-middle pixelated select-none pointer-events-none">
    {/* Tips/Points jewels */}
    <rect x="2" y="1" width="2" height="2" fill="#d946ef" />
    <rect x="7" y="0" width="2" height="2" fill="#c084fc" />
    <rect x="12" y="1" width="2" height="2" fill="#d946ef" />

    {/* Left Peak */}
    <rect x="1" y="3" width="4" height="3" fill="#7e22ce" />
    <rect x="2" y="3" width="2" height="2" fill="#a855f7" />
    
    {/* Middle Peak */}
    <rect x="6" y="2" width="4" height="4" fill="#7e22ce" />
    <rect x="7" y="2" width="2" height="3" fill="#a855f7" />

    {/* Right Peak */}
    <rect x="11" y="3" width="4" height="3" fill="#7e22ce" />
    <rect x="12" y="3" width="2" height="2" fill="#a855f7" />

    {/* Center fill connecting body */}
    <rect x="2" y="6" width="12" height="5" fill="#581c87" />
    <rect x="3" y="6" width="10" height="4" fill="#7e22ce" />
    <rect x="4" y="6" width="8" height="3" fill="#a855f7" />

    {/* Darker shadow areas */}
    <rect x="1" y="5" width="1" height="6" fill="#3b0764" />
    <rect x="14" y="5" width="1" height="6" fill="#3b0764" />
    <rect x="2" y="10" width="12" height="1" fill="#3b0764" />

    {/* Bottom gold/jeweled crown band */}
    <rect x="1" y="11" width="14" height="3" fill="#2e1065" />
    <rect x="2" y="12" width="12" height="1" fill="#581c87" />
    
    {/* Inner jewels on the band */}
    <rect x="3" y="12" width="2" height="1" fill="#00f3ff" />
    <rect x="7" y="12" width="2" height="1" fill="#ff007f" />
    <rect x="11" y="12" width="2" height="1" fill="#39ff14" />
  </svg>
);

const PixelMuhaIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block align-middle pixelated select-none pointer-events-none">
    {/* Mouthpiece */}
    <rect x="6" y="0" width="4" height="2" fill="#18181b" />
    {/* Body */}
    <rect x="3" y="1.5" width="10" height="13" fill="#2d2d30" rx="1" />
    <rect x="4" y="2" width="8" height="12" fill="#1d1d1f" />
    {/* Golden crest seal logo in center */}
    <circle cx="8" cy="8.5" r="2.5" fill="#ca8a04" />
    <rect x="7" y="8" width="2" height="1.5" fill="#facc15" />
    {/* Left oil tube (gold) */}
    <rect x="4.5" y="3" width="2" height="10" fill="#facc15" />
    <rect x="5.5" y="3" width="1" height="10" fill="#ca8a04" />
    {/* Status light */}
    <rect x="7" y="13" width="2" height="1.2" fill="#c084fc" />
    {/* Bottom cap */}
    <rect x="4" y="14" width="8" height="1.2" fill="#141416" />
  </svg>
);

const PixelBoutiqIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block align-middle pixelated select-none pointer-events-none">
    {/* Mouthpiece / upper cap */}
    <rect x="5" y="0" width="6" height="3.2" fill="#7c3aed" rx="1" />
    <rect x="7" y="0" width="2" height="3" fill="#5b21b6" />
    {/* Fatter outer Body (Purple) */}
    <rect x="3.2" y="3.2" width="9.6" height="11.2" rx="2" fill="#8b5cf6" />
    {/* Inner Front Screen Face (Black) */}
    <rect x="4.2" y="5.2" width="7.6" height="7.6" fill="#090412" rx="1" />
    {/* 3 Gold oil capsules inside screen at the top */}
    <rect x="5" y="6" width="1.2" height="1.8" fill="#facc15" />
    <rect x="7.2" y="6" width="1.2" height="1.8" fill="#facc15" />
    <rect x="9.4" y="6" width="1.2" height="1.8" fill="#facc15" />
    {/* LED Indicators / tiny screen symbols */}
    <rect x="5.2" y="9.2" width="2" height="1" fill="#00f3ff" />
    <rect x="8.8" y="9.2" width="2.2" height="1" fill="#ff007f" />
    {/* Switch Button at bottom */}
    <rect x="6" y="11.2" width="4" height="1" fill="#7c3aed" />
    <rect x="4" y="14" width="8" height="1" fill="#4c1d95" />
  </svg>
);

const getDeviceIcon = (device: 'cartridge' | 'disposable' | 'muhameds' | 'boutiq', size = 12) => {
  switch (device) {
    case 'cartridge': return <PixelCartridgeIcon size={size} />;
    case 'disposable': return <PixelDisposableIcon size={size} />;
    case 'muhameds': return <PixelMuhaIcon size={size} />;
    case 'boutiq': return <PixelBoutiqIcon size={size} />;
  }
};

const getDeviceName = (device: 'cartridge' | 'disposable' | 'muhameds' | 'boutiq') => {
  switch (device) {
    case 'cartridge': return 'Cartridge';
    case 'disposable': return 'Disposable';
    case 'muhameds': return 'Muha Meds';
    case 'boutiq': return 'Boutiq Dual-Tank';
  }
};

const getDeviceAccentColor = (device: 'cartridge' | 'disposable' | 'muhameds' | 'boutiq') => {
  switch (device) {
    case 'cartridge': return '#ff007f';
    case 'disposable': return '#00f3ff';
    case 'muhameds': return '#eab308';
    case 'boutiq': return '#a78bfa';
  }
};

// --- Simplified Neutral Feedback Quotes ---
const FAILURE_QUOTES = [
  "Inhalation stopped early.",
  "Did not reach required time.",
  "Blinker timer not completed.",
  "Puff was too short."
];

const SUCCESS_QUOTES = [
  "Timer completed.",
  "Target time reached.",
  "Blinker succeeded.",
  "Succeeded."
];

// --- Presets ---
const PRESET_NAMES = [
  "LUNG_CHAMPION", "COIL_CRUSHER", "GLITCH_SPIKE", "NEON_LORD",
  "OXYGEN_ENEMY", "VOLT_VIXEN", "BATTERY_BOSS", "VAPOR_STORM"
];

// --- Web Audio System ---
let audioCtx: AudioContext | null = null;
let activeOsc: OscillatorNode | null = null;
let activeMod: OscillatorNode | null = null;
let activeFilter: BiquadFilterNode | null = null;
let activeGain: GainNode | null = null;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playSynthBeep(freq: number, type: 'sine' | 'square' | 'sawtooth' | 'triangle' = 'sine', duration = 0.1, volume = 0.1) {
  try {
    initAudio();
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    console.warn("Audio blocked:", e);
  }
}

function playTactileClick() {
  try {
    initAudio();
    if (!audioCtx) return;
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gainNode1 = audioCtx.createGain();
    const gainNode2 = audioCtx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(1100, audioCtx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(70, audioCtx.currentTime + 0.012);
    gainNode1.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gainNode1.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.012);

    osc2.type = 'square';
    osc2.frequency.setValueAtTime(160, audioCtx.currentTime);
    gainNode2.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gainNode2.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.02);

    osc1.connect(gainNode1);
    gainNode1.connect(audioCtx.destination);
    osc2.connect(gainNode2);
    gainNode2.connect(audioCtx.destination);

    osc1.start();
    osc1.stop(audioCtx.currentTime + 0.02);
    osc2.start();
    osc2.stop(audioCtx.currentTime + 0.02);
  } catch (e) {
    console.warn("Tactile click blocked:", e);
  }
}

function playSubtleClickHiss() {
  try {
    initAudio();
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const noiseGain = audioCtx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(55, audioCtx.currentTime);
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(320, audioCtx.currentTime);
    filter.Q.setValueAtTime(4.0, audioCtx.currentTime);
    
    noiseGain.gain.setValueAtTime(0.015, audioCtx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.03);
    
    osc.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.03);
  } catch (e) {
    console.warn("Subtle click/hiss blocked:", e);
  }
}

function playLowBatteryBeep() {
  try {
    initAudio();
    if (!audioCtx) return;
    // Standard low-power warning sequence: two rapid high-pitched distinct beep alerts
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime + 0.08);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.12);
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.12);

    setTimeout(() => {
      try {
        if (!audioCtx) return;
        const osc2 = audioCtx.createOscillator();
        const gainNode2 = audioCtx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(880, audioCtx.currentTime);
        gainNode2.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gainNode2.gain.setValueAtTime(0.12, audioCtx.currentTime + 0.08);
        gainNode2.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.12);
        osc2.connect(gainNode2);
        gainNode2.connect(audioCtx.destination);
        osc2.start();
        osc2.stop(audioCtx.currentTime + 0.12);
      } catch (e) {
        console.warn("Second beep failed:", e);
      }
    }, 150);
  } catch (e) {
    console.warn("Low battery beep blocked:", e);
  }
}

function startInhaleSizzle() {
  try {
    initAudio();
    if (!audioCtx) return;
    stopInhaleSizzle();

    activeOsc = audioCtx.createOscillator();
    activeOsc.type = 'triangle';
    activeOsc.frequency.setValueAtTime(80, audioCtx.currentTime);

    activeMod = audioCtx.createOscillator();
    activeMod.type = 'sawtooth';
    activeMod.frequency.setValueAtTime(110, audioCtx.currentTime);

    const modGain = audioCtx.createGain();
    modGain.gain.setValueAtTime(50, audioCtx.currentTime);

    activeFilter = audioCtx.createBiquadFilter();
    activeFilter.type = 'bandpass';
    activeFilter.frequency.setValueAtTime(1500, audioCtx.currentTime);
    activeFilter.Q.setValueAtTime(4.0, audioCtx.currentTime);

    activeGain = audioCtx.createGain();
    activeGain.gain.setValueAtTime(0.07, audioCtx.currentTime);

    activeMod.connect(modGain);
    modGain.connect(activeOsc.frequency);
    activeOsc.connect(activeFilter);
    activeFilter.connect(activeGain);
    activeGain.connect(audioCtx.destination);

    activeOsc.start();
    activeMod.start();
  } catch (e) {
    console.warn("Sound start error:", e);
  }
}

function updateInhaleSizzleRate(progress: number) {
  try {
    if (audioCtx && activeFilter && activeOsc) {
      const targetCutoff = 1500 + progress * 1200;
      activeFilter.frequency.setValueAtTime(targetCutoff, audioCtx.currentTime);
      const bassFreq = 80 + progress * 60;
      activeOsc.frequency.setValueAtTime(bassFreq, audioCtx.currentTime);
    }
  } catch {}
}

function stopInhaleSizzle() {
  try {
    if (activeOsc) {
      activeOsc.stop();
      activeOsc = null;
    }
    if (activeMod) {
      activeMod.stop();
      activeMod = null;
    }
    activeFilter = null;
    activeGain = null;
  } catch {}
}

function playBlinkerSuccessTune() {
  stopInhaleSizzle();
  try {
    initAudio();
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    const notes = [293.66, 329.63, 392.00, 440.00, 523.25, 659.25, 880.00, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = audioCtx!.createOscillator();
      const gainNode = audioCtx!.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);
      gainNode.gain.setValueAtTime(0.06, now + idx * 0.06);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.18);
      osc.connect(gainNode);
      gainNode.connect(audioCtx!.destination);
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.22);
    });
  } catch {}
}

function playBuzzerTune() {
  stopInhaleSizzle();
  try {
    initAudio();
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.linearRampToValueAtTime(80, now + 0.5);
    gainNode.gain.setValueAtTime(0.15, now);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.55);
  } catch {}
}



// --- Celebratory Neon Particle Overlay Component ---
const CelebrationOverlay = ({ 
  playerName, 
  score, 
  onClose, 
  customScoreText, 
  isBaseball 
}: { 
  playerName: string; 
  score: number; 
  onClose: () => void; 
  customScoreText?: string; 
  isBaseball?: boolean;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (canvas) {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);

    const colors = isBaseball 
      ? ['#ffe400', '#00f3ff', '#39ff14', '#ff0055', '#ff9900', '#ffffff'] 
      : ['#ff007f', '#00f3ff', '#39ff14', '#ffd700', '#7b2cbf'];

    const particlesArray: Array<{
      type: 'rocket' | 'spark';
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
      decay: number;
      gravityEnabled?: boolean;
    }> = [];

    // Spark drift particles initially
    if (!isBaseball) {
      for (let i = 0; i < 100; i++) {
        particlesArray.push({
          type: 'spark',
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 3,
          vy: (Math.random() - 0.5) * 3 - 1.0,
          size: Math.random() * 2 + 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: Math.random() * 0.7 + 0.3,
          decay: Math.random() * 0.003 + 0.001,
          gravityEnabled: false
        });
      }
    } else {
      // Chunkier retro ambient cells for baseball
      for (let i = 0; i < 40; i++) {
        particlesArray.push({
          type: 'spark',
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.8,
          vy: -Math.random() * 0.5 - 0.2,
          size: 4 + Math.floor(Math.random() * 4),
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: Math.random() * 0.5 + 0.3,
          decay: Math.random() * 0.002 + 0.001,
          gravityEnabled: false
        });
      }
    }

    const explode = (cx: number, cy: number, color: string) => {
      if (isBaseball) {
        // 8-bit retro block explosion
        const ringCount = 36;
        for (let i = 0; i < ringCount; i++) {
          const angle = (i / ringCount) * Math.PI * 2;
          // concentric ring velocity
          const speedFactor = (i % 2 === 0) ? 3.5 : 5.5;
          particlesArray.push({
            type: 'spark',
            x: cx,
            y: cy,
            vx: Math.cos(angle) * speedFactor,
            vy: Math.sin(angle) * speedFactor,
            size: 6 + Math.floor(Math.random() * 4), // chunky squares
            color: color,
            alpha: 1.0,
            decay: 0.015 + Math.random() * 0.01,
            gravityEnabled: true
          });
        }
        // Central sparkle block
        for (let j = 0; j < 6; j++) {
          const angle = Math.random() * Math.PI * 2;
          particlesArray.push({
            type: 'spark',
            x: cx,
            y: cy,
            vx: Math.cos(angle) * 1.5,
            vy: Math.sin(angle) * 1.5,
            size: 10,
            color: '#ffffff',
            alpha: 1.0,
            decay: 0.04,
            gravityEnabled: false
          });
        }
        // Retro sound!
        try {
          playSynthBeep(260 + Math.random() * 400, 'square', 0.07);
          setTimeout(() => playSynthBeep(130 + Math.random() * 100, 'triangle', 0.1), 50);
        } catch {}
      } else {
        // Normal explosion
        for (let i = 0; i < 60; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 6 + 2;
          particlesArray.push({
            type: 'spark',
            x: cx,
            y: cy,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: Math.random() * 3 + 1,
            color: color,
            alpha: 1.0,
            decay: Math.random() * 0.015 + 0.01,
            gravityEnabled: true
          });
        }
      }
    };

    const launchRocket = () => {
      const rx = 100 + Math.random() * (width - 200);
      const ry = height;
      const targetY = 100 + Math.random() * (height / 2);
      const dy = targetY - ry;
      const vy = -Math.sqrt(2 * 0.08 * Math.abs(dy)); // physical ascent
      const color = colors[Math.floor(Math.random() * colors.length)];

      particlesArray.push({
        type: 'rocket',
        x: rx,
        y: ry,
        vx: (Math.random() - 0.5) * 2,
        vy: vy,
        size: 8,
        color: color,
        alpha: 1.0,
        decay: 0,
        gravityEnabled: false
      });

      try {
        playSynthBeep(700, 'sine', 0.04);
      } catch {}
    };

    if (!isBaseball) {
      explode(width / 2, height / 2, colors[0]);
    } else {
      setTimeout(() => { launchRocket(); }, 100);
    }

    const t1 = setTimeout(() => explode(width * 0.3, height * 0.4, colors[1 % colors.length]), 500);
    const t2 = setTimeout(() => explode(width * 0.7, height * 0.4, colors[2 % colors.length]), 1000);

    let launchInterval: NodeJS.Timeout | null = null;
    if (isBaseball) {
      launchInterval = setInterval(() => {
        if (Math.random() < 0.7) launchRocket();
      }, 750);
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      ctx.fillStyle = 'rgba(7, 2, 14, 0.45)';
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < particlesArray.length; i++) {
        const p = particlesArray[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.gravityEnabled) {
          p.vy += 0.08;
        }
        
        p.alpha -= p.decay;

        if (p.type === 'rocket') {
          if (p.vy >= -1.0) {
            explode(p.x, p.y, p.color);
            particlesArray.splice(i, 1);
            i--;
            continue;
          }

          // Leave trail
          if (Math.random() < 0.35) {
            particlesArray.push({
              type: 'spark',
              x: p.x + (Math.random() - 0.5) * 4,
              y: p.y + 4,
              vx: (Math.random() - 0.5) * 0.4,
              vy: 0.4,
              size: 4,
              color: '#aaaaaa',
              alpha: 0.6,
              decay: 0.05,
              gravityEnabled: false
            });
          }
        } else {
          if (p.alpha <= 0) {
            if (!isBaseball && particlesArray.length < 120 && Math.random() < 0.15) {
              p.x = Math.random() * width;
              p.y = height + 10;
              p.vx = (Math.random() - 0.5) * 1.5;
              p.vy = -Math.random() * 2 - 1;
              p.alpha = 1.0;
            } else {
              particlesArray.splice(i, 1);
              i--;
              continue;
            }
          }
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        
        if (isBaseball) {
          // Snap coordinate display to 4px boundaries for clean retro 8-bit discretization!
          const px = Math.floor(p.x / 4) * 4;
          const py = Math.floor(p.y / 4) * 4;
          const ps = Math.floor(p.size / 2) * 2 || 4;

          ctx.fillStyle = p.color;
          ctx.fillRect(px - ps / 2, py - ps / 2, ps, ps);
        } else {
          ctx.shadowBlur = 8;
          ctx.shadowColor = p.color;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(t1);
      clearTimeout(t2);
      if (launchInterval) clearInterval(launchInterval);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isBaseball]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
      
      {isBaseball ? (
        <div className="relative z-10 bg-[#0e0717]/95 border-8 border-double border-[#ffd700] p-8 text-center max-w-sm w-full shadow-[0_0_25px_#ffd700] neo-box">
          <div className="mb-4 animate-bounce flex justify-center">
            <PixelCrownIcon size={64} />
          </div>
          <h2 className="font-mono text-xs uppercase tracking-widest text-[#00f3ff] mb-2 font-black">
            BASEBALL CHAMPION
          </h2>
          
          <div className="bg-black/60 border-2 border-dashed border-[#ffe400]/40 p-4 mb-4">
            <h1 className="font-mono text-3xl font-extrabold text-[#39ff14] uppercase tracking-tight blink-fast">
              {playerName}
            </h1>
            <p className="font-mono text-[10px] text-zinc-400 mt-1 uppercase tracking-wide">
              Surviving Base Runner
            </p>
          </div>

          <p className="font-mono text-xs text-slate-300 mb-6 leading-relaxed">
            Congratulations! You took perfect 5s hits, held your breath, cycled the field, and outranked everyone in the circle!
          </p>

          <button
            onClick={onClose}
            className="w-full py-4 bg-[#ffd700] hover:bg-[#ffea3b] text-black font-mono text-xs font-black border-4 border-black hover:translate-y-0.5 active:translate-y-1 transition-all shadow-[6px_6px_0_#000] uppercase tracking-widest cursor-pointer"
          >
            Play Ball! (Close)
          </button>
        </div>
      ) : (
        <div className="relative z-10 bg-[#12061c]/95 border-4 border-[#ff007f] p-8 text-center max-w-sm w-full shadow-[0_0_20px_#ff007f]">
          <div className="mb-4 animate-bounce flex justify-center">
            <PixelCrownIcon size={64} />
          </div>
          <h2 className="font-mono text-xs uppercase tracking-widest text-[#00f3ff] mb-1">
            Top Player
          </h2>
          <h1 className="font-mono text-2xl font-bold text-[#39ff14] mb-3 uppercase tracking-tight">
            {playerName}
          </h1>
          <p className="font-mono text-sm text-slate-300 mb-6 font-semibold">
            {customScoreText ? customScoreText : `Score: ${score} points`}
          </p>

          <button
            onClick={onClose}
            className="w-full py-3 bg-[#ff007f] text-black font-mono text-xs font-bold border-2 border-black hover:bg-pink-400 active:translate-y-0.5 transition-all shadow-[4px_4px_0_#000]"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

// --- Visual Battery Level Icon Indicator ---
const BatteryIcon = ({ level }: { level: number }) => {
  const roundedLevel = Math.round(level * 100);
  const isCritical = level < 0.1;
  
  // Decide color based on percentage
  let colorClass = "text-[#3aef14] stroke-[#3aef14] fill-[#3aef14]"; 
  if (isCritical) {
    colorClass = "text-red-500 stroke-red-500 fill-red-500 animate-pulse bg-red-950/45 px-1 py-0.5 border border-red-500 rounded font-black max-w-fit"; 
  } else if (level <= 0.2) {
    colorClass = "text-red-500 stroke-red-500 fill-red-500 shadow-red-500/25"; 
  } else if (level <= 0.45) {
    colorClass = "text-orange-500 stroke-orange-500 fill-orange-500"; 
  } else if (level <= 0.7) {
    colorClass = "text-yellow-500 stroke-yellow-500 fill-yellow-500"; 
  }

  return (
    <div className={`flex items-center gap-1 font-mono text-[10px] ${colorClass} select-none`} title={`Battery: ${roundedLevel}%`}>
      <svg width="22" height="12" viewBox="0 0 22 12" className={`inline-block flex-shrink-0 ${isCritical ? 'animate-bounce' : ''}`}>
        {/* Outer casing */}
        <rect x="0.5" y="1.5" width="16" height="9" rx="1.5" fill="none" className="stroke-current" strokeWidth="1.2" />
        {/* Terminal tip */}
        <path d="M18,3.5 L18,8.5" className="stroke-current" strokeWidth="1.2" strokeLinecap="round" />
        {/* Inner level charge segments */}
        <rect x="2.5" y="3.5" width={Math.max(1, 12 * level)} height="5" rx="0.5" className="fill-current stroke-none" />
      </svg>
      <span>{roundedLevel}%</span>
    </div>
  );
};

// --- Neutral Progress Level Badges ---
const AvatarBadge = ({ score, status }: { score: number; status: 'IDLE' | 'INHALING' | 'SUCCESS' | 'TAPPED_OUT' }) => {
  const getLevelConfig = () => {
    if (score <= 2) {
      return { 
        level: 1, 
        color: "#00f3ff", 
        bgColor: "rgba(0, 243, 255, 0.15)",
        svg: (
          <svg viewBox="0 0 40 40" className="w-full h-full">
            <rect x="12" y="10" width="16" height="16" rx="2" fill="none" stroke="#00f3ff" strokeWidth="2.5" />
            <circle cx="20" cy="18" r="3" fill="#00f3ff" />
            <path d="M14 26 C14 22, 26 22, 26 26" stroke="#00f3ff" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )
      };
    } else if (score <= 5) {
      return { 
        level: 2, 
        color: "#ffd700", 
        bgColor: "rgba(255, 215, 0, 0.15)",
        svg: (
          <svg viewBox="0 0 40 40" className="w-full h-full animate-pulse">
            <circle cx="20" cy="20" r="10" fill="none" stroke="#ffd700" strokeWidth="2.5" />
            <circle cx="16" cy="17" r="1.5" fill="#ffd700" />
            <circle cx="24" cy="17" r="1.5" fill="#ffd700" />
            <path d="M15 24 Q20 28, 25 24" stroke="#ffd700" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        )
      };
    } else if (score <= 9) {
      return { 
        level: 3, 
        color: "#39ff14", 
        bgColor: "rgba(57, 255, 20, 0.15)",
        svg: (
          <svg viewBox="0 0 40 40" className="w-full h-full">
            <path d="M10 22 C10 12, 30 12, 30 22 C30 28, 26 31, 20 31 C14 31, 10 28, 10 22 Z" fill="none" stroke="#39ff14" strokeWidth="2.5" />
            <path d="M14 20 Q16 24, 18 20" stroke="#3c0" strokeWidth="2" fill="none" />
            <path d="M22 20 Q24 24, 26 20" stroke="#3c0" strokeWidth="2" fill="none" />
            <ellipse cx="16" cy="18" rx="2" ry="3" fill="#39ff14" />
            <ellipse cx="24" cy="18" rx="2" ry="3" fill="#39ff14" />
            <line x1="20" y1="12" x2="20" y2="7" stroke="#39ff14" strokeWidth="2" />
            <circle cx="20" cy="6" r="1.5" fill="#39ff14" />
          </svg>
        )
      };
    } else {
      return { 
        level: 4, 
        color: "#ff007f", 
        bgColor: "rgba(255, 0, 127, 0.2)",
        svg: (
          <svg viewBox="0 0 40 40" className="w-full h-full">
            <path d="M12 18 C12 8, 28 8, 28 18 C28 26, 24 28, 24 32 L16 32 C16 28, 12 26, 12 18 Z" fill="none" stroke="#ff007f" strokeWidth="2.5" />
            <circle cx="17" cy="18" r="2.5" fill="#ff007f" />
            <circle cx="23" cy="18" r="2.5" fill="#ff007f" />
            <path d="M16 25 L24 25" stroke="#ff007f" strokeWidth="2" />
            <path d="M18 28 L22 28" stroke="#ff007f" strokeWidth="1.5" />
            <path d="M14 10 L12 6M26 10 L28 6" stroke="#ff007f" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )
      };
    }
  };

  const config = getLevelConfig();

  return (
    <div 
      className="relative flex items-center justify-center border-2 border-black w-14 h-14 transition-transform duration-300"
      style={{ 
        backgroundColor: config.bgColor, 
        borderColor: '#000',
        boxShadow: status === 'INHALING' ? `0 0 12px ${config.color}` : 'none'
      }}
    >
      <div className="w-10 h-10">
        {config.svg}
      </div>
      <div 
        className="absolute -bottom-2 -right-1 font-mono text-[7px] px-1 bg-black text-white border border-[#222]"
        style={{ color: config.color }}
      >
        LVL{config.level}
      </div>
    </div>
  );
}

// --- Vector Hardware SVG: 510-Thread Cartridge ---
const CartridgeSVG = ({ 
  oilLevel, 
  isPulsing, 
  voltage, 
  batteryLevel = 1.0, 
  isCompleted = false, 
  progress = 0 
}: { 
  oilLevel: number; 
  isPulsing: boolean; 
  voltage: number; 
  batteryLevel?: number; 
  isCompleted?: boolean; 
  progress?: number; 
}) => {
  const maxLiquidHeight = 116;
  const liquidHeight = Math.max(0, maxLiquidHeight * oilLevel);
  const liquidY = 146 - liquidHeight;
  const breathFactor = 0.5 + 0.5 * Math.sin(progress * Math.PI * 4);
  
  const skewValX = isPulsing ? `${(progress * 1.8).toFixed(2)}deg` : '0deg';
  const skewValY = isPulsing ? `${(progress * 1.0).toFixed(2)}deg` : '0deg';
  const glowVal = isPulsing ? `${(progress * 10).toFixed(1)}px` : '0px';
  const animDuration = isPulsing ? `${(0.8 - progress * 0.55).toFixed(2)}s` : '0s';

  return (
    <svg 
      width="115" 
      height="250" 
      viewBox="0 0 115 250" 
      className={`mx-auto select-none ${isPulsing ? 'anim-heat-shimmer' : ''}`} 
      referrerPolicy="no-referrer"
      style={{
        '--shimmer-skew-x': skewValX,
        '--shimmer-skew-y': skewValY,
        '--shimmer-glow': glowVal,
        '--shimmer-duration': animDuration,
      } as React.CSSProperties}
    >
      <defs>
        {/* Carbon Fiber Micro Texture pattern */}
        <pattern id="carbonPatternCart" width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="8" height="8" fill="#110a1d" />
          <path d="M0,0 L8,8 M8,0 L0,8" stroke="#251341" strokeWidth="1" opacity="0.75" />
          <path d="M0,4 L8,4 M4,0 L4,8" stroke="#370f3f" strokeWidth="0.5" opacity="0.4" />
          <circle cx="4" cy="4" r="1.2" fill="#a855f7" opacity="0.3" />
        </pattern>

        <linearGradient id="oilGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#db8e00" />
          <stop offset="15%" stopColor="#ffd700" />
          <stop offset="50%" stopColor="#fff8b5" />
          <stop offset="85%" stopColor="#ffd200" />
          <stop offset="100%" stopColor="#7a3e00" />
        </linearGradient>

        <linearGradient id="liquidTopGloss" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
          <stop offset="40%" stopColor="#ffd700" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ffd700" stopOpacity="0.0" />
        </linearGradient>
        
        <linearGradient id="metalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#222b35" />
          <stop offset="15%" stopColor="#4f5e71" />
          <stop offset="45%" stopColor="#8c9cb0" />
          <stop offset="55%" stopColor="#cbd5e1" />
          <stop offset="85%" stopColor="#4f5e71" />
          <stop offset="100%" stopColor="#1a2027" />
        </linearGradient>

        <linearGradient id="goldCapGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#632c04" />
          <stop offset="20%" stopColor="#b45309" />
          <stop offset="45%" stopColor="#f59e0b" />
          <stop offset="55%" stopColor="#fef08a" />
          <stop offset="80%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#3d1802" />
        </linearGradient>

        <linearGradient id="batteryBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#080312" />
          <stop offset="30%" stopColor="#17072a" />
          <stop offset="70%" stopColor="#300d53" />
          <stop offset="100%" stopColor="#020004" />
        </linearGradient>

        <linearGradient id="glassReflection" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.05" />
          <stop offset="15%" stopColor="#ffffff" stopOpacity="0.32" />
          <stop offset="25%" stopColor="#ffffff" stopOpacity="0.08" />
          <stop offset="75%" stopColor="#ffffff" stopOpacity="0.0" />
          <stop offset="90%" stopColor="#ffffff" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.55" />
        </linearGradient>
      </defs>

      <style>{`
        @keyframes led-heartbeat-cart {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.55; }
        }
        .animate-led-heartbeat {
          animation: led-heartbeat-cart 2.2s infinite ease-in-out;
        }
        @keyframes heat-shimmer-anim {
          0%, 100% {
            transform: skew(var(--shimmer-skew-x, 0deg), var(--shimmer-skew-y, 0deg)) scale(1);
            filter: drop-shadow(0 0 var(--shimmer-glow, 0px) rgba(239, 68, 68, 0.45));
          }
          50% {
            transform: skew(calc(-1 * var(--shimmer-skew-x, 0deg)), calc(-1 * var(--shimmer-skew-y, 0deg))) scale(1.02);
            filter: drop-shadow(0 0 calc(1.6 * var(--shimmer-glow, 0px)) rgba(239, 68, 68, 0.7)) saturate(1.55) contrast(1.2) blur(0.2px);
          }
        }
        .anim-heat-shimmer {
          animation: heat-shimmer-anim var(--shimmer-duration, 0.8s) infinite ease-in-out;
          transform-origin: bottom center;
        }
        @keyframes bubbles-float {
          0% { transform: translateY(0px) scale(0.9); opacity: 0.3; }
          50% { transform: translateY(-7px) scale(1.1); opacity: 0.85; }
          100% { transform: translateY(-16px) scale(0.85); opacity: 0; }
        }
        .anim-bubble-float-fast {
          animation: bubbles-float 1.1s infinite ease-in-out;
        }
        .anim-bubble-float-slow {
          animation: bubbles-float 2.0s infinite ease-in-out;
        }
      `}</style>

      {/* Glossy Mouthpiece with Premium Ceramic Curved details */}
      <path d="M44,4 C44,0.8 47.5,0.2 57.5,0.2 C67.5,0.2 71,0.8 71,4 L71,24 L44,24 Z" fill="#111113" stroke="#000" strokeWidth="2.5" />
      {/* Specular mouthpiece light reflections */}
      <path d="M47,3.5 C47,1.5 50.5,0.8 57.5,0.8" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <path d="M68,5 L68,22" stroke="#ffffff" strokeWidth="0.8" opacity="0.15" />
      
      {/* Metallic collar below mouthpiece */}
      <rect x="38" y="24" width="39" height="5" fill="url(#metalGrad)" stroke="#000" strokeWidth="2" />
      {/* 510 O-ring spacer */}
      <rect x="39" y="28" width="37" height="2" fill="#ef4444" opacity="0.8" />

      {/* Cartridge Glass Outer Body with high detail chamfers */}
      <rect x="35" y="30" width="45" height="120" rx="4" fill="rgba(255,255,255,0.02)" stroke="#000" strokeWidth="2.5" />
      {/* Inner glass reflection overlay */}
      <rect x="36" y="31.5" width="43" height="117" rx="3" fill="url(#glassReflection)" pointerEvents="none" />
      
      {/* Volumetric marks & fine measurements */}
      <line x1="36" y1="42" x2="42" y2="42" stroke="#ffffff" strokeWidth="1.2" opacity="0.6" />
      <text x="45" y="44" fontSize="5.5" fontFamily="monospace" fill="#ffffff" fontWeight="bold" opacity="0.6">1.0ml</text>
      <line x1="36" y1="70" x2="40" y2="70" stroke="#ffffff" strokeWidth="0.8" opacity="0.4" />
      <line x1="36" y1="98" x2="42" y2="98" stroke="#ffffff" strokeWidth="1.2" opacity="0.6" />
      <text x="45" y="100" fontSize="5.5" fontFamily="monospace" fill="#ffffff" fontWeight="bold" opacity="0.6">0.5ml</text>
      <line x1="36" y1="126" x2="40" y2="126" stroke="#ffffff" strokeWidth="0.8" opacity="0.4" />

      {/* Glass tube side refractions */}
      <rect x="35.5" y="30.5" width="2" height="119" fill="#fff" opacity="0.2" />
      <rect x="77.5" y="30.5" width="2" height="119" fill="#000" opacity="0.35" />

      {/* Central Metallic Chimney and Core Pole */}
      <rect x="53" y="30" width="9" height="120" fill="url(#metalGrad)" stroke="#111" strokeWidth="1.2" />
      
      {/* Heating Coil Wire Winding on core base (active pulsing visuals!) */}
      {isPulsing && (
        <g opacity={0.35 + 0.65 * breathFactor}>
          <rect x="52.5" y="125" width="10" height="18" fill="#f97316" opacity="0.35" filter="blur(2px)" />
          <path d="M53,127 L62,129 M53,131 L62,133 M53,135 L62,137 M53,139 L62,141" stroke="#ff4500" strokeWidth="1.6" className="animate-pulse" />
          <path d="M53,128 L62,130 M53,132 L62,134 M53,136 L62,138 M53,140 L62,142" stroke="#ffea00" strokeWidth="0.8" className="animate-pulse" />
        </g>
      )}

      {/* Base Air Hole intake ports */}
      <circle cx="55.5" cy="142" r="1.5" fill="#111" stroke="#444" strokeWidth="0.5" />
      <circle cx="59.5" cy="142" r="1.5" fill="#111" stroke="#444" strokeWidth="0.5" />

      {/* Golden THC/CBD Premium Oil layer */}
      {liquidHeight > 0 && (
        <g>
          {/* Main oil column */}
          <rect 
            x="37.5" 
            y={liquidY} 
            width="40" 
            height={liquidHeight} 
            fill="url(#oilGrad)" 
            opacity="0.95" 
            rx="1.5"
            className="transition-all duration-300 ease-out"
          />
          {/* Surface Meniscus Lens Gloss (Top Curve) */}
          <ellipse 
            cx="57.5" 
            cy={liquidY} 
            rx="20" 
            ry="3.5" 
            fill="url(#liquidTopGloss)" 
            opacity="0.9" 
            className="transition-all duration-300 ease-out"
          />
          {/* Specular high-light curve on meniscus */}
          <path 
            d={`M 39,${liquidY - 0.5} Q 57.5,${liquidY + 2} 76,${liquidY - 0.5}`} 
            fill="none" 
            stroke="#ffffff" 
            strokeWidth="1.5" 
            opacity="0.75"
            className="transition-all duration-300 ease-out"
          />
        </g>
      )}

      {/* Floating immersive bubbles in oil */}
      {liquidHeight > 18 && (
        <g>
          {/* Static organic bubbles */}
          <circle cx="47" cy={liquidY + liquidHeight - 14} r="3" fill="#ffffff" opacity="0.5" />
          <circle cx="47.5" cy={liquidY + liquidHeight - 14.5} r="1.2" fill="#ffd700" opacity="0.9" />
          
          <circle cx="68" cy={liquidY + liquidHeight - 25} r="2" fill="#ffffff" opacity="0.45" />
          <circle cx="43" cy={liquidY + 22} r="1.8" fill="#ffffff" opacity="0.6" />
          <circle cx="73" cy={liquidY + 38} r="1.5" fill="#ffd700" opacity="0.55" />
          <circle cx="46" cy={liquidY + (liquidHeight * 0.55)} r="1.2" fill="#ffffff" opacity="0.5" />

          {/* Active vaping bubble stream */}
          {isPulsing && (
            <g>
              <circle cx="45" cy={liquidY + 45} r="2" fill="#ffffff" className="anim-bubble-float-fast" />
              <circle cx="71" cy={liquidY + 60} r="1.5" fill="#f59e0b" className="anim-bubble-float-slow" />
              <circle cx="49" cy={liquidY + (liquidHeight * 0.75)} r="1.3" fill="#ffffff" className="anim-bubble-float-fast" />
              <circle cx="67" cy={liquidY + 30} r="2.3" fill="#ffffff" className="anim-bubble-float-slow" />
            </g>
          )}
        </g>
      )}

      {/* Base Thread connection collar */}
      <rect x="35" y="150" width="45" height="14" fill="url(#metalGrad)" stroke="#000" strokeWidth="2.5" />
      <rect x="42" y="153" width="31" height="3" fill="#111" />

      {/* Gold-plated 510 thread lines */}
      <rect x="45" y="164" width="25" height="6" fill="url(#goldCapGrad)" stroke="#000" strokeWidth="1.2" />
      <line x1="45" y1="166" x2="70" y2="166" stroke="#000" strokeWidth="1.2" />
      <line x1="45" y1="168" x2="70" y2="168" stroke="#000" strokeWidth="1.2" />

      {/* 510 Box Mod Body Base component */}
      <rect x="20" y="170" width="75" height="74" rx="10" fill="url(#batteryBodyGrad)" stroke="#000" strokeWidth="3" />
      
      {/* Solid Aluminum Sides Accent */}
      <rect x="22" y="176" width="3" height="60" fill="url(#metalGrad)" opacity="0.9" />
      <rect x="90" y="176" width="3" height="60" fill="url(#metalGrad)" opacity="0.9" />
      
      {/* Pattern Grid on center for luxury finish */}
      <rect x="28" y="175" width="59" height="64" rx="5" fill="url(#carbonPatternCart)" opacity="0.45" pointerEvents="none" />
      <rect x="28" y="175" width="59" height="64" rx="5" fill="none" stroke="#2c144e" strokeWidth="1.5" opacity="0.6" />

      {/* Micro OLED Dashboard Panel Screen */}
      <rect x="32" y="178" width="51" height="25" rx="3.5" fill="#000000" stroke={batteryLevel < 0.1 ? "#ef4444" : "#00f3ff"} strokeWidth="1.5" className={batteryLevel < 0.1 ? "animate-pulse" : ""} />
      
      {/* Screen Readouts */}
      <text x="57.5" y="186.5" fontSize="6.8" fontFamily="'Share Tech Mono', monospace" fill={batteryLevel < 0.1 ? "#ef4444" : "#39ff14"} textAnchor="middle" fontWeight="black" className={batteryLevel < 0.1 ? "animate-pulse font-extrabold" : ""}>
        BAT {Math.round(batteryLevel * 100)}%
      </text>
      <text x="57.5" y="198" fontSize="6.8" fontFamily="'Share Tech Mono', monospace" fill="#ffd700" textAnchor="middle" fontWeight="black">
        PWR {voltage.toFixed(1)}V
      </text>
      <text x="78" y="186.5" fontSize="4.2" fontFamily="monospace" fill="#71717a" textAnchor="end">0.8Ω</text>

      {/* Metallic Firing controller button */}
      <rect x="46" y="206" width="23" height="8" rx="2" fill="url(#metalGrad)" stroke="#000" strokeWidth="1.5" />
      <circle cx="57.5" cy="210" r="1.8" fill={isPulsing ? "#39ff14" : "#22c55e"} />

      {/* Decorative LED Indicator Halo ring */}
      <circle 
        cx="57.5" 
        cy="210" 
        r="5" 
        fill="none" 
        stroke="#ff007f" 
        strokeWidth="2" 
        className={isCompleted ? "animate-blink-rapid" : !isPulsing ? "animate-led-heartbeat" : ""} 
        style={{
          transition: "opacity 0.4s ease-in-out, filter 0.4s ease-in-out",
          opacity: isCompleted ? 1 : isPulsing ? 0.3 + 0.7 * breathFactor : 0.15,
          filter: isCompleted 
            ? 'drop-shadow(0 0 12px #ff007f)' 
            : isPulsing 
              ? `drop-shadow(0 0 ${4 + breathFactor * 12}px #ff007f)` 
              : 'drop-shadow(0 0 2px #ff007f)'
        }}
      />

      {/* Premium glowing light on bottom base */}
      <rect x="34" y="238" width="47" height="4.5" rx="1.5" fill="#18181b" stroke="#000" strokeWidth="1.2" />
      <ellipse 
        cx="57.5" 
        cy="237" 
        rx="16" 
        ry="3" 
        fill="#00f3ff" 
        className={isCompleted ? "animate-blink-rapid" : !isPulsing ? "animate-led-heartbeat" : ""} 
        style={{ 
          transition: "opacity 0.4s ease-in-out, filter 0.4s ease-in-out, rx 0.4s ease-in-out",
          opacity: isCompleted ? 1 : isPulsing ? 0.3 + 0.7 * breathFactor : 0.15,
          filter: isCompleted 
            ? 'drop-shadow(0 0 12px #00f3ff)' 
            : isPulsing 
              ? `drop-shadow(0 0 ${4 + breathFactor * 12}px #00f3ff)` 
              : 'drop-shadow(0 0 2px #00f3ff)',
          rx: isCompleted ? 16 : isPulsing ? Math.max(5, 16 * breathFactor) : 13
        }} 
      />
    </svg>
  );
};

// --- Vector Hardware SVG: Disposable Box Vape ---
const DisposableVapeSVG = ({ 
  isPulsing, 
  oilLevel = 1.0, 
  batteryLevel = 1.0, 
  voltage, 
  isCompleted = false, 
  progress = 0 
}: { 
  isPulsing: boolean; 
  oilLevel?: number; 
  batteryLevel?: number; 
  voltage: number; 
  isCompleted?: boolean; 
  progress?: number; 
}) => {
  const dispoLiquidHeight = Math.max(0, 72 * oilLevel);
  const dispoLiquidY = 112 - dispoLiquidHeight;
  const breathFactor = 0.5 + 0.5 * Math.sin(progress * Math.PI * 4);
  
  const skewValX = isPulsing ? `${(progress * 1.8).toFixed(2)}deg` : '0deg';
  const skewValY = isPulsing ? `${(progress * 1.0).toFixed(2)}deg` : '0deg';
  const glowVal = isPulsing ? `${(progress * 10).toFixed(1)}px` : '0px';
  const animDuration = isPulsing ? `${(0.8 - progress * 0.55).toFixed(2)}s` : '0s';

  return (
    <svg 
      width="115" 
      height="225" 
      viewBox="0 0 115 225" 
      className={`mx-auto select-none ${isPulsing ? 'anim-heat-shimmer' : ''}`} 
      referrerPolicy="no-referrer"
      style={{
        '--shimmer-skew-x': skewValX,
        '--shimmer-skew-y': skewValY,
        '--shimmer-glow': glowVal,
        '--shimmer-duration': animDuration,
      } as React.CSSProperties}
    >
      <defs>
        {/* Carbon Fiber Micro Texture pattern */}
        <pattern id="carbonPatternCartDispo" width="6" height="6" patternUnits="userSpaceOnUse">
          <rect width="6" height="6" fill="#0c0716" />
          <path d="M0,0 L6,6 M6,0 L0,6" stroke="#23133f" strokeWidth="0.8" opacity="0.65" />
        </pattern>

        <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1a0b32" />
          <stop offset="30%" stopColor="#2c1254" />
          <stop offset="65%" stopColor="#140627" />
          <stop offset="100%" stopColor="#05010c" />
        </linearGradient>

        <linearGradient id="battCylinderGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1d1e5d" />
          <stop offset="25%" stopColor="#312e81" />
          <stop offset="50%" stopColor="#4338ca" />
          <stop offset="75%" stopColor="#6366f1" />
          <stop offset="90%" stopColor="#3730a3" />
          <stop offset="100%" stopColor="#1b124a" />
        </linearGradient>

        <linearGradient id="cottonWickGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#44403c" />
          <stop offset="40%" stopColor="#78716c" />
          <stop offset="60%" stopColor="#a8a29e" />
          <stop offset="100%" stopColor="#292524" />
        </linearGradient>

        <linearGradient id="dispoGloss" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.15" />
          <stop offset="30%" stopColor="#ffffff" stopOpacity="0.05" />
          <stop offset="60%" stopColor="#ffffff" stopOpacity="0.0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.55" />
        </linearGradient>
      </defs>

      <style>{`
        @keyframes led-heartbeat-dispo {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.45; }
        }
        .animate-led-heartbeat-dispo {
          animation: led-heartbeat-dispo 2.2s infinite ease-in-out;
        }
        @keyframes heat-shimmer-anim {
          0%, 100% {
            transform: skew(var(--shimmer-skew-x, 0deg), var(--shimmer-skew-y, 0deg)) scale(1);
            filter: drop-shadow(0 0 var(--shimmer-glow, 0px) rgba(239, 68, 68, 0.4));
          }
          50% {
            transform: skew(calc(-1 * var(--shimmer-skew-x, 0deg)), calc(-1 * var(--shimmer-skew-y, 0deg))) scale(1.015);
            filter: drop-shadow(0 0 calc(1.5 * var(--shimmer-glow, 0px)) rgba(239, 68, 68, 0.6)) saturate(1.4) contrast(1.15) blur(0.3px);
          }
        }
        .anim-heat-shimmer {
          animation: heat-shimmer-anim var(--shimmer-duration, 0.8s) infinite ease-in-out;
          transform-origin: bottom center;
        }
      `}</style>

      {/* Ergonomic glossy mouthpiece cap */}
      <path d="M46,14 L68,14 L64,28 L50,28 Z" fill="#141416" stroke="#000" strokeWidth="2.5" />
      <path d="M49,16.5 L60,16.5" stroke="#fff" strokeWidth="1" opacity="0.32" strokeLinecap="round" />
      <rect x="50" y="28" width="14" height="2" fill="#52525b" />

      {/* Main Chassis Box body */}
      <rect x="24" y="30" width="67" height="146" rx="11" fill="url(#bodyGrad)" stroke="#000" strokeWidth="3" />
      
      {/* Translucent premium gloss overlay panel */}
      <rect x="25.5" y="31.5" width="64" height="143" rx="10" fill="url(#dispoGloss)" pointerEvents="none" />

      {/* Internal Schematic/Hardware detailing */}
      {/* Internal Li-po battery cylinder cell */}
      <rect x="30" y="38" width="18" height="74" rx="3.5" fill="url(#battCylinderGrad)" stroke="#000" strokeWidth="1" opacity="0.5" />
      <text x="39" y="80" fontSize="3.8" fontFamily="monospace" fill="#818cf8" textAnchor="middle" transform="rotate(-90 39 80)" letterSpacing="0.8" opacity="0.75" fontWeight="bold">LI-PO Cell 3.7V</text>
      <rect x="36" y="35" width="6" height="3" fill="#171717" stroke="#000" strokeWidth="1" opacity="0.5" />

      {/* Cotton atomizing heating element core */}
      <rect x="52" y="38" width="15" height="74" rx="2" fill="url(#cottonWickGrad)" stroke="#1c1917" strokeWidth="1" opacity="0.6" />
      {/* Heating core wire mesh wound detailing */}
      <path d="M52,50 L67,54 M52,57 L67,61 M52,64 L67,68 M52,71 L67,75 M52,78 L67,82 M52,85 L67,89" 
        stroke={isPulsing ? "#f97316" : "#7c2d12"} 
        strokeWidth="1.8" 
        fill="none" 
        opacity={0.6 + 0.4 * breathFactor} 
        style={{ filter: isPulsing ? 'drop-shadow(0 0 6px #ea580c)' : 'none' }}
      />
      
      {/* Embedded transparent physical glass oil window */}
      <rect x="71" y="38" width="13" height="74" rx="2.5" fill="rgba(255,255,255,0.03)" stroke="#111" strokeWidth="1.5" opacity="0.85" />
      <rect x="72" y="39" width="11" height="72" rx="1.5" fill="url(#dispoGloss)" opacity="0.4" pointerEvents="none" />
      {/* Measurement guidelines */}
      <line x1="71" y1="56" x2="74" y2="56" stroke="#ffffff" strokeWidth="0.8" opacity="0.65" />
      <line x1="71" y1="75" x2="74" y2="75" stroke="#ffffff" strokeWidth="0.8" opacity="0.65" />
      <line x1="71" y1="94" x2="74" y2="94" stroke="#ffffff" strokeWidth="0.8" opacity="0.65" />
      
      {/* Golden active capturing oil levels */}
      {dispoLiquidHeight > 0 && (
        <g>
          {/* Main liquid column */}
          <rect 
            x="72" 
            y={dispoLiquidY} 
            width="11" 
            height={dispoLiquidHeight} 
            fill="url(#oilGrad)" 
            opacity="0.96" 
            rx="1"
            className="transition-all duration-300 ease-out"
          />
          {/* Top curve highlight */}
          <ellipse 
            cx="77.5" 
            cy={dispoLiquidY} 
            rx="5.5" 
            ry="1.8" 
            fill="#ffd700" 
            opacity="0.45" 
            className="transition-all duration-300 ease-out"
          />
        </g>
      )}

      {/* Floating micro bubbles inside disposable window */}
      {dispoLiquidHeight > 12 && (
        <g>
          <circle cx="76" cy={dispoLiquidY + dispoLiquidHeight - 10} r="1.5" fill="#ffffff" opacity="0.8" />
          <circle cx="76.5" cy={dispoLiquidY + dispoLiquidHeight - 10.5} r="0.6" fill="#ffd700" opacity="0.95" />
          <circle cx="79" cy={dispoLiquidY + 16} r="1" fill="#ffffff" opacity="0.7" />
          <circle cx="74" cy={dispoLiquidY + (dispoLiquidHeight * 0.45)} r="0.8" fill="#ffd700" opacity="0.5" />
          {isPulsing && (
            <g>
              <circle cx="76" cy={dispoLiquidY + 22} r="1.2" fill="#ffffff" className="anim-bubble-float-fast" />
              <circle cx="79" cy={dispoLiquidY + 34} r="0.9" fill="#ffffff" className="anim-bubble-float-slow" />
            </g>
          )}
        </g>
      )}

      {/* Printed circuit board (PCB) traces inside */}
      <g stroke="#ffffff" strokeWidth="0.7" opacity="0.14" fill="none">
        <path d="M 45,45 L 48,49 L 48,82 L 44,86" />
        <path d="M 71,36 L 71,64 L 68,68" />
        <circle cx="45" cy="45" r="1.2" fill="#fff" />
        <circle cx="71" cy="36" r="1.2" fill="#fff" />
        <circle cx="68" cy="68" r="1.2" fill="#fff" />
      </g>

      {/* Mesh carbon grip side plates */}
      <rect x="25" y="116" width="6" height="48" fill="url(#carbonPatternCartDispo)" opacity="0.8" />
      <rect x="84" y="116" width="6" height="48" fill="url(#carbonPatternCartDispo)" opacity="0.8" />
      <line x1="31" y1="116" x2="31" y2="164" stroke="#000" strokeWidth="1" />
      <line x1="84" y1="116" x2="84" y2="164" stroke="#000" strokeWidth="1" />

      {/* High-visibility active neon accent stripes */}
      <rect x="24.5" y="48" width="3" height="52" fill="#00f3ff" opacity="0.85" />
      <rect x="87.5" y="48" width="3" height="52" fill="#ff007f" opacity="0.85" />

      {/* Authentic branding decals */}

      {/* Real-time telemetry dashboard OLED readout screen */}
      <text x="57.5" y="68" fontSize="7.5" fontFamily="'Share Tech Mono', monospace" fill="#39ff14" textAnchor="middle" fontWeight="bold" letterSpacing="-0.2">{voltage.toFixed(1)} VOLT</text>
      <text x="57.5" y="78" fontSize="7.5" fontFamily="'Share Tech Mono', monospace" fill={batteryLevel < 0.1 ? "#ef4444" : "#00f3ff"} textAnchor="middle" fontWeight="bold" letterSpacing="-0.2" className={batteryLevel < 0.1 ? "animate-pulse" : ""}>BAT {Math.round(batteryLevel * 100)}%</text>
      
      {/* Screen Charge horizontal slider bar indicator */}
      <rect x="41" y="83" width="33" height="5.5" rx="2.5" fill="#090514" stroke="#444" strokeWidth="1.2" />
      <rect x="42" y="84" width={Math.max(0, 31 * batteryLevel)} height="3.5" rx="1.5" fill={batteryLevel < 0.1 ? "#ef4444" : batteryLevel > 0.25 ? "#39ff14" : "#ff007f"} className={batteryLevel < 0.1 ? "animate-pulse" : ""} />
      
      {/* Internal readout readout */}
      <rect x="41" y="94" width="33" height="15" rx="3.2" fill="#090514" stroke="#2c1a4e" strokeWidth="1.2" />
      <text x="57.5" y="104" fontSize="6.5" fontFamily="monospace" fill={isPulsing ? "#ff007f" : "#666"} fontWeight="bold" textAnchor="middle" letterSpacing="0.6">
        {isPulsing ? "DRAWING" : "STANDBY"}
      </text>

      {/* Large Glowing Center Breathing LED Ring */}
      <circle cx="57.5" cy="136" r="9.5" fill="#06020c" stroke="#22133a" strokeWidth="1.8" />
      <circle 
        cx="57.5" 
        cy="136" 
        r="6.5" 
        fill="#39ff14" 
        className={isCompleted ? "animate-blink-rapid" : !isPulsing ? "animate-led-heartbeat-dispo" : ""} 
        style={{
          transition: "opacity 0.4s ease-in-out, filter 0.4s ease-in-out, fill 0.4s ease-in-out",
          opacity: isCompleted ? 1 : isPulsing ? 0.3 + 0.7 * breathFactor : 0.15,
          filter: isCompleted 
            ? 'drop-shadow(0 0 12px #39ff14)' 
            : isPulsing 
              ? `drop-shadow(0 0 ${4 + breathFactor * 12}px #39ff14)` 
              : 'drop-shadow(0 0 2px #39ff14)',
          fill: isCompleted || isPulsing ? "#39ff14" : "#173b11"
        }}
      />

      {/* Realistic ventilation slide regulator slots */}
      <rect x="41" y="172" width="33" height="9" rx="1.5" fill="#18181b" stroke="#000" strokeWidth="2" />
      <line x1="47" y1="176" x2="47" y2="179" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="53" y1="176" x2="53" y2="179" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="59" y1="176" x2="59" y2="179" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="65" y1="176" x2="65" y2="179" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
};

const MuhaMedsSVG = ({ 
  isPulsing, 
  oilLevel = 1.0, 
  batteryLevel = 1.0, 
  voltage, 
  isCompleted = false, 
  progress = 0 
}: { 
  isPulsing: boolean; 
  oilLevel?: number; 
  batteryLevel?: number; 
  voltage: number; 
  isCompleted?: boolean; 
  progress?: number; 
}) => {
  const muhaLiquidHeight = Math.max(0, 105 * oilLevel);
  const muhaLiquidY = 143 - muhaLiquidHeight;
  const breathFactor = 0.5 + 0.5 * Math.sin(progress * Math.PI * 4);

  const skewValX = isPulsing ? `${(progress * 1.8).toFixed(2)}deg` : '0deg';
  const skewValY = isPulsing ? `${(progress * 1.0).toFixed(2)}deg` : '0deg';
  const glowVal = isPulsing ? `${(progress * 10).toFixed(1)}px` : '0px';
  const animDuration = isPulsing ? `${(0.8 - progress * 0.55).toFixed(2)}s` : '0s';

  return (
    <svg 
      width="115" 
      height="225" 
      viewBox="0 0 115 225" 
      className={`mx-auto select-none ${isPulsing ? 'anim-heat-shimmer' : ''}`}
      style={{
        '--shimmer-skew-x': skewValX,
        '--shimmer-skew-y': skewValY,
        '--shimmer-glow': glowVal,
        '--shimmer-duration': animDuration,
      } as React.CSSProperties}
    >
      <defs>
        {/* Luxury premium gold metal gradients */}
        <linearGradient id="postGold" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8a6f27" />
          <stop offset="20%" stopColor="#ffd700" />
          <stop offset="40%" stopColor="#fff3b0" />
          <stop offset="60%" stopColor="#fdf6d2" />
          <stop offset="80%" stopColor="#ffd700" />
          <stop offset="100%" stopColor="#5d4c1b" />
        </linearGradient>

        <linearGradient id="muhaOilGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8c5b00" />
          <stop offset="15%" stopColor="#ffc700" />
          <stop offset="50%" stopColor="#fff7b0" />
          <stop offset="85%" stopColor="#ffb900" />
          <stop offset="100%" stopColor="#452a00" />
        </linearGradient>

        <linearGradient id="muhaGloss" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
          <stop offset="25%" stopColor="#ffffff" stopOpacity="0.08" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.0" />
          <stop offset="75%" stopColor="#000000" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.8" />
        </linearGradient>

        <linearGradient id="muhaBodyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0a0a0b" />
          <stop offset="15%" stopColor="#222226" />
          <stop offset="50%" stopColor="#141416" />
          <stop offset="85%" stopColor="#1b1b1d" />
          <stop offset="100%" stopColor="#050506" />
        </linearGradient>

        {/* Diagonal carbon fiber style shader pattern block */}
        <pattern id="carbonMesh" width="4" height="4" patternUnits="userSpaceOnUse">
          <path d="M0 4 L4 0 M0 0 L4 4" stroke="#ffffff" strokeWidth="0.5" opacity="0.04" />
        </pattern>
      </defs>

      {/* Styled Mouthpiece matching the skinny black Muha image */}
      <path d="M42,10 L73,10 L68,28 L47,28 Z" fill="#18181b" stroke="#000" strokeWidth="2.5" />
      <path d="M44,12.5 L71,12.5" stroke="#fff" strokeWidth="1" opacity="0.3" strokeLinecap="round" />
      <rect x="47" y="28" width="21" height="4" fill="url(#postGold)" stroke="#000" strokeWidth="1" />

      {/* Main Chassis Box body (skinny black design) */}
      <rect x="22" y="32" width="71" height="152" rx="10" fill="url(#muhaBodyGrad)" stroke="#000" strokeWidth="3" />
      <rect x="22" y="32" width="71" height="152" rx="10" fill="url(#carbonMesh)" pointerEvents="none" />
      
      {/* 3D Chassis gold bevel lines */}
      <rect x="24" y="34" width="67" height="148" rx="8" fill="none" stroke="url(#postGold)" strokeWidth="0.8" opacity="0.35" />

      {/* Glossy overlay on main body */}
      <rect x="23.5" y="33.5" width="68" height="149" rx="8.5" fill="url(#muhaGloss)" pointerEvents="none" opacity="0.9" />

      {/* Golden oil window on left side (skinny, detailed) */}
      <g>
        {/* Casing glass frame */}
        <rect x="27" y="38" width="18" height="107" rx="3.5" fill="rgba(0,0,0,0.7)" stroke="#111" strokeWidth="1.5" />
        <rect x="28" y="39" width="16" height="105" rx="2.5" fill="rgba(255,215,0,0.02)" />

        {/* Back Grid Scale ticks on Glass Chamber */}
        <g stroke="url(#postGold)" strokeWidth="0.4" opacity="0.25">
          <line x1="28" y1="50" x2="31" y2="50" />
          <line x1="28" y1="65" x2="31" y2="65" />
          <line x1="28" y1="80" x2="31" y2="80" />
          <line x1="28" y1="95" x2="31" y2="95" />
          <line x1="28" y1="110" x2="31" y2="110" />
          <line x1="28" y1="125" x2="31" y2="125" />
          <line x1="28" y1="140" x2="31" y2="140" />
        </g>

        {/* Central Core/Chimney (Gold post with intricate coil ridges) */}
        <rect x="33.5" y="38" width="5" height="107" fill="url(#postGold)" stroke="#000" strokeWidth="0.5" />
        <line x1="33.5" y1="48" x2="38.5" y2="48" stroke="#000" strokeWidth="0.4" opacity="0.5" />
        <line x1="33.5" y1="68" x2="38.5" y2="68" stroke="#000" strokeWidth="0.4" opacity="0.5" />
        <line x1="33.5" y1="88" x2="38.5" y2="88" stroke="#000" strokeWidth="0.4" opacity="0.5" />
        <line x1="33.5" y1="108" x2="38.5" y2="108" stroke="#000" strokeWidth="0.4" opacity="0.5" />
        <line x1="33.5" y1="128" x2="38.5" y2="128" stroke="#000" strokeWidth="0.4" opacity="0.5" />

        <ellipse cx="36" cy="132" rx="4" ry="3" fill="url(#postGold)" stroke="#000" strokeWidth="0.5" />
        <circle cx="36" cy="132" r="1.3" fill="#fff" opacity="0.9" />

        {/* Dynamic Golden Oil level */}
        {muhaLiquidHeight > 0 && (
          <g>
            <rect 
              x="28" 
              y={muhaLiquidY} 
              width="16" 
              height={muhaLiquidHeight} 
              fill="url(#muhaOilGrad)" 
              opacity="0.96" 
              rx="1.5"
            />
            {/* Liquid surface ellipse with warm glow shine */}
            <ellipse 
              cx="36" 
              cy={muhaLiquidY} 
              rx="8" 
              ry="2" 
              fill="#fff" 
              opacity="0.65" 
            />
            <ellipse 
              cx="36" 
              cy={muhaLiquidY + 1.2} 
              rx="7" 
              ry="1.2" 
              fill="#ffe566" 
              opacity="0.9" 
            />
          </g>
        )}

        {/* Floating micro bubbles in Muha window */}
        {muhaLiquidHeight > 15 && (
          <g>
            <circle cx="33" cy={muhaLiquidY + muhaLiquidHeight - 8} r="1.1" fill="#ffffff" opacity="0.85" />
            <circle cx="38" cy={muhaLiquidY + 12} r="0.8" fill="#ffffff" opacity="0.75" />
            <circle cx="31.5" cy={muhaLiquidY + (muhaLiquidHeight * 0.5)} r="1.3" fill="url(#postGold)" opacity="0.8" />
            <circle cx="41.2" cy={muhaLiquidY + (muhaLiquidHeight * 0.75)} r="0.6" fill="#ffffff" opacity="0.5" />
            {isPulsing && (
              <g>
                <circle cx="33.5" cy={muhaLiquidY + 25} r="0.9" fill="#ffffff" className="anim-bubble-float-fast" />
                <circle cx="38.5" cy={muhaLiquidY + 45} r="0.6" fill="#ffffff" className="anim-bubble-float-slow" />
                <circle cx="31" cy={muhaLiquidY + 60} r="0.5" fill="#ffffff" className="anim-bubble-float-fast" />
              </g>
            )}
          </g>
        )}

        {/* Left window glass reflection specular ribbon */}
        <rect x="28" y="39" width="3.2" height="105" fill="#ffffff" opacity="0.22" rx="0.5" />
        <rect x="42" y="39" width="1.2" height="105" fill="#ffffff" opacity="0.1" />
      </g>

      {/* Right side black body: Detailed Gold Crest "MM" drip logo */}
      <g>
        {/* Dripping Gold circular seal frame */}
        <circle cx="68" cy="72" r="15.5" fill="#18181b" stroke="url(#postGold)" strokeWidth="2.5" />
        <circle cx="68" cy="72" r="13" fill="none" stroke="url(#postGold)" strokeWidth="0.6" strokeDasharray="1.5,1.5" />

        {/* Crown logo / emblem element inside seal */}
        <path d="M 61,64.2 Q 64.5,62.2 68,63.7 Q 71.5,62.2 75,64.2 L 76,69.5 L 60,69.5 Z" fill="url(#postGold)" stroke="#000" strokeWidth="0.5" />
        <circle cx="61" cy="63" r="0.8" fill="url(#postGold)" />
        <circle cx="68" cy="62" r="0.8" fill="url(#postGold)" />
        <circle cx="75" cy="63" r="0.8" fill="url(#postGold)" />

        {/* Classic Drippy drip shapes below circle */}
        <path d="M52.5,74 C52.5,92 83.5,92 83.5,74 Q 68,97 52.5,74 Z" fill="url(#postGold)" opacity="0.95" />
        <path d="M68,85.5 Q 68.2,96 69.5,98 Q 70.8,96 71,85.5 Z M58.5,81.5 Q 59,89.5 60,91.5 Z M77.5,81.5 Q 77,89.5 76,91.5 Z" fill="url(#postGold)" />
        
        {/* Falling golden oil droplets */}
        <circle cx="69.5" cy="102" r="1.8" fill="url(#postGold)" />
        <circle cx="60" cy="94.5" r="1.3" fill="url(#postGold)" />
        <circle cx="76" cy="95.5" r="1.3" fill="url(#postGold)" />

        {/* Inner detailed letters "M" and "M" stylized */}
        <path d="M59.5,68.5 L63,68.5 L65.5,73.5 L68,68.5 L70.5,73.5 L73,68.5 L76.5,68.5 L74.5,75.5 L71.5,75.5 L68.5,71 L65.5,75.5 L62.5,75.5 Z" fill="#ffffff" />
        <path d="M60.5,70.5 L63,70.5 L65.5,75 L68,70.5 L70.5,75 L73,70.5 L75.5,70.5 L74,74.5 L71.5,74.5 L68,71 L64.5,74.5 L62,74.5 Z" fill="url(#postGold)" />

        {/* "2019" micro label */}
        <text x="68" y="80" fontSize="3" fontFamily="monospace" fill="#0d0d0f" textAnchor="middle" fontWeight="bold">2019</text>
      </g>

      {/* NEW HYPER DETAILED PREMIUM GOLD PLAQUE (Completely Replaces WATERMELON OG) */}
      <g transform="translate(68, 134)">
        {/* Plaque Background outer gold border */}
        <rect x="-24" y="-12" width="48" height="24" rx="4" fill="#0d0d0f" stroke="url(#postGold)" strokeWidth="1.8" />
        {/* Inner shadow/offset line */}
        <rect x="-21.5" y="-9.5" width="43" height="19" rx="2.5" fill="#121214" stroke="url(#postGold)" strokeWidth="0.5" opacity="0.4" />
        
        {/* Beautiful high detail vector micro crest wreaths */}
        <path d="M-20,-7 C-19,-10 -15,-9 -17,-6 C-19,-3 -20,-7 -20,-7" stroke="url(#postGold)" strokeWidth="0.8" fill="none" opacity="0.6" />
        <path d="M20,-7 C19,-10 15,-9 17,-6 C19,-3 20,-7 20,-7" stroke="url(#postGold)" strokeWidth="0.8" fill="none" opacity="0.6" />
        
        {/* Micro star elements on layout corner bounds */}
        <circle cx="-19" cy="6" r="0.8" fill="url(#postGold)" />
        <circle cx="19" cy="6" r="0.8" fill="url(#postGold)" />
        <circle cx="-19" cy="-6" r="0.8" fill="url(#postGold)" opacity="0.5" />
        <circle cx="19" cy="-6" r="0.8" fill="url(#postGold)" opacity="0.5" />

        {/* Luxury premium texts with crisp letterspacing */}
        <text 
          x="0" 
          y="-3" 
          fontSize="4.8" 
          fontWeight="900" 
          fontFamily="'Space Grotesk', sans-serif" 
          fill="url(#postGold)" 
          textAnchor="middle" 
          letterSpacing="0.8"
        >
          MUHA MEDS
        </text>
        <text 
          x="0" 
          y="2.5" 
          fontSize="3" 
          fontWeight="700" 
          fontFamily="monospace" 
          fill="#fafafa" 
          textAnchor="middle" 
          letterSpacing="1.2"
        >
          GOLD LABEL
        </text>
        <text 
          x="0" 
          y="6.8" 
          fontSize="2.1" 
          fontWeight="normal" 
          fontFamily="sans-serif" 
          fill="url(#postGold)" 
          textAnchor="middle" 
          letterSpacing="0.4"
          opacity="0.85"
        >
          CANNABIS EXTRACT
        </text>
      </g>

      {/* 2000 MG stamp */}
      <text x="68" y="157" fontSize="4.2" fontFamily="monospace" fill="#52525b" textAnchor="middle" fontWeight="bold">2000 MG | Dual-Core</text>

      {/* Bottom glowing indicator light */}
      <g>
        <rect x="42.5" y="174" width="30" height="7" rx="3.5" fill="#090514" stroke="#000" strokeWidth="1.5" />
        <rect x="44.5" y="176" width="26" height="3" rx="1.5" fill="#0f0923" />
        <circle 
          cx="57.5" 
          cy="177.5" 
          r="1.8" 
          fill="#c084fc" 
          className={isCompleted ? "animate-blink-rapid" : !isPulsing ? "animate-led-heartbeat-dispo" : ""} 
          style={{
            transition: "opacity 0.4s ease-in-out, filter 0.4s ease-in-out, fill 0.4s ease-in-out",
            opacity: isCompleted ? 1 : isPulsing ? 0.3 + 0.7 * breathFactor : 0.2,
            filter: isCompleted 
              ? 'drop-shadow(0 0 10px #c084fc)' 
              : isPulsing 
                ? `drop-shadow(0 0 ${3 + breathFactor * 8}px #c084fc)` 
                : 'drop-shadow(0 0 1px #c084fc)',
            fill: isCompleted || isPulsing ? "#d946ef" : "#3b0764"
          }}
        />
      </g>
    </svg>
  );
};

const BOUTIQ_THEMES = [
  {
    name: 'Teal/Cyan (Maui Wowie)',
    mouthpiece: '#049e91',
    chassis: ['#38edf8', '#01ccc0', '#0a9b9a', '#05626a', '#012b30'],
    accent: '#06ffd4',
    flavors: [
      { top: 'MAUI', bot: 'WOWIE' },
      { top: 'GELATO', bot: '41' },
      { top: 'MANGO', bot: 'MELON' },
    ],
  },
  {
    name: 'Orange/Tangerine (Sour Tangie)',
    mouthpiece: '#ea580c',
    chassis: ['#fb923c', '#ea580c', '#c2410c', '#9a3412', '#431407'],
    accent: '#fbbf24',
    flavors: [
      { top: 'SOUR', bot: 'TANGIE' },
      { top: 'NYC', bot: 'SOUR' },
      { top: 'PASSION', bot: 'FRUIT' },
    ],
  },
  {
    name: 'Coral Red (Gelato 41)',
    mouthpiece: '#dc2626',
    chassis: ['#f87171', '#ef4444', '#dc2626', '#b91c1c', '#7f1d1d'],
    accent: '#fca5a5',
    flavors: [
      { top: 'MAUI', bot: 'WOWIE' },
      { top: 'GELATO', bot: '41' },
      { top: 'MANGO', bot: 'MELON' },
    ],
  },
  {
    name: 'Fuchsia/Pink (Dragon Fruit)',
    mouthpiece: '#db2777',
    chassis: ['#f472b6', '#db2777', '#be185d', '#9d174d', '#500724'],
    accent: '#f472b6',
    flavors: [
      { top: 'PINK', bot: 'Z' },
      { top: 'DRAGON', bot: 'FRUIT' },
      { top: 'TROPI', bot: 'CANA' },
    ],
  },
  {
    name: 'Purple/Violet (Grape Ape)',
    mouthpiece: '#7c3aed',
    chassis: ['#c084fc', '#a78bfa', '#7c3aed', '#5b21b6', '#311054'],
    accent: '#c084fc',
    flavors: [
      { top: 'GRAPE', bot: 'APE' },
      { top: 'SKY', bot: 'WALKER' },
      { top: 'BERRY', bot: 'GUSH' },
    ],
  },
];

const getStringHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};

const BoutiqSVG = ({ 
  isPulsing, 
  oilLevel = 1.0, 
  batteryLevel = 1.0, 
  voltage, 
  isCompleted = false, 
  progress = 0,
  playerName = 'DUAL-MIX',
  selectedTank = 'both',
  onToggleTank,
  onClickButton,
  customLeft = '',
  customRight = ''
}: { 
  isPulsing: boolean; 
  oilLevel?: number; 
  batteryLevel?: number; 
  voltage: number; 
  isCompleted?: boolean; 
  progress?: number; 
  playerName?: string;
  selectedTank?: 'both' | 'left' | 'right';
  onToggleTank?: () => void;
  onClickButton?: () => void;
  customLeft?: string;
  customRight?: string;
}) => {
  const breathFactor = 0.5 + 0.5 * Math.sin(progress * Math.PI * 4);

  // Layout calculations for 2 detailed vertical twin oil tanks (liquid levels)
  const capsuleMaxLiquid = 36;
  const capsuleLiquidHeight = capsuleMaxLiquid * oilLevel;
  const capsuleLiquidY = 86 - capsuleLiquidHeight;

  const skewValX = isPulsing ? `${(progress * 1.5).toFixed(2)}deg` : '0deg';
  const skewValY = isPulsing ? `${(progress * 0.8).toFixed(2)}deg` : '0deg';
  const glowVal = isPulsing ? `${(progress * 12).toFixed(1)}px` : '0px';
  const animDuration = isPulsing ? `${(0.8 - progress * 0.5).toFixed(2)}s` : '0s';

  // Lightning bolts indicator reflecting voltage intensity
  const boltsCount = voltage <= 2.4 ? 1 : voltage <= 3.2 ? 2 : 3;

  // Compute player's specific color theme deterministically
  const themeIndex = getStringHash(playerName) % BOUTIQ_THEMES.length;
  const theme = BOUTIQ_THEMES[themeIndex];

  // Active tank selection: switches dynamically during inhalation to simulate dual-core drawing, or manually set
  const leftActive = selectedTank === 'both'
    ? (isPulsing ? (breathFactor < 0.6) : true)
    : (selectedTank === 'left');
  
  const rightActive = selectedTank === 'both'
    ? (isPulsing ? (breathFactor > 0.4) : true)
    : (selectedTank === 'right');

  const getLeftLabel = () => {
    if (customLeft) {
      const parts = customLeft.trim().split(/\s+/);
      return {
        top: parts[0]?.toUpperCase() || '',
        bot: parts.slice(1).join(' ').toUpperCase() || ''
      };
    }
    return theme.flavors[0];
  };

  const getRightLabel = () => {
    if (customRight) {
      const parts = customRight.trim().split(/\s+/);
      return {
        top: parts[0]?.toUpperCase() || '',
        bot: parts.slice(1).join(' ').toUpperCase() || ''
      };
    }
    return theme.flavors[1];
  };

  const leftLabel = getLeftLabel();
  const rightLabel = getRightLabel();

  return (
    <svg 
      width="120" 
      height="225" 
      viewBox="0 0 120 225" 
      className={`mx-auto select-none ${isPulsing ? 'anim-heat-shimmer' : ''}`}
      style={{
        '--shimmer-skew-x': skewValX,
        '--shimmer-skew-y': skewValY,
        '--shimmer-glow': glowVal,
        '--shimmer-duration': animDuration,
      } as React.CSSProperties}
    >
      <defs>
        {/* Luxury brushed chrome gradient for the metal body highlights */}
        <linearGradient id="bodyMetallicBezel" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4b5563" />
          <stop offset="20%" stopColor="#d1d5db" />
          <stop offset="40%" stopColor="#f3f4f6" />
          <stop offset="60%" stopColor="#e5e7eb" />
          <stop offset="80%" stopColor="#9ca3af" />
          <stop offset="100%" stopColor="#374151" />
        </linearGradient>

        {/* Premium Gold gradient for internal coil chimney posts & trim */}
        <linearGradient id="postGold" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8a6f27" />
          <stop offset="20%" stopColor="#ffd700" />
          <stop offset="50%" stopColor="#fff8d4" />
          <stop offset="80%" stopColor="#ffd700" />
          <stop offset="100%" stopColor="#5d4c1b" />
        </linearGradient>

        <linearGradient id="screenglas" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#030107" />
          <stop offset="30%" stopColor="#0a0518" />
          <stop offset="70%" stopColor="#0d0720" />
          <stop offset="100%" stopColor="#020104" />
        </linearGradient>

        {/* Dynamic chassis body color gradient */}
        <linearGradient id="boutiqChassisGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={theme.chassis[0]} />
          <stop offset="35%" stopColor={theme.chassis[1]} />
          <stop offset="70%" stopColor={theme.chassis[2]} />
          <stop offset="100%" stopColor={theme.chassis[4]} />
        </linearGradient>

        {/* Ultra-realistic liquid honey amber oil gradient */}
        <linearGradient id="boutiqOilGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#451a03" />
          <stop offset="15%" stopColor="#ea580c" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="85%" stopColor="#ca8a04" />
          <stop offset="100%" stopColor="#1e0b00" />
        </linearGradient>

        {/* Golden active core backlight glow */}
        <radialGradient id="oilActiveGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffd700" stopOpacity="0.8" />
          <stop offset="60%" stopColor="#ea580c" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>

        {/* 3D Glass volumetric reflection shading */}
        <linearGradient id="capsuleGlassShade" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="18%" stopColor="#ffffff" stopOpacity="0.08" />
          <stop offset="82%" stopColor="#000000" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.65" />
        </linearGradient>

        {/* High detail screen matrix micro scanline overlay */}
        <pattern id="screenScanlines" width="3" height="3" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="3" y2="0" stroke={theme.accent} strokeWidth="0.4" opacity="0.06" />
          <line x1="0" y1="0" x2="0" y2="3" stroke={theme.accent} strokeWidth="0.4" opacity="0.03" />
        </pattern>

        {/* Precise clipping paths for Left and Right Twin Tanks */}
        <clipPath id="twinTankClipLeft">
          <rect x="27" y="50" width="29" height="36" rx="6" />
        </clipPath>
        <clipPath id="twinTankClipRight">
          <rect x="64" y="50" width="29" height="36" rx="6" />
        </clipPath>
      </defs>

      {/* Ergonomic curved wide black mouthpiece molded with gold rim */}
      <path d="M 40,8 Q 60,-1 80,8 L 81,32 L 39,32 Z" fill="#18181b" stroke="#000" strokeWidth="2.5" />
      <path d="M 44,13 C 52,9 68,9 76,13" stroke="#ffd700" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.7" />
      <rect x="40" y="27" width="40" height="4.5" fill="url(#postGold)" stroke="#000" strokeWidth="1.2" />

      {/* Stout Matte Chassis Frame with premium bezel border */}
      <rect x="14" y="32" width="92" height="157" rx="16" fill="url(#boutiqChassisGrad)" stroke="#000" strokeWidth="3" />
      
      {/* 3D Brushed metallic chamfer border */}
      <rect x="16.5" y="34.5" width="87" height="152" rx="14" fill="none" stroke="url(#bodyMetallicBezel)" strokeWidth="1.8" opacity="0.9" />

      {/* Side grip cooling ventilation slots */}
      <rect x="10" y="70" width="4" height="60" rx="2" fill="#18181b" stroke="#000" strokeWidth="1" />
      <rect x="106" y="70" width="4" height="60" rx="2" fill="#18181b" stroke="#000" strokeWidth="1" />
      
      {/* Side grip lines inside vents */}
      <line x1="11" y1="80" x2="13" y2="80" stroke="#ffd700" strokeWidth="0.8" opacity="0.5" />
      <line x1="11" y1="90" x2="13" y2="90" stroke="#ffd700" strokeWidth="0.8" opacity="0.5" />
      <line x1="11" y1="100" x2="13" y2="100" stroke="#ffd700" strokeWidth="0.8" opacity="0.5" />
      <line x1="11" y1="110" x2="13" y2="110" stroke="#ffd700" strokeWidth="0.8" opacity="0.5" />
      <line x1="11" y1="120" x2="13" y2="120" stroke="#ffd700" strokeWidth="0.8" opacity="0.5" />

      <line x1="107" y1="80" x2="109" y2="80" stroke="#ffd700" strokeWidth="0.8" opacity="0.5" />
      <line x1="107" y1="90" x2="109" y2="90" stroke="#ffd700" strokeWidth="0.8" opacity="0.5" />
      <line x1="107" y1="100" x2="109" y2="100" stroke="#ffd700" strokeWidth="0.8" opacity="0.5" />
      <line x1="107" y1="110" x2="109" y2="110" stroke="#ffd700" strokeWidth="0.8" opacity="0.5" />
      <line x1="107" y1="120" x2="109" y2="120" stroke="#ffd700" strokeWidth="0.8" opacity="0.5" />

      {/* Hex-head industrial hardware screws in chassis corners */}
      <g stroke="#000" strokeWidth="0.5" fill="#374151">
        <circle cx="21" cy="39" r="2" /> <circle cx="99" cy="39" r="2" />
        <circle cx="21" cy="181" r="2" /> <circle cx="99" cy="181" r="2" />
        {/* Bolt details */}
        <line x1="20" y1="39" x2="22" y2="39" stroke="#9ca3af" strokeWidth="0.5" />
        <line x1="98" y1="39" x2="100" y2="39" stroke="#9ca3af" strokeWidth="0.5" />
        <line x1="20" y1="181" x2="22" y2="181" stroke="#9ca3af" strokeWidth="0.5" />
        <line x1="98" y1="181" x2="100" y2="181" stroke="#9ca3af" strokeWidth="0.5" />
      </g>

      {/* Front glossy curved black screen glass */}
      <rect x="22" y="44" width="76" height="136" rx="10" fill="url(#screenglas)" stroke="#0a0515" strokeWidth="2.5" />
      <rect x="22" y="44" width="76" height="136" rx="10" fill="url(#screenScanlines)" pointerEvents="none" />

      {/* ================= TWIN OIL CHAMBERS (DUAL TANK DESIGN) ================= */}
      
      {/* --- TWIN TANK A (LEFT): INDICA / SUGAR --- */}
      <g>
        {/* Tank container border */}
        <rect x="27" y="50" width="29" height="36" rx="6" fill="#100a1c" stroke="url(#postGold)" strokeWidth="1" />
        
        {/* Warm golden backlight active halo when Left Core is drawing */}
        {leftActive && isPulsing && (
          <rect x="28" y="51" width="27" height="34" rx="5" fill="url(#oilActiveGlow)" opacity={0.65 + 0.3 * Math.sin(Date.now() / 150)} />
        )}

        {/* Centered Golden Brass heating pole assembly inside the tank */}
        <rect x="39" y="50" width="5" height="36" fill="url(#postGold)" stroke="#3f2e04" strokeWidth="0.5" opacity="0.95" />
        {/* Threaded screw pattern on the post */}
        <line x1="39" y1="58" x2="44" y2="58" stroke="#312202" strokeWidth="0.5" />
        <line x1="39" y1="66" x2="44" y2="66" stroke="#312202" strokeWidth="0.5" />
        <line x1="39" y1="74" x2="44" y2="74" stroke="#312202" strokeWidth="0.5" />
        <circle cx="41.5" cy="80" r="1.2" fill="#18181b" stroke="url(#postGold)" strokeWidth="0.5" /> {/* Intake hole */}

        {/* Golden Honey Oil Fluid Layer clip */}
        <g clipPath="url(#twinTankClipLeft)">
          {capsuleLiquidHeight > 0 && (
            <>
              <rect x="27" y={capsuleLiquidY} width="29" height={capsuleLiquidHeight} fill="url(#boutiqOilGrad)" opacity="0.95" />
              {/* Detailed volumetric fluid meniscus curve */}
              <ellipse cx="41.5" cy={capsuleLiquidY} rx="14.5" ry="2.2" fill="#ffd700" opacity="0.85" />
              <ellipse cx="41.5" cy={capsuleLiquidY + 0.8} rx="11" ry="1.2" fill="#ffffff" opacity="0.65" />
              
              {/* Realistic floating micro bubbles inside the viscous oil */}
              <circle cx="33" cy={capsuleLiquidY + (capsuleLiquidHeight * 0.72)} r="0.8" fill="#ffffff" opacity="0.85" />
              <circle cx="31" cy={capsuleLiquidY + (capsuleLiquidHeight * 0.38)} r="0.5" fill="#ffffff" opacity="0.75" />
              <circle cx="36" cy={capsuleLiquidY + (capsuleLiquidHeight * 0.5)} r="1.2" fill="url(#postGold)" opacity="0.9" />
              <circle cx="49" cy={capsuleLiquidY + (capsuleLiquidHeight * 0.65)} r="0.7" fill="#ffffff" opacity="0.8" />
              <circle cx="47" cy={capsuleLiquidY + (capsuleLiquidHeight * 0.24)} r="1.0" fill="url(#postGold)" opacity="0.8" />

              {/* Bubbles rising actively if core is drawing */}
              {isPulsing && leftActive && (
                <g>
                  <circle cx="35" cy={capsuleLiquidY + (capsuleLiquidHeight * 0.6) - (progress * 18)} r="0.8" fill="#ffffff" className="animate-pulse" />
                  <circle cx="46" cy={capsuleLiquidY + (capsuleLiquidHeight * 0.42) - (progress * 24)} r="1.0" fill="#ffffff" />
                  <circle cx="40" cy={capsuleLiquidY + (capsuleLiquidHeight * 0.28) - (progress * 14)} r="0.6" fill="#ffffff" />
                </g>
              )}
            </>
          )}
        </g>
        
        {/* Real Glass Reflections & 3D Lighting Overlay */}
        <rect x="27" y="50" width="29" height="36" rx="6" fill="url(#capsuleGlassShade)" pointerEvents="none" opacity="0.85" />
        <rect x="29" y="51.5" width="3" height="33" rx="1.5" fill="#ffffff" opacity="0.32" pointerEvents="none" />
        <rect x="50" y="51.5" width="1.5" height="33" rx="0.5" fill="#000000" opacity="0.25" pointerEvents="none" />

        {/* Tank A fluid scale markings */}
        <line x1="27" y1="59" x2="30" y2="59" stroke="#ffd700" strokeWidth="0.8" opacity="0.6" />
        <line x1="27" y1="68" x2="30" y2="68" stroke="#ffd700" strokeWidth="0.8" opacity="0.6" />
        <line x1="27" y1="77" x2="30" y2="77" stroke="#ffd700" strokeWidth="0.8" opacity="0.6" />
      </g>

      {/* --- TWIN TANK B (RIGHT): SATIVA / CAKE --- */}
      <g>
        {/* Tank container border */}
        <rect x="64" y="50" width="29" height="36" rx="6" fill="#100a1c" stroke="url(#postGold)" strokeWidth="1" />
        
        {/* Warm golden backlight active halo when Right Core is drawing */}
        {rightActive && isPulsing && (
          <rect x="65" y="51" width="27" height="34" rx="5" fill="url(#oilActiveGlow)" opacity={0.65 + 0.3 * Math.sin(Date.now() / 150 + 10)} />
        )}

        {/* Centered Golden Brass heating pole assembly inside the tank */}
        <rect x="76" y="50" width="5" height="36" fill="url(#postGold)" stroke="#3f2e04" strokeWidth="0.5" opacity="0.95" />
        {/* Threaded screw pattern on the post */}
        <line x1="76" y1="58" x2="81" y2="58" stroke="#312202" strokeWidth="0.5" />
        <line x1="76" y1="66" x2="81" y2="66" stroke="#312202" strokeWidth="0.5" />
        <line x1="76" y1="74" x2="81" y2="74" stroke="#312202" strokeWidth="0.5" />
        <circle cx="78.5" cy="80" r="1.2" fill="#18181b" stroke="url(#postGold)" strokeWidth="0.5" /> {/* Intake hole */}

        {/* Golden Honey Oil Fluid Layer clip */}
        <g clipPath="url(#twinTankClipRight)">
          {capsuleLiquidHeight > 0 && (
            <>
              <rect x="64" y={capsuleLiquidY} width="29" height={capsuleLiquidHeight} fill="url(#boutiqOilGrad)" opacity="0.95" />
              {/* Detailed volumetric fluid meniscus curve */}
              <ellipse cx="78.5" cy={capsuleLiquidY} rx="14.5" ry="2.2" fill="#ffd700" opacity="0.85" />
              <ellipse cx="78.5" cy={capsuleLiquidY + 0.8} rx="11" ry="1.2" fill="#ffffff" opacity="0.65" />
              
              {/* Realistic floating micro bubbles inside the viscous oil */}
              <circle cx="70" cy={capsuleLiquidY + (capsuleLiquidHeight * 0.65)} r="0.9" fill="url(#postGold)" opacity="0.8" />
              <circle cx="83" cy={capsuleLiquidY + (capsuleLiquidHeight * 0.44)} r="0.6" fill="#ffffff" opacity="0.8" />
              <circle cx="85" cy={capsuleLiquidY + (capsuleLiquidHeight * 0.72)} r="1.1" fill="url(#postGold)" opacity="0.85" />
              <circle cx="68" cy={capsuleLiquidY + (capsuleLiquidHeight * 0.18)} r="0.5" fill="#ffffff" opacity="0.75" />
              <circle cx="73" cy={capsuleLiquidY + (capsuleLiquidHeight * 0.52)} r="0.8" fill="#ffffff" opacity="0.85" />

              {/* Bubbles rising actively if core is drawing */}
              {isPulsing && rightActive && (
                <g>
                  <circle cx="71" cy={capsuleLiquidY + (capsuleLiquidHeight * 0.5) - (progress * 22)} r="0.7" fill="#ffffff" />
                  <circle cx="82" cy={capsuleLiquidY + (capsuleLiquidHeight * 0.35) - (progress * 15)} r="1.1" fill="#ffffff" />
                  <circle cx="78" cy={capsuleLiquidY + (capsuleLiquidHeight * 0.58) - (progress * 26)} r="0.8" fill="#ffffff" />
                </g>
              )}
            </>
          )}
        </g>
        
        {/* Real Glass Reflections & 3D Lighting Overlay */}
        <rect x="64" y="50" width="29" height="36" rx="6" fill="url(#capsuleGlassShade)" pointerEvents="none" opacity="0.85" />
        <rect x="66" y="51.5" width="3" height="33" rx="1.5" fill="#ffffff" opacity="0.32" pointerEvents="none" />
        <rect x="87" y="51.5" width="1.5" height="33" rx="0.5" fill="#000000" opacity="0.25" pointerEvents="none" />

        {/* Tank B fluid scale markings */}
        <line x1="90" y1="59" x2="93" y2="59" stroke="#ffd700" strokeWidth="0.8" opacity="0.6" />
        <line x1="90" y1="68" x2="93" y2="68" stroke="#ffd700" strokeWidth="0.8" opacity="0.6" />
        <line x1="90" y1="77" x2="93" y2="77" stroke="#ffd700" strokeWidth="0.8" opacity="0.6" />
      </g>

      {/* --- CENTRAL DUAL CHAMBER BRAND & SELECTOR STATUS --- */}
      <g id="boutiq-svg-plaque">
        {/* Strain labels under respective tanks */}
        <g transform="translate(41.5, 93)">
          <text x="0" y="0" fontSize="3.6" fontFamily="'Share Tech Mono', monospace" fill="#ffffff" fontWeight="bold" textAnchor="middle">{leftLabel.top}</text>
          <text x="0" y="3.6" fontSize="3.6" fontFamily="'Share Tech Mono', monospace" fill={theme.accent} fontWeight="bold" textAnchor="middle">{leftLabel.bot}</text>
          {/* Left LED selection arrow pointing up */}
          <polygon points="-1.5,8 0,6 1.5,8" fill={leftActive ? "#39ff14" : "#451a03"} opacity={leftActive ? 1 : 0.4} className={isPulsing && leftActive ? "animate-pulse" : ""} />
          <circle cx="0" cy="11" r="1.2" fill={leftActive ? "#39ff14" : "#221005"} />
        </g>

        <g transform="translate(78.5, 93)">
          <text x="0" y="0" fontSize="3.6" fontFamily="'Share Tech Mono', monospace" fill="#ffffff" fontWeight="bold" textAnchor="middle">{rightLabel.top}</text>
          <text x="0" y="3.6" fontSize="3.6" fontFamily="'Share Tech Mono', monospace" fill={theme.accent} fontWeight="bold" textAnchor="middle">{rightLabel.bot}</text>
          {/* Right LED selection arrow pointing up */}
          <polygon points="-1.5,8 0,6 1.5,8" fill={rightActive ? "#39ff14" : "#451a03"} opacity={rightActive ? 1 : 0.4} className={isPulsing && rightActive ? "animate-pulse" : ""} />
          <circle cx="0" cy="11" r="1.2" fill={rightActive ? "#39ff14" : "#221005"} />
        </g>
      </g>

      {/* Header horizontal divider */}
      <line x1="28" y1="108" x2="92" y2="108" stroke="#1f1635" strokeWidth="0.8" />

      {/* ================= DIAGNOSTICS SMART SCREEN PANEL ================= */}
      
      {/* 1. SECURE METRICS: BATT Level + Volts Lightning (Left) */}
      <g transform="translate(25, 112)">
        <text x="3" y="5" fontSize="3.5" fontFamily="'Share Tech Mono', monospace" fill="#93c5fd" opacity="0.8" fontWeight="bold">POWER</text>
        <text x="3" y="11" fontSize="6.5" fontFamily="'Share Tech Mono', monospace" fill="#00f3ff" fontWeight="bold">
          {Math.round(batteryLevel * 100)}%
        </text>
        
        {/* Active Volts level selector */}
        <text x="3" y="18.5" fontSize="4.0" fontFamily="'Share Tech Mono', monospace" fill="#39ff14" fontWeight="bold">
          {voltage.toFixed(1)}V
        </text>
        <g stroke="#39ff14" strokeWidth="1" fill="none" opacity="0.95">
          {boltsCount >= 1 && <path d="M 17,13.5 L 21,13.5 L 19,15.5 L 22,15.5 L 18,18.5" />}
          {boltsCount >= 2 && <path d="M 21,13.5 L 25,13.5 L 23,15.5 L 26,15.5 L 22,18.5" />}
        </g>
      </g>

      {/* 2. Character Mascot Face blowing clouds (Center Screen) */}
      <g transform="translate(60, 121)" className={isPulsing ? "animate-bounce" : ""}>
        {/* Little circular glass HUD circle */}
        <circle cx="0" cy="4" r="8.5" fill="#0a1205" stroke="#22c55e" strokeWidth="0.8" opacity="0.7" />
        
        {/* Pixel style character head */}
        <rect x="-4" y="-3.2" width="8" height="3.5" rx="1" fill="#22c55e" />
        <rect x="-6.2" y="-2" width="2.4" height="2" fill="#15803d" />
        <rect x="3.8" y="-2" width="2.4" height="2" fill="#15803d" />
        {/* Face plate */}
        <rect x="-3.5" y="0.2" width="7" height="6.5" rx="1.5" fill="#4ade80" />
        {/* Angry pixel eyes looking down */}
        <rect x="-2" y="1.8" width="1.3" height="1" fill="#000" />
        <rect x="0.7" y="1.8" width="1.3" height="1" fill="#000" />
        {/* Intense eyebrows */}
        <path d="M-2.5,1.2 L-1,2.0 M2.5,1.2 L1,2.0" stroke="#15803d" strokeWidth="0.8" />
        {/* Glowing cherry puff nose */}
        <circle cx="0" cy="3.6" r="1.5" fill="#ef4444" className={isPulsing ? "animate-pulse" : ""} />
        {/* Mouth connector pipe */}
        <rect x="-1" y="5.0" width="2" height="1.2" fill="#022c22" />

        {/* Steaming side cloud jets popping when drawing */}
        {isPulsing && (
          <g>
            <path d="M -6,1.5 Q -13,-0.5 -10,-5 Q -6,-8.5 -2.5,-4.5 Z" fill="#ffffff" opacity="0.75" className="animate-pulse" />
            <path d="M 6,1.5 Q 13,-0.5 10,-5 Q 6,-8.5 2.5,-4.5 Z" fill="#ffffff" opacity="0.75" className="animate-pulse" />
          </g>
        )}
      </g>

      {/* 3. BLINKERS status matrix (Right Screen) */}
      <g transform="translate(84, 112)">
        <text x="1.5" y="5" fontSize="3.5" fontFamily="'Share Tech Mono', monospace" fill="#ffd700" fontWeight="bold">BLINKERS</text>
        {/* Pixel 3x3 high-tech LED matrix dashboard */}
        <g fill={isPulsing ? "#ffd700" : "#241d08"} strokeWidth="0.5" stroke="none">
          <rect x="2" y="7" width="4" height="3" className={isPulsing && (breathFactor > 0.3) ? "animate-pulse" : ""} fill={isPulsing && (breathFactor > 0.1) ? "#39ff14" : "#132c10"} />
          <rect x="7" y="7" width="4" height="3" className={isPulsing && (breathFactor > 0.5) ? "animate-pulse" : ""} fill={isPulsing && (breathFactor > 0.45) ? "#39ff14" : "#132c10"} />
          <rect x="12" y="7" width="4" height="3" className={isPulsing && (breathFactor > 0.7) ? "animate-pulse" : ""} fill={isPulsing && (breathFactor > 0.7) ? "#39ff14" : "#132c10"} />
          
          <rect x="2" y="11" width="4" height="3" fill={isPulsing ? "#39ff14" : "#132c10"} />
          <rect x="7" y="11" width="4" height="3" fill={isCompleted ? "#ffd700" : "#132c10"} />
          <rect x="12" y="11" width="4" height="3" fill={isPulsing ? "#39ff14" : "#132c10"} />
          
          <rect x="2" y="15" width="4" height="3" fill={isPulsing ? "#39ff14" : "#132c10"} />
          <rect x="7" y="15" width="4" height="3" fill={isPulsing ? "#ff007f" : "#132c10"} />
          <rect x="12" y="15" width="4" height="3" fill={isPulsing ? "#10b981" : "#132c10"} />
        </g>
      </g>

      {/* CORE TEMPERATURE OSCILLOSCOPE MONITOR SECTION */}
      <g transform="translate(26, 140)">
        <text x="2" y="4.2" fontSize="3.5" fontFamily="'Share Tech Mono', monospace" fill="#a78bfa" opacity="0.8">CORE LEVEL</text>
        {/* Dynamic oscilloscope wave */}
        <path 
          d={isPulsing 
            ? `M 0,11 Q 12,${11 - breathFactor * 13} 24,${11 + breathFactor * 13} T 48,11 T 66,11` 
            : `M 0,11 Q 16,${11 - Math.sin(Date.now() / 250) * 1.5} 32,11 T 66,11`
          } 
          fill="none" 
          stroke={isPulsing ? "#39ff14" : "#4c1d95"} 
          strokeWidth="1.2" 
          opacity="0.95" 
        />
        <text x="44" y="4.2" fontSize="3.5" fontFamily="'Share Tech Mono', monospace" fill="#e879f9" opacity="0.9" className={isPulsing ? "animate-pulse" : ""}>
          {isPulsing ? "DRAWING..." : "STANDBY"}
        </text>
      </g>

      {/* Premium Embossed Brand stamp "BOUTIQ" */}
      <g transform="translate(60, 153)">
        {/* Glowing gold text with elegant display font styling */}
        <text x="0" y="0" fontSize="7.0" fontFamily="'Share Tech Mono', monospace" fill="url(#postGold)" fontWeight="900" letterSpacing="1.2" textAnchor="middle" filter={isPulsing ? "drop-shadow(0px 0px 4px rgba(255, 215, 0, 0.45))" : ""}>BOUTIQ</text>
      </g>

      {/* 3D Tactile Golden Firing Button */}
      <g 
        transform="translate(60, 163)" 
        className="boutiq-svg-button cursor-pointer" 
        onClick={onClickButton}
        style={{ cursor: "pointer" }}
      >
        {/* Outer backing metal bezel ring */}
        <circle cx="0" cy="0" r="6.2" fill="#1e1b4b" stroke="#000" strokeWidth="1.2" />
        <circle cx="0" cy="0" r="5.0" fill="url(#bodyMetallicBezel)" />
        {/* Inner golden button that glows/pulses when inhaling */}
        <circle 
          cx="0" 
          cy="0" 
          r="4.0" 
          fill="url(#postGold)" 
          stroke="#000" 
          strokeWidth="0.8" 
          style={{
            transform: isPulsing ? 'scale(0.92)' : 'scale(1)',
            transition: 'transform 0.08s ease-in-out',
          }}
        />
        {/* Glowing Pilot LED dot in center of firing button */}
        <circle 
          cx="0" 
          cy="0" 
          r="1.2" 
          fill={isPulsing ? "#39ff14" : "#ff007f"} 
          className={isPulsing ? "animate-pulse" : ""} 
          style={{
            filter: `drop-shadow(0 0 ${isPulsing ? '3px' : '1px'} ${isPulsing ? '#39ff14' : '#ff007f'})`
          }}
        />
      </g>

      {/* Slide mode active switch indicator at the very bottom center */}
      <g 
        transform="translate(60, 178)"
        className="boutiq-svg-selector cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onToggleTank?.();
        }}
        style={{ cursor: "pointer" }}
      >
        {/* Switch backing slot */}
        <rect x="-16" y="-3.5" width="32" height="6.5" rx="3.2" fill="#0c0717" stroke="#2e1065" strokeWidth="1" />
        {/* Sliding mechanical knob */}
        <rect 
          x={selectedTank === 'left' ? "-12" : selectedTank === 'right' ? "4" : "-4"} 
          y="-5.5" 
          width="8" 
          height="10.5" 
          rx="2" 
          fill="url(#postGold)" 
          stroke="#000" 
          strokeWidth="1.2" 
          style={{ transition: 'x 0.15s ease-out' }}
        />
        <text x="0" y="11" fontSize="3.4" fontFamily="'Share Tech Mono', monospace" fill={theme.accent} textAnchor="middle" fontWeight="bold">
          {selectedTank === 'both' ? "DUAL-MIX ACTIVE" : selectedTank === 'left' ? "INDICA (L) ONLY" : "SATIVA (R) ONLY"}
        </text>
      </g>

      {/* Exterior chassis detail accents */}
      <rect x="20.5" y="66" width="1.5" height="42" fill={theme.accent} opacity="0.8" />
      <rect x="98" y="66" width="1.5" height="42" fill={theme.accent} opacity="0.8" />
      
      {/* Dynamic base USB-C connector port detailed shape */}
      <path d="M 48,189 L 72,189 L 70,192 L 50,192 Z" fill="#18181b" stroke="#000" strokeWidth="1" />
      <rect x="52" y="190" width="16" height="1.2" rx="0.6" fill="#3f3f46" />
    </svg>
  );
};

interface PersonalBest {
  maxStreak: number;
  maxScore: number;
  totalBlinks: number;
}

const getPersonalBest = (name: string): PersonalBest => {
  try {
    const stored = localStorage.getItem('blinker_personal_bests');
    if (stored) {
      const pbMap = JSON.parse(stored);
      if (pbMap && pbMap[name]) {
        return {
          maxStreak: pbMap[name].maxStreak || 0,
          maxScore: pbMap[name].maxScore || 0,
          totalBlinks: pbMap[name].totalBlinks || 0
        };
      }
    }
  } catch {}
  return { maxStreak: 0, maxScore: 0, totalBlinks: 0 };
};

const updatePersonalBests = (name: string, currentStreak: number, currentScore: number, addedBlink: boolean) => {
  try {
    const stored = localStorage.getItem('blinker_personal_bests');
    const pbMap: Record<string, PersonalBest> = stored ? JSON.parse(stored) : {};
    const prev = pbMap[name] || { maxStreak: 0, maxScore: 0, totalBlinks: 0 };
    pbMap[name] = {
      maxStreak: Math.max(prev.maxStreak, currentStreak),
      maxScore: Math.max(prev.maxScore, currentScore),
      totalBlinks: prev.totalBlinks + (addedBlink ? 1 : 0)
    };
    localStorage.setItem('blinker_personal_bests', JSON.stringify(pbMap));
  } catch {}
};

export default function App() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [activePlayerIdx, setActivePlayerIdx] = useState<number>(0);
  
  const activePlayer = players[activePlayerIdx] || players[0] || {
    id: 'placeholder',
    name: 'UNTITLED',
    score: 0,
    device: 'cartridge',
    oilLevel: 1.0,
    batteryLevel: 1.0,
    status: 'IDLE',
    totalBlinks: 0,
    totalAttempts: 0,
    totalDuration: 0,
    streak: 0
  };

  const [gamePhase, setGamePhase] = useState<'LOBBY' | 'GAME_ON' | 'SUMMARY'>('LOBBY');
  
  // Forms state
  const [newPlayerName, setNewPlayerName] = useState<string>('');
  const [newPlayerDevice, setNewPlayerDevice] = useState<'cartridge' | 'disposable' | 'muhameds' | 'boutiq'>('cartridge');

  // Session state
  const [gameMode, setGameMode] = useState<'CLASSIC' | 'DRAIN' | 'BASEBALL'>('CLASSIC');
  const [drainGameDuration, setDrainGameDuration] = useState<number>(90); // 60s, 90s, 120s
  const [drainTimeRemaining, setDrainTimeRemaining] = useState<number>(90);
  const [blinkMode, setBlinkMode] = useState<'TAKE_BLINKER' | 'DOUBLE_BLINKER'>('TAKE_BLINKER');
  const [inhaleTimer, setInhaleTimer] = useState<number>(0);
  const [activeSessionState, setActiveSessionState] = useState<'IDLE' | 'INHALING' | 'SUCCESS' | 'TAPPED_OUT'>('IDLE');
  const [funnyQuote, setFunnyQuote] = useState<string>('Get ready and tap the button to take a blinker.');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [inputMode, setInputMode] = useState<'HOLD' | 'TOGGLE'>('TOGGLE');
  const [isDirectToggled, setIsDirectToggled] = useState<boolean>(false);

  // Baseball Game Mode State
  const [baseballPlayers, setBaseballPlayers] = useState<{
    id: string;
    name: string;
    device: 'cartridge' | 'disposable' | 'muhameds' | 'boutiq';
    status: 'IDLE' | 'RIPPING' | 'HOLDING' | 'SAFE' | 'DISQUALIFIED';
    holdTime: number;
    hasRippedThisRound: boolean;
    isEliminated: boolean;
    oilLevel: number;
    batteryLevel: number;
  }[]>([]);
  const [baseballRound, setBaseballRound] = useState<number>(1);
  const [baseballPossessionIdx, setBaseballPossessionIdx] = useState<number>(0);
  const [baseballActiveSessionState, setBaseballActiveSessionState] = useState<'IDLE' | 'RIPPING' | 'RIP_SUCCESS' | 'RIP_FAILED' | 'ROUND_FAILED_POPUP'>('IDLE');
  const [baseballTimer, setBaseballTimer] = useState<number>(0.0);
  const [baseballFailedPlayerName, setBaseballFailedPlayerName] = useState<string>('');
  const [baseballLogStr, setBaseballLogStr] = useState<string>('Welcome to the Baseball Arena!');
  const baseballTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Boutiq specific configuration states
  const [selectedTank, setSelectedTank] = useState<'both' | 'left' | 'right'>('both');
  const [customLeftLabel, setCustomLeftLabel] = useState<string>('');
  const [customRightLabel, setCustomRightLabel] = useState<string>('');

  const handleToggleBoutiqTank = () => {
    setSelectedTank((prev) => {
      const next = prev === 'left' ? 'right' : prev === 'right' ? 'both' : 'left';
      triggerAudioBeep(330, 'sine', 0.05);
      return next;
    });
  };

  const handleBoutiqButtonPress = () => {
    playTactileClick();
    if (activeSessionState === 'INHALING') {
      haltInhalation();
      setIsDirectToggled(false);
    } else if (activeSessionState === 'IDLE' || activeSessionState === 'SUCCESS' || activeSessionState === 'TAPPED_OUT') {
      if (activeSessionState === 'IDLE') {
        startInhalation();
        setIsDirectToggled(true);
      }
    }
  };

  // Overlay state
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [isInfoOpen, setIsInfoOpen] = useState<boolean>(false);
  const [voltage, setVoltage] = useState<number>(3.2); // 2.4V, 3.2V, 4.0V

  // General particles
  const [particles, setParticles] = useState<Particle[]>([]);
  const [trailParticles, setTrailParticles] = useState<TrailParticle[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const getSmokeParticles = () => {
    // We adjust the particle count based on voltage power level to achieve realistic puff density
    const count = voltage <= 2.4 ? 12 : voltage >= 4.0 ? 32 : 20;
    const list = [];
    for (let i = 0; i < count; i++) {
       const dirs = ['l', 'r', 'c', 's1', 's2'];
       const dir = dirs[i % dirs.length];
       const delayVal = i * 0.08; // smooth sequential release 
       const delay = delayVal.toFixed(2);
       let baseSize = 25; // larger size bounds since radial gradient feathers out elegantly
       if (voltage <= 2.4) {
         baseSize = 20 + (i % 4) * 8;
       } else if (voltage >= 4.0) {
         baseSize = 42 + (i % 6) * 16;
       } else {
         baseSize = 30 + (i % 4) * 12;
       }

       // Pre-feathered radial-gradient background for 100% fluent lag-free white smoke clouds!
       // By using native fading gradients, we completely bypass slow CPU blur filters!
       const bgClasses = [
         'bg-[radial-gradient(circle,rgba(255,255,255,0.4)_0%,rgba(255,255,255,0.15)_45%,rgba(255,255,255,0)_100%)]',
         'bg-[radial-gradient(circle,rgba(250,250,253,0.35)_0%,rgba(250,250,253,0.12)_45%,rgba(250,250,253,0)_100%)]',
         'bg-[radial-gradient(circle,rgba(255,255,255,0.45)_0%,rgba(255,255,255,0.18)_40%,rgba(255,255,255,0)_100%)]',
         'bg-[radial-gradient(circle,rgba(240,240,248,0.38)_0%,rgba(240,240,248,0.14)_45%,rgba(240,240,248,0)_100%)]',
         'bg-[radial-gradient(circle,rgba(255,255,255,0.32)_0%,rgba(255,255,255,0.12)_48%,rgba(255,255,255,0)_100%)]'
       ];
       const bg = bgClasses[i % bgClasses.length];

       // Primary puff
       list.push({
         id: `smoke-${i}`,
         dir,
         delay: `${delay}s`,
         size: `${baseSize}px`,
         blur: '', // Zero expensive CSS filter
         bg
       });

       // Secondary micro offsetting puff to add detail
       const puffDelay = (delayVal + 0.12).toFixed(2);
       const puffSize = Math.max(12, Math.round(baseSize * 0.75));
       const puffBg = bgClasses[(i + 1) % bgClasses.length];

       list.push({
         id: `smoke-micro-${i}`,
         dir, 
         delay: `${puffDelay}s`,
         size: `${puffSize}px`,
         blur: '', 
         bg: puffBg
       });
    }
    return list;
  };

  useEffect(() => {
    const win = window as any;
    if (win.AudioContext && isMuted && audioCtx) {
      audioCtx.suspend();
    } else if (win.AudioContext && !isMuted && audioCtx) {
      audioCtx.resume();
    }
  }, [isMuted]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopInhaleSizzle();
    };
  }, []);

  // Particle drift physics loop
  useEffect(() => {
    if (particles.length === 0) return;
    const interval = setInterval(() => {
      setParticles((prev) => 
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.12,
            rotation: p.rotation + p.vRot,
            opacity: p.opacity - 0.02,
          }))
          .filter((p) => p.opacity > 0)
      );
    }, 18);
    return () => clearInterval(interval);
  }, [particles]);

  // Persistent drifting trail physics and generator
  useEffect(() => {
    let animationFrame: number;
    let lastSpawnTime = 0;
    const spawnInterval = 320; // Spawn less frequently for massive performance gains

    const colors = [
      'rgba(255, 255, 255, 0.20)', // Clean ambient white smoke
      'rgba(240, 240, 250, 0.16)', // Soft slate white
      'rgba(245, 245, 245, 0.22)', // Pure light cloud white
      'rgba(255, 255, 255, 0.12)', // Subtle thin white smoke
    ];

    const updatePhysics = (timestamp: number) => {
      // Create new faint vapor puffs only when active inhaling session is occurring
      if (activeSessionState === 'INHALING') {
        if (!lastSpawnTime) lastSpawnTime = timestamp;
        if (timestamp - lastSpawnTime > spawnInterval) {
          lastSpawnTime = timestamp;

          // Insert clean white cloud vapor particle with expanding behavior
          const newTrails: TrailParticle[] = Array.from({ length: 1 }).map((_, idx) => {
            const size = 12 + Math.random() * 6;
            return {
              id: Math.random() + Date.now() + idx,
              x: (Math.random() - 0.5) * 8,
              y: 35 + (Math.random() - 0.5) * 4,
              vx: (Math.random() - 0.5) * 0.5,
              vy: -0.8 - Math.random() * 0.8,
              size: size,
              maxSize: size * (2.2 + Math.random() * 1.5),
              opacity: 0.35 + Math.random() * 0.1,
              color: colors[Math.floor(Math.random() * colors.length)],
              blur: Math.random() > 0.4 ? 'blur-md' : 'blur-lg',
              life: 1100 + Math.random() * 300, // Reduced decay time for 10x quicker garbage collection
              maxLife: 1100 + Math.random() * 300,
            };
          });

          setTrailParticles((prev) => [...prev, ...newTrails]);
        }
      } else {
        lastSpawnTime = 0;
      }

      // Update positions and sizes of drifting vape trail clouds over time
      setTrailParticles((prev) => {
        if (prev.length === 0) return prev;
        return prev
          .map((p) => {
            const nextLife = p.life - 16.7;
            const ratio = Math.max(0, nextLife / p.maxLife);
            
            // Expand size and drift upward
            const nextSize = p.size + (p.maxSize - p.size) * (1 - ratio) * 0.03;
            const nextX = p.x + p.vx;
            const nextY = p.y + p.vy;
            const nextOpacity = ratio * ratio * 0.4; // Smooth exponential curve for fading out

            return {
              ...p,
              x: nextX,
              y: nextY,
              vx: p.vx * 0.95, // Drag
              vy: p.vy * 0.96,
              size: nextSize,
              opacity: nextOpacity,
              life: nextLife,
            };
          })
          .filter((p) => p.life > 0 && p.opacity > 0.01);
      });

      animationFrame = requestAnimationFrame(updatePhysics);
    };

    animationFrame = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animationFrame);
  }, [activeSessionState]);

  const targetTime = blinkMode === 'TAKE_BLINKER' ? 8 : 10;
  const progressRatio = inhaleTimer / targetTime;
  
  const isGameOver = 
    (players.length === 2 && players.some(p => p.status === 'TAPPED_OUT')) ||
    (players.length >= 3 && players.filter(p => !p.isEliminated).length <= 1);

  const triggerAudioBeep = (freq: number, type: 'sine'|'square'|'sawtooth'|'triangle' = 'sine', duration = 0.1) => {
    if (!isMuted) playSynthBeep(freq, type, duration, 0.08);
  };

  const playSoundUiClick = () => {
    triggerAudioBeep(650, 'sine', 0.04);
  };
  
  const playSoundModeSelect = () => {
    triggerAudioBeep(440, 'triangle', 0.05);
    setTimeout(() => {
      triggerAudioBeep(554, 'triangle', 0.05);
      setTimeout(() => {
        triggerAudioBeep(659, 'triangle', 0.08);
      }, 40);
    }, 40);
  };

  const playSoundPlayerAdded = () => {
    triggerAudioBeep(523, 'sine', 0.06);
    setTimeout(() => {
      triggerAudioBeep(659, 'sine', 0.06);
      setTimeout(() => {
        triggerAudioBeep(784, 'sine', 0.12);
      }, 50);
    }, 50);
  };

  const playSoundPlayerRemoved = () => {
    triggerAudioBeep(330, 'square', 0.08);
    setTimeout(() => {
      triggerAudioBeep(220, 'square', 0.14);
    }, 70);
  };

  const playSoundEliminated = () => {
    triggerAudioBeep(261, 'sawtooth', 0.12);
    setTimeout(() => {
      triggerAudioBeep(196, 'sawtooth', 0.12);
      setTimeout(() => {
        triggerAudioBeep(130, 'sawtooth', 0.25);
      }, 100);
    }, 100);
  };

  const handleSpawnConfettiCloud = () => {
    if (!containerRef.current) return;
    const parent = containerRef.current.getBoundingClientRect();
    const px = parent.width / 2;
    const py = parent.height / 2;
    const count = 30;
    const colors = ["#ff007f", "#00f3ff", "#39ff14", "#fafafa", "#ffd700", "#7b2cbf"];
    
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 5;
      newParticles.push({
        id: Date.now() + Math.random() * 19280,
        x: px,
        y: py,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.0,
        size: 8 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 10,
        opacity: 1,
        symbol: ""
      });
    }
    setParticles((prev) => [...prev, ...newParticles]);
  };

  // Turn Actions
  const startInhalation = () => {
    if (activeSessionState === 'SUCCESS' || activeSessionState === 'TAPPED_OUT') return;
    
    triggerAudioBeep(580, 'triangle', 0.08);
    setActiveSessionState('INHALING');
    updateGlobalStatus('INHALING');
    
    if (!isMuted) startInhaleSizzle();

    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      setInhaleTimer((prev) => {
        const next = Math.min(prev + 0.1, targetTime);
        const ratio = next / targetTime;
        
        updateInhaleSizzleRate(ratio);

        const voltFactor = voltage === 2.4 ? 0.6 : voltage === 4.0 ? 1.6 : 1.0;
        if (activePlayer.device === 'cartridge' || activePlayer.device === 'muhameds' || activePlayer.device === 'boutiq') {
          setPlayers(prevPlayers => {
            let triggeredHaptic = false;
            let triggeredLowBattery = false;
            const res = prevPlayers.map((p, idx) => {
              if (idx === activePlayerIdx) {
                const nextOil = Math.max(0.01, p.oilLevel - (0.0008 * voltFactor));
                const isPremiumDispo = p.device === 'muhameds' || p.device === 'boutiq';
                const battDrainFactor = isPremiumDispo ? 0.001 : 0.0006;
                const nextBatt = Math.max(0.01, (p.batteryLevel ?? 1.0) - (battDrainFactor * voltFactor));
                
                const prevOilDisp = Math.round(p.oilLevel * 100);
                const nextOilDisp = Math.round(nextOil * 100);
                const prevBattDisp = Math.round((p.batteryLevel ?? 1.0) * 100);
                const nextBattDisp = Math.round(nextBatt * 100);
                
                if (nextOilDisp < prevOilDisp || nextBattDisp < prevBattDisp) {
                  triggeredHaptic = true;
                }

                if (nextBatt < 0.1 && (p.batteryLevel ?? 1.0) >= 0.1) {
                  triggeredLowBattery = true;
                }
                
                return { 
                  ...p, 
                  oilLevel: nextOil,
                  batteryLevel: nextBatt
                };
              }
              return p;
            });
            if (triggeredLowBattery && !isMuted) {
              playLowBatteryBeep();
            }
            if (triggeredHaptic && !isMuted) {
              playSubtleClickHiss();
            }
            return res;
          });
        } else if (activePlayer.device === 'disposable') {
          setPlayers(prevPlayers => {
            let triggeredHaptic = false;
            let triggeredLowBattery = false;
            const res = prevPlayers.map((p, idx) => {
              if (idx === activePlayerIdx) {
                const nextBatt = Math.max(0.01, (p.batteryLevel ?? 1.0) - (0.001 * voltFactor));
                const nextOil = Math.min(1.0, p.oilLevel + (0.0008 * voltFactor));
                
                const prevBattDisp = Math.round((p.batteryLevel ?? 1.0) * 100);
                const nextBattDisp = Math.round(nextBatt * 100);
                const prevOilDisp = Math.round(p.oilLevel * 100);
                const nextOilDisp = Math.round(nextOil * 100);
                
                if (nextBattDisp < prevBattDisp || nextOilDisp > prevOilDisp) {
                  triggeredHaptic = true;
                }

                if (nextBatt < 0.1 && (p.batteryLevel ?? 1.0) >= 0.1) {
                  triggeredLowBattery = true;
                }
                
                return { 
                  ...p, 
                  batteryLevel: nextBatt,
                  oilLevel: nextOil
                };
              }
              return p;
            });
            if (triggeredLowBattery && !isMuted) {
              playLowBatteryBeep();
            }
            if (triggeredHaptic && !isMuted) {
              playSubtleClickHiss();
            }
            return res;
          });
        }

        if (Math.floor(next * 10) % 10 === 0 && next < targetTime) {
          triggerAudioBeep(330 + (next * 45), 'sine', 0.03);
        }

        if (next >= targetTime) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          concludeSuccess();
          return targetTime;
        }
        return next;
      });
    }, 100);
  };

  const haltInhalation = () => {
    if (activeSessionState !== 'INHALING') return;
    clearInterval(timerRef.current!);
    timerRef.current = null;
    
    if (inhaleTimer < targetTime) {
      concludeFail();
    }
  };

  const concludeSuccess = () => {
    stopInhaleSizzle();
    if (!isMuted) playBlinkerSuccessTune();
    setActiveSessionState('SUCCESS');
    updateGlobalStatus('SUCCESS');
    setIsDirectToggled(false);

    try {
      if (navigator.vibrate) {
        navigator.vibrate(350);
      }
    } catch {}

    const bonus = blinkMode === 'TAKE_BLINKER' ? 1 : 2;
    setPlayers(prev => prev.map((p, idx) => {
      if (idx === activePlayerIdx) {
        const nextStreak = (p.streak || 0) + 1;
        const nextScore = p.score + bonus;
        updatePersonalBests(p.name, nextStreak, nextScore, true);

        return { 
          ...p, 
          score: nextScore, 
          status: 'SUCCESS',
          totalBlinks: p.totalBlinks + 1,
          totalAttempts: p.totalAttempts + 1,
          totalDuration: p.totalDuration + targetTime,
          streak: nextStreak
        };
      }
      return p;
    }));

    handleSpawnConfettiCloud();
    setFunnyQuote(SUCCESS_QUOTES[Math.floor(Math.random() * SUCCESS_QUOTES.length)]);
  };

  const concludeFail = () => {
    stopInhaleSizzle();
    if (!isMuted) playBuzzerTune();
    setActiveSessionState('TAPPED_OUT');
    updateGlobalStatus('TAPPED_OUT');
    setIsDirectToggled(false);

    try {
      if (navigator.vibrate) {
        navigator.vibrate([150, 80, 150]);
      }
    } catch {}

    setPlayers(prev => {
      const isThreeOrFour = prev.length >= 3;
      if (isThreeOrFour) {
        playSoundEliminated();
      }
      return prev.map((p, idx) => {
        if (idx === activePlayerIdx) {
          return { 
            ...p, 
            status: 'TAPPED_OUT',
            isEliminated: isThreeOrFour ? true : p.isEliminated,
            totalAttempts: p.totalAttempts + 1,
            totalDuration: p.totalDuration + inhaleTimer,
            streak: 0
          };
        }
        return p;
      });
    });

    setFunnyQuote(FAILURE_QUOTES[Math.floor(Math.random() * FAILURE_QUOTES.length)]);

    // End game immediately (after small transition delay for visual feedback) for 2 players
    if (players.length === 2) {
      setTimeout(() => {
        triggerAudioBeep(450, 'sine', 0.1);
        setGamePhase('SUMMARY');
        setShowCelebration(true);
      }, 1500);
    }
  };

  const updateGlobalStatus = (status: 'IDLE' | 'INHALING' | 'SUCCESS' | 'TAPPED_OUT') => {
    setPlayers(prev => prev.map((p, idx) => idx === activePlayerIdx ? { ...p, status } : p));
  };

  const proceedNextTurn = () => {
    triggerAudioBeep(410, 'sine', 0.08);
    setInhaleTimer(0);
    setActiveSessionState('IDLE');
    setIsDirectToggled(false);
    setFunnyQuote('Select option and draw.');
    
    setPlayers(prev => {
      const resetPlayers = prev.map(p => ({
        ...p,
        status: p.isEliminated ? ('TAPPED_OUT' as const) : ('IDLE' as const)
      }));
      
      // Look for next non-eliminated player index
      let nextIdx = (activePlayerIdx + 1) % prev.length;
      for (let i = 0; i < prev.length; i++) {
        if (!prev[nextIdx].isEliminated) {
          setActivePlayerIdx(nextIdx);
          break;
        }
        nextIdx = (nextIdx + 1) % prev.length;
      }
      
      return resetPlayers;
    });
  };

  const triggerReset = () => {
    triggerAudioBeep(220, 'square', 0.2);
    
    if (baseballTimerRef.current) {
      clearInterval(baseballTimerRef.current);
      baseballTimerRef.current = null;
    }
    stopInhaleSizzle();

    setPlayers(prev => prev.map(p => ({ 
      ...p, 
      score: 0, 
      status: 'IDLE', 
      isEliminated: false,
      oilLevel: p.device === 'disposable' ? 0.0 : 1.0, 
      batteryLevel: 1.0,
      totalBlinks: 0, 
      totalAttempts: 0, 
      totalDuration: 0,
      streak: 0
    })));
    setActivePlayerIdx(0);
    setInhaleTimer(0);
    setActiveSessionState('IDLE');
    setIsDirectToggled(false);
    setFunnyQuote('Reset completed.');
    setDrainTimeRemaining(drainGameDuration);
    
    // Reset baseball specific states
    setBaseballRound(1);
    setBaseballPossessionIdx(0);
    setBaseballActiveSessionState('IDLE');
    setBaseballTimer(0.0);
    setBaseballLogStr('Welcome to the Baseball Arena!');

    setGamePhase('LOBBY');
  };

  // --- BASEBALL GAME ENGINE ---
  // Periodically increment holdTime for active breath holders
  useEffect(() => {
    if (gameMode !== 'BASEBALL' || gamePhase !== 'GAME_ON') return;
    const interval = setInterval(() => {
      setBaseballPlayers((prev) =>
        prev.map((bp) => {
          if (bp.status === 'HOLDING') {
            return { ...bp, holdTime: bp.holdTime + 1 };
          }
          return bp;
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [gameMode, gamePhase]);

  const getNextBaseballSurvivorIdx = (currentIdx: number, list = baseballPlayers): number => {
    if (list.length === 0) return 0;
    let check = (currentIdx + 1) % list.length;
    for (let i = 0; i < list.length; i++) {
      if (!list[check].isEliminated) {
        return check;
      }
      check = (check + 1) % list.length;
    }
    return currentIdx;
  };

  const startBaseballRip = () => {
    if (baseballActiveSessionState === 'RIP_SUCCESS' || baseballActiveSessionState === 'RIP_FAILED') return;
    
    triggerAudioBeep(580, 'triangle', 0.08);
    setBaseballActiveSessionState('RIPPING');
    setBaseballTimer(0.0);
    
    // Set active loader status to RIPPING
    setBaseballPlayers((prev) => 
      prev.map((bp, idx) => idx === baseballPossessionIdx ? { ...bp, status: 'RIPPING' } : bp)
    );

    if (!isMuted) startInhaleSizzle();

    if (baseballTimerRef.current) clearInterval(baseballTimerRef.current);
    
    baseballTimerRef.current = setInterval(() => {
      setBaseballTimer((prev) => {
        const next = Math.min(prev + 0.1, 5.0);
        
        // drain battery/oil
        setBaseballPlayers((prevBp) => {
          return prevBp.map((bp, idx) => {
            if (idx === baseballPossessionIdx) {
              const voltFactor = voltage === 2.4 ? 0.6 : voltage === 4.0 ? 1.6 : 1.0;
              const isPremiumDispo = bp.device === 'muhameds' || bp.device === 'boutiq';
              const battDrainFactor = isPremiumDispo ? 0.001 : 0.0006;
              const nextBatt = Math.max(0.01, (bp.batteryLevel ?? 1.0) - (battDrainFactor * voltFactor));
              const nextOil = Math.max(0.01, bp.oilLevel - (0.0008 * voltFactor));
              return {
                ...bp,
                batteryLevel: nextBatt,
                oilLevel: nextOil
              };
            }
            return bp;
          });
        });

        // Pulsing beeps at every integer second
        if (Math.round(next * 10) % 10 === 0 && next < 5.0 && next > 0) {
          triggerAudioBeep(340 + (next * 50), 'sine', 0.04);
        }

        if (next >= 5.0) {
          clearInterval(baseballTimerRef.current!);
          baseballTimerRef.current = null;
          concludeBaseballRipSuccess();
          return 5.0;
        }
        return next;
      });
    }, 100);
  };

  const haltBaseballRip = () => {
    if (baseballActiveSessionState !== 'RIPPING') return;
    clearInterval(baseballTimerRef.current!);
    baseballTimerRef.current = null;
    
    if (baseballTimer < 5.0) {
      concludeBaseballRipFail();
    }
  };

  const concludeBaseballRipSuccess = () => {
    stopInhaleSizzle();
    if (!isMuted) playBlinkerSuccessTune();
    setBaseballActiveSessionState('RIP_SUCCESS');
    handleSpawnConfettiCloud();
    
    const activePlayer = baseballPlayers[baseballPossessionIdx];
    setBaseballLogStr(`${activePlayer?.name || 'Player'} completed an extraordinary 5s rip! Now HOLDING.`);
    
    setBaseballPlayers((prev) => 
      prev.map((bp, idx) => 
        idx === baseballPossessionIdx 
          ? { ...bp, status: 'HOLDING', holdTime: 0, hasRippedThisRound: true } 
          : bp
      )
    );
  };

  const concludeBaseballRipFail = () => {
    stopInhaleSizzle();
    if (!isMuted) playBuzzerTune();
    
    const failedPlayer = baseballPlayers[baseballPossessionIdx];
    setBaseballFailedPlayerName(failedPlayer?.name || 'Someone');
    setBaseballActiveSessionState('ROUND_FAILED_POPUP');
    setBaseballLogStr(`${failedPlayer?.name || 'Someone'} choked on the rip! Disqualified!`);
    
    setBaseballPlayers((prev) => 
      prev.map((bp, idx) => 
        idx === baseballPossessionIdx 
          ? { ...bp, status: 'DISQUALIFIED', isEliminated: true } 
          : bp
      )
    );
  };

  const handleEarlyExhaleDisqualify = (playerIdx: number) => {
    triggerAudioBeep(120, 'sawtooth', 0.45);
    const failedPlayer = baseballPlayers[playerIdx];
    setBaseballFailedPlayerName(failedPlayer?.name || 'Someone');

    if (baseballTimerRef.current) {
      clearInterval(baseballTimerRef.current);
      baseballTimerRef.current = null;
    }
    stopInhaleSizzle();

    setBaseballActiveSessionState('ROUND_FAILED_POPUP');
    setBaseballLogStr(`${failedPlayer?.name || 'Someone'} exhaled without the cartridge! Disqualified!`);

    setBaseballPlayers((prev) => 
      prev.map((bp, idx) => 
        idx === playerIdx 
          ? { ...bp, status: 'DISQUALIFIED', isEliminated: true } 
          : bp
      )
    );
  };

  const startNextBaseballRound = () => {
    triggerAudioBeep(523, 'sine', 0.1);
    
    const survivors = baseballPlayers.filter((bp) => !bp.isEliminated);
    if (survivors.length <= 1) {
      // Baseball Completed! Map scores of players
      setPlayers((prev) => 
        prev.map((p) => {
          const bp = baseballPlayers.find((b) => b.id === p.id);
          if (bp) {
            return {
              ...p,
              isEliminated: bp.isEliminated,
              score: p.score + (bp.isEliminated ? 0 : 5)
            };
          }
          return p;
        })
      );
      setGamePhase('SUMMARY');
      setShowCelebration(true);
      return;
    }

    setBaseballRound((prev) => prev + 1);
    setBaseballPlayers((prev) => 
      prev.map((bp) => {
        if (bp.isEliminated) return bp;
        return {
          ...bp,
          status: 'IDLE',
          holdTime: 0,
          hasRippedThisRound: false
        };
      })
    );

    const firstSurvivorIdx = baseballPlayers.findIndex((bp) => !bp.isEliminated);
    setBaseballPossessionIdx(firstSurvivorIdx >= 0 ? firstSurvivorIdx : 0);
    setBaseballTimer(0.0);
    setBaseballActiveSessionState('IDLE');
    setBaseballLogStr(`Round ${baseballRound + 1} started! Pass the cartridge.`);
  };

  const handleInitializeBaseballGame = () => {
    const freshList = players.map(p => ({
      id: p.id,
      name: p.name,
      device: p.device,
      status: 'IDLE' as const,
      holdTime: 0,
      hasRippedThisRound: false,
      isEliminated: false,
      oilLevel: p.oilLevel,
      batteryLevel: p.batteryLevel ?? 1.0
    }));

    setBaseballPlayers(freshList);
    setBaseballRound(1);
    setBaseballPossessionIdx(0);
    setBaseballActiveSessionState('IDLE');
    setBaseballTimer(0.0);
    setBaseballLogStr('Batter up! Press hold to start taking your 5s Baseball rip.');
    setGamePhase('GAME_ON');
  };



  const handleAddNewPlayer = () => {
    let chosenName = newPlayerName.trim().toUpperCase();
    if (!chosenName) {
      const untitledCount = players.filter(p => p.name.includes('UNTITLED')).length;
      chosenName = untitledCount > 0 ? `UNTITLED ${untitledCount + 1}` : 'UNTITLED';
    }
    
    if (players.length >= 4) {
      triggerAudioBeep(150, 'sawtooth', 0.2);
      return;
    }

    const brandNew: Player = {
      id: String(Date.now()),
      name: chosenName,
      score: 0,
      device: newPlayerDevice,
      oilLevel: newPlayerDevice === 'disposable' ? 0.0 : 1.0,
      batteryLevel: 1.0,
      status: 'IDLE',
      totalBlinks: 0,
      totalAttempts: 0,
      totalDuration: 0,
      streak: 0
    };

    setPlayers([...players, brandNew]);
    setNewPlayerName('');
    playSoundPlayerAdded();
  };

  const handleRemovePlayer = (id: string) => {
    setPlayers(players.filter(p => p.id !== id));
    playSoundPlayerRemoved();
  };

  const getScreenRumbleStyle = () => {
    if (activeSessionState !== 'INHALING') return '';
    if (progressRatio > 0.85) return 'shake-heavy';
    if (progressRatio > 0.55) return 'shake-medium';
    if (progressRatio > 0.25) return 'shake-mild';
    return '';
  };

  // Identify leading player
  const leadingPlayer = [...players].sort((a, b) => b.score - a.score)[0];

  return (
    <div className="min-h-screen bg-[#0c041b] text-white bg-scanlines font-mono selection:bg-[#a855f7] selection:text-black relative flex flex-col justify-between overflow-x-hidden">
      
      {/* Dynamic Animated Vector Particle Overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-40">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute font-mono rounded flex items-center justify-center text-center select-none"
            style={{
              left: `${p.x}px`,
              top: `${p.y}px`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              opacity: p.opacity,
              transform: `translate(-50%, -50%) rotate(${p.rotation}deg)`,
              boxShadow: `0 0 10px ${p.color}`,
              color: p.color,
              fontSize: '11px',
            }}
          />
        ))}
      </div>

      {/* Celebratory Leaderboard Overlay triggered when results view is shown */}
      <AnimatePresence>
        {gamePhase === 'SUMMARY' && showCelebration && leadingPlayer && leadingPlayer.score > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 pointer-events-auto"
          >
            <CelebrationOverlay 
              playerName={leadingPlayer.name} 
              score={leadingPlayer.score} 
              onClose={() => setShowCelebration(false)} 
              isBaseball={gameMode === 'BASEBALL'}
            />
          </motion.div>
        )}
      </AnimatePresence>



      {/* Modern High-End Neo-Brutalist Header */}
      <header className="w-full bg-[#11061c] border-b-4 border-black p-4 z-10 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <div className="w-6 h-6 rounded-full animate-purple-pulse border-2 border-black" />
          </div>
          <div>
            <span className="font-mono text-[10px] text-[#00f3ff] block uppercase">Blinker Mini Game</span>
            <h1 className="font-sans text-3xl font-extrabold tracking-tight bg-gradient-to-r from-[#d946ef] to-[#a855f7] bg-clip-text text-transparent select-none glitch-text">
              Blinker Game
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            id="info-toggle-btn"
            onClick={() => {
              setIsInfoOpen(true);
              triggerAudioBeep(520, 'sine', 0.05);
            }}
            className="p-3 border-2 border-black bg-[#1f0e2d] hover:bg-[#00f3ff] hover:text-black transition-all flex items-center justify-center gap-1.5 neo-box-click font-bold text-xs"
          >
            <Info size={16} />
            <span className="hidden sm:inline">GUIDE</span>
          </button>

          <button 
            id="audio-toggle-btn"
            onClick={() => {
              setIsMuted(!isMuted);
              triggerAudioBeep(400, 'sine', 0.05);
            }}
            className="p-3 border-2 border-black bg-[#1f0e2d] hover:bg-[#ff007f] hover:text-black transition-all flex items-center justify-center neo-box-click"
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          <button 
            id="global-reset-btn"
            onClick={triggerReset}
            className="font-mono text-xs p-3 border-2 border-black bg-red-950 text-red-200 hover:bg-red-500 hover:text-white transition-all flex items-center gap-2 neo-box-click font-bold"
          >
            <RefreshCw size={12} />
            Reset
          </button>
        </div>
      </header>

      {/* Main Core Window Grid */}
      <main className="w-full max-w-6xl mx-auto p-4 flex-grow flex flex-col justify-center items-stretch z-10 my-2 gap-6">
        
        {/* LOBBY / SQUAD SETUP VIEW */}
        <AnimatePresence mode="wait">
          {gamePhase === 'LOBBY' && (
            <motion.div
              key="lobby-screen"
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -15 }}
              transition={{ type: "spring", stiffness: 180, damping: 20 }}
              className="w-full max-w-2xl mx-auto flex flex-col gap-6 self-center"
            >
              
              <div className="bg-[#13071f] border-4 border-black p-6 neo-box-purple relative overflow-hidden">
              <div className="absolute right-0 top-0 w-24 h-24 bg-[#7b2cbf] opacity-10 transform rotate-45 translate-x-12 -translate-y-12" />
              
              <h2 className="font-sans text-xl font-bold text-[#d946ef] mb-2 flex items-center gap-2">
                <ChevronRight size={24} className="text-[#a855f7]" /> Rules
              </h2>
              <p className="font-mono text-sm leading-relaxed text-slate-200 mb-4 font-sans">
                Tap the button to start taking a blinker. Tap the button again to stop, or tap out if you can't keep drawing. Stop exactly on the target time to score.
              </p>
              <div className="inline-flex items-center gap-2 font-mono text-xs bg-black/50 border border-[#a855f7]/30 px-3 py-1.5 rounded text-slate-300">
                <span className="font-bold text-[#d946ef]">IG:</span>
                <a href="https://instagram.com/blinkergamefhs" target="_blank" rel="noopener noreferrer" className="hover:underline text-[#00f3ff] font-bold">
                  @blinkergamefhs
                </a>
              </div>
            </div>

            {/* Blinker info board */}
            <div className="bg-[#120a1f] border-4 border-black p-4 neo-box-cyan flex flex-col gap-2">
              <h3 className="font-sans text-xs text-[#00f3ff] font-bold uppercase tracking-wider flex items-center gap-1.5 select-none">
                <Sparkles size={13} className="text-[#00f3ff] animate-pulse" /> Standard Blinker Challenge
              </h3>
              <p className="font-mono text-[11px] leading-relaxed text-slate-400 font-sans">
                Accumulate points by successfully sustaining deep draws for full target durations (8.0s or 10.0s) without stopping early or tapping out.
              </p>
            </div>

            {/* Input form */}
            <div className="bg-[#120a1f] border-4 border-black p-5 neo-box-cyan flex flex-col gap-5">
              <div className="flex justify-between items-center">
                <h3 className="font-mono text-xs text-[#39ff14] flex items-center gap-2 font-bold select-none">
                  <Plus size={18} /> Players ({players.length} / 4)
                </h3>
                <span className="font-mono text-[10px] text-slate-500">Max 4 players</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#0a0512] p-4 border-2 border-black">
                <div className="flex flex-col gap-1.5 justify-center">
                  <label className="font-mono text-[10px] text-slate-400">Name</label>
                  <input 
                    type="text"
                    placeholder="Enter name"
                    maxLength={14}
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value.toUpperCase())}
                    className="w-full bg-[#140b20] border-2 border-black p-2.5 font-mono text-sm text-[#39ff14] focus:outline-none focus:border-[#a855f7] transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[10px] text-slate-400">Device</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setNewPlayerDevice('cartridge');
                        triggerAudioBeep(320, 'sine', 0.04);
                      }}
                      className={`font-mono text-xs p-2.5 border-2 transition-all flex items-center justify-center gap-2 ${
                        newPlayerDevice === 'cartridge'
                          ? 'bg-[#ff007f] text-black border-black font-bold'
                          : 'bg-zinc-950 text-slate-400 border-zinc-800 hover:border-slate-500'
                      }`}
                    >
                      <PixelCartridgeIcon size={16} />
                      <span>Cartridge</span>
                    </button>
                    <button
                      onClick={() => {
                        setNewPlayerDevice('disposable');
                        triggerAudioBeep(320, 'sine', 0.04);
                      }}
                      className={`font-mono text-xs p-2.5 border-2 transition-all flex items-center justify-center gap-2 ${
                        newPlayerDevice === 'disposable'
                          ? 'bg-[#00f3ff] text-black border-black font-bold'
                          : 'bg-zinc-950 text-slate-400 border-zinc-800 hover:border-slate-500'
                      }`}
                    >
                      <PixelDisposableIcon size={16} />
                      <span>Disposable</span>
                    </button>
                    <button
                      onClick={() => {
                        setNewPlayerDevice('muhameds');
                        triggerAudioBeep(320, 'sine', 0.04);
                      }}
                      className={`font-mono text-xs p-2.5 border-2 transition-all flex items-center justify-center gap-2 ${
                        newPlayerDevice === 'muhameds'
                          ? 'bg-[#eab308] text-black border-black font-bold'
                          : 'bg-zinc-950 text-slate-400 border-zinc-800 hover:border-slate-500'
                      }`}
                    >
                      <PixelMuhaIcon size={16} />
                      <span>Muha Meds</span>
                    </button>
                    <button
                      onClick={() => {
                        setNewPlayerDevice('boutiq');
                        triggerAudioBeep(320, 'sine', 0.04);
                      }}
                      className={`font-mono text-xs p-2.5 border-2 transition-all flex items-center justify-center gap-2 ${
                        newPlayerDevice === 'boutiq'
                          ? 'bg-[#a78bfa] text-black border-black font-bold'
                          : 'bg-zinc-950 text-slate-400 border-zinc-800 hover:border-slate-500'
                      }`}
                    >
                      <PixelBoutiqIcon size={16} />
                      <span>Boutiq</span>
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={handleAddNewPlayer}
                disabled={players.length >= 4}
                className={`w-full font-sans text-sm p-4 border-4 border-black select-none text-black font-bold transition-all duration-150 ${
                  players.length >= 4
                    ? 'bg-zinc-700 opacity-40 cursor-not-allowed text-zinc-500'
                    : 'bg-[#39ff14] hover:bg-[#5aff39] hover:translate-x-0.5 hover:translate-y-0.5 active:translate-y-1 active:translate-x-1 cursor-pointer shadow-[5px_5px_0_#000]'
                }`}
              >
                Add player
              </button>
            </div>

            {/* Configured Roster Grid */}
            <div className="bg-[#120a1f] border-4 border-black p-5 neo-box-purple">
              <h3 className="font-mono text-xs mb-4 text-[#d946ef] font-bold">
                Players ({players.length}/4)
              </h3>
              
              {players.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-[#222]">
                  <p className="font-mono text-xs text-slate-500">No players entered</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2 relative">
                  <AnimatePresence initial={false}>
                    {players.map((p, idx) => (
                      <motion.div 
                        key={p.id}
                        initial={{ opacity: 0, x: -30, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 40, scale: 0.9, transition: { duration: 0.2 } }}
                        transition={{ type: "spring", stiffness: 350, damping: 25 }}
                        className="bg-black/50 border-2 border-black p-3.5 flex items-center justify-between gap-4 origin-left"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-[10px] text-zinc-600 block">Player {idx + 1}</span>
                          <div>
                            <p className="font-mono text-xs text-white uppercase">{p.name}</p>
                            <span className="font-mono text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                              {getDeviceIcon(p.device, 12)}
                              <span>{getDeviceName(p.device)}</span>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span 
                            className="font-mono text-[10px] border px-1.5 py-0.5 flex items-center gap-1 font-bold"
                            style={{
                              borderColor: getDeviceAccentColor(p.device),
                              color: getDeviceAccentColor(p.device),
                              backgroundColor: `${getDeviceAccentColor(p.device)}10`
                            }}
                          >
                            {getDeviceIcon(p.device, 11)} {getDeviceName(p.device)}
                          </span>
                          <button
                            onClick={() => handleRemovePlayer(p.id)}
                            className="text-red-500 hover:text-red-300 p-1.5 bg-[#170e24] border border-black hover:bg-black transition-colors"
                            title="Remove"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {/* GAME MODE SELECTOR */}
              <div className="bg-[#0e0717] p-4 border-2 border-black mt-4">
                <span className="font-mono text-[10px] text-zinc-400 block mb-2 uppercase font-bold tracking-wider">Select Arena Rulebook</span>
                <div className="grid grid-cols-2 gap-3.5">
                  <button
                    onClick={() => {
                      setGameMode('CLASSIC');
                      playSoundModeSelect();
                    }}
                    className={`font-mono text-xs p-3 border-2 transition-all flex flex-col items-center gap-1.5 text-center ${
                      gameMode === 'CLASSIC'
                        ? 'bg-[#39ff14]/15 border-[#39ff14] text-[#39ff14] font-bold shadow-[2px_2px_0_#39ff14]'
                        : 'bg-zinc-950/80 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <span className="text-sm font-bold">CLASSIC</span>
                    <span className="text-[9px] text-zinc-500 font-sans">Draw to target duration (8s/10s)</span>
                  </button>
                  <button
                    onClick={() => {
                      setGameMode('BASEBALL');
                      playSoundModeSelect();
                    }}
                    className={`font-mono text-xs p-3 border-2 transition-all flex flex-col items-center gap-1.5 text-center ${
                      gameMode === 'BASEBALL'
                        ? 'bg-[#ffe400]/15 border-[#ffe400] text-[#ffe400] font-bold shadow-[2px_2px_0_#ffe400]'
                        : 'bg-zinc-950/80 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <span className="text-sm font-bold flex items-center gap-1">BASEBALL</span>
                    <span className="text-[9px] text-zinc-500 font-sans">5s rip, hold & pass around circle</span>
                  </button>
                </div>
              </div>

              {players.length >= 2 ? (
                <button
                  onClick={() => {
                    if (gameMode === 'BASEBALL') {
                      handleInitializeBaseballGame();
                    } else {
                      triggerAudioBeep(620, 'square', 0.2);
                      setDrainTimeRemaining(drainGameDuration);
                      setGamePhase('GAME_ON');
                    }
                  }}
                  className="w-full mt-4 bg-[#ffd700] hover:bg-[#ffdf1c] font-sans text-sm text-black font-bold p-4 border-4 border-black shadow-[6px_6px_0_#000] hover:translate-x-0.5 hover:translate-y-0.5 active:translate-y-1.5 active:translate-x-1.5 transition-all flex items-center justify-center gap-2"
                >
                  <Play size={16} /> Start
                </button>
              ) : (
                <div className="w-full mt-4 bg-zinc-950 p-4 border-2 border-dashed border-zinc-800 text-center font-mono text-xs text-zinc-500">
                  Add 2 players to start.
                </div>
              )}
            </div>
            
          </motion.div>
        )}
      </AnimatePresence>

      {/* ACTIVE COMBAT SCENE VIEW */}
      <AnimatePresence mode="wait">
        {gamePhase === 'GAME_ON' && gameMode === 'BASEBALL' && (
          <motion.div
            key="baseball-game-screen"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.35 }}
            className="w-full flex flex-col gap-6 text-slate-100"
          >
            <div className="bg-[#110520] border-4 border-black p-4 neo-box shadow-none flex justify-between items-center flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="bg-[#ffd700] text-black font-sans font-black text-xs px-2.5 py-1 uppercase tracking-widest border border-black animate-bounce">
                  ⚾ BASEBALL ROUND {baseballRound}
                </div>
                <div className="font-mono text-xs text-slate-400">
                  Hold & Pass Arena
                </div>
              </div>
              <div className="font-mono text-xs text-[#00f3ff] bg-black/60 px-3 py-1.5 border border-[#00f3ff]/30 w-full md:w-auto text-center md:text-left">
                📢 <span className="text-white font-bold">{baseballLogStr}</span>
              </div>
            </div>

            {/* Baseball Players Roster Bases */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full">
              {baseballPlayers.map((bp, idx) => {
                const isPossessing = idx === baseballPossessionIdx;
                const isElim = bp.isEliminated;

                // Border and shadow dynamic classes
                let cardBorder = 'border-[#222]';
                let shadowColor = 'shadow-[none]';
                
                if (isElim) {
                  cardBorder = 'border-red-950 opacity-40';
                } else if (bp.status === 'RIPPING') {
                  cardBorder = 'border-[#ff007f]';
                  shadowColor = 'shadow-[0_0_15px_rgba(255,0,127,0.35)]';
                } else if (bp.status === 'HOLDING') {
                  cardBorder = 'border-[#39ff14]';
                  shadowColor = 'shadow-[0_0_15px_rgba(57,255,20,0.25)]';
                } else if (bp.status === 'SAFE') {
                  cardBorder = 'border-[#00f3ff]';
                } else if (bp.status === 'DISQUALIFIED') {
                  cardBorder = 'border-red-600';
                }

                return (
                  <div
                    key={bp.id}
                    className={`bg-[#0d0517] border-4 p-4 flex flex-col justify-between relative transition-all duration-200 select-none ${cardBorder} ${shadowColor}`}
                  >
                    {/* Cartridge possession crown/badge */}
                    {isPossessing && !isElim && (
                      <div className="absolute -top-3.5 right-4 bg-[#ffd700] text-black font-mono text-[9px] px-2.5 py-0.5 border-2 border-black font-bold uppercase tracking-wider animate-pulse flex items-center gap-1">
                        🔌 HAS CART
                      </div>
                    )}

                    {/* Status corner badge */}
                    <div className="absolute -top-3.5 left-4 border-2 border-black font-mono text-[9px] px-2 py-0.5 font-bold uppercase">
                      {isElim || bp.status === 'DISQUALIFIED' ? (
                        <span className="bg-red-600 text-white px-1">OUT ❌</span>
                      ) : bp.status === 'RIPPING' ? (
                        <span className="bg-[#ff007f] text-white px-1 animate-pulse">RIPPING 🔥</span>
                      ) : bp.status === 'HOLDING' ? (
                        <span className="bg-[#39ff14] text-black px-1">HOLDING 🟢</span>
                      ) : bp.status === 'SAFE' ? (
                        <span className="bg-[#00f3ff] text-black px-1">SAFE 💨</span>
                      ) : (
                        <span className="bg-zinc-800 text-zinc-400 px-1">READY 💤</span>
                      )}
                    </div>

                    {/* Player Info */}
                    <div className="flex items-start justify-between gap-2 mt-2">
                      <div className="flex items-center gap-2">
                        <AvatarBadge score={isElim ? 0 : 3} status={bp.status === 'RIPPING' ? 'INHALING' : bp.status === 'HOLDING' ? 'IDLE' : bp.status === 'SAFE' ? 'SUCCESS' : 'TAPPED_OUT'} />
                        <div className="overflow-hidden">
                          <h4 className="font-mono text-xs text-white uppercase truncate font-bold">
                            {bp.name}
                          </h4>
                          <span className="font-mono text-[9px] text-zinc-500 flex items-center gap-0.5 mt-0.5">
                            {getDeviceIcon(bp.device, 10)} {getDeviceName(bp.device)}
                          </span>
                        </div>
                      </div>
                      <BatteryIcon level={bp.batteryLevel} />
                    </div>

                    {/* Holding seconds progress tracking */}
                    <div className="my-3 py-1.5 border-t border-b border-zinc-900 bg-black/40 px-2 text-center text-[11px] font-mono">
                      {bp.status === 'HOLDING' ? (
                        <div className="text-emerald-400 flex flex-col items-center gap-0.5">
                          <span className="font-bold text-center">HOLD TIME: {bp.holdTime}s</span>
                          <span className="text-[8px] text-zinc-500 animate-pulse uppercase">Hold your breath!</span>
                        </div>
                      ) : bp.status === 'SAFE' ? (
                        <div className="text-cyan-400 font-bold uppercase">
                          Safe ({bp.holdTime}s held)
                        </div>
                      ) : bp.status === 'RIPPING' ? (
                        <span className="text-[#ff007f] font-bold uppercase animate-pulse">DRAWING...</span>
                      ) : isElim || bp.status === 'DISQUALIFIED' ? (
                        <span className="text-red-500 uppercase font-bold text-[10px]">Cough/Eliminated ❌</span>
                      ) : (
                        <span className="text-slate-500">Normal Breath</span>
                      )}
                    </div>

                    {/* Early Exhale Trigger button for holding non-possessing players */}
                    {bp.status === 'HOLDING' && !isPossessing && !isElim && (
                      <button
                        onClick={() => handleEarlyExhaleDisqualify(idx)}
                        className="w-full font-mono text-[9px] bg-red-950/80 hover:bg-red-800 text-red-100 py-1.5 px-2 border border-red-700 uppercase font-black tracking-wide hover:translate-y-0.5 transition-all text-center cursor-pointer"
                      >
                        💨 I EXHALED EARLY / COUGHED
                      </button>
                    )}
                    
                    {/* Disqualified status decoration */}
                    {(isElim || bp.status === 'DISQUALIFIED') && (
                      <div className="text-center font-mono text-[8px] text-red-500/80 uppercase py-1">
                        Permanently out
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* CENTRAL CONSOLE */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#11061c] border-4 border-black p-6 neo-box relative">
              
              {/* Left Column: Graphical Draw Screen */}
              <div className="lg:col-span-4 flex flex-col justify-center items-center bg-[#07030e] border-2 border-black p-4 relative min-h-[220px] transition-transform">
                
                {/* Smoke Trail Animations for active draws */}
                {baseballActiveSessionState === 'RIPPING' && (
                  <div className="absolute inset-0 pointer-events-none z-20">
                    <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 flex flex-col items-center">
                      {getSmokeParticles().slice(0, 12).map((p) => (
                        <div
                          key={p.id}
                          className={`absolute rounded-full ${p.bg} animate-smoke-${p.dir}`}
                          style={{
                            animationDelay: p.delay,
                            width: p.size,
                            height: p.size,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Persistent Faint Drifting White Trail Clouds */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-25">
                  {trailParticles.map((t) => (
                    <div
                      key={t.id}
                      className="absolute rounded-full p-0 m-0"
                      style={{
                        left: `calc(50% + ${t.x}px)`,
                        top: `${t.y}px`,
                        width: `${t.size * 2.2}px`,
                        height: `${t.size * 2.2}px`,
                        background: 'radial-gradient(circle, rgba(235, 235, 240, 0.45) 0%, rgba(235, 235, 240, 0.15) 50%, rgba(235, 235, 240, 0) 100%)',
                        opacity: t.opacity,
                        transform: 'translate(-50%, -50%)',
                      }}
                    />
                  ))}
                </div>

                {/* Vector SVG of the current player carrying the cart */}
                {baseballPlayers[baseballPossessionIdx] && (
                  <>
                    {baseballPlayers[baseballPossessionIdx].device === 'cartridge' && (
                      <CartridgeSVG 
                        oilLevel={baseballPlayers[baseballPossessionIdx].oilLevel}
                        isPulsing={baseballActiveSessionState === 'RIPPING'}
                        voltage={voltage}
                        batteryLevel={baseballPlayers[baseballPossessionIdx].batteryLevel}
                        isCompleted={baseballActiveSessionState === 'RIP_SUCCESS'}
                        progress={baseballTimer / 5.0}
                      />
                    )}
                    {baseballPlayers[baseballPossessionIdx].device === 'disposable' && (
                      <DisposableVapeSVG 
                        isPulsing={baseballActiveSessionState === 'RIPPING'}
                        oilLevel={baseballPlayers[baseballPossessionIdx].oilLevel}
                        batteryLevel={baseballPlayers[baseballPossessionIdx].batteryLevel}
                        voltage={voltage}
                        isCompleted={baseballActiveSessionState === 'RIP_SUCCESS'}
                        progress={baseballTimer / 5.0}
                      />
                    )}
                    {baseballPlayers[baseballPossessionIdx].device === 'muhameds' && (
                      <MuhaMedsSVG 
                        isPulsing={baseballActiveSessionState === 'RIPPING'}
                        oilLevel={baseballPlayers[baseballPossessionIdx].oilLevel}
                        batteryLevel={baseballPlayers[baseballPossessionIdx].batteryLevel}
                        voltage={voltage}
                        isCompleted={baseballActiveSessionState === 'RIP_SUCCESS'}
                        progress={baseballTimer / 5.0}
                      />
                    )}
                    {baseballPlayers[baseballPossessionIdx].device === 'boutiq' && (
                      <BoutiqSVG 
                        isPulsing={baseballActiveSessionState === 'RIPPING'}
                        oilLevel={baseballPlayers[baseballPossessionIdx].oilLevel}
                        batteryLevel={baseballPlayers[baseballPossessionIdx].batteryLevel}
                        voltage={voltage}
                        isCompleted={baseballActiveSessionState === 'RIP_SUCCESS'}
                        progress={baseballTimer / 5.0}
                        playerName={baseballPlayers[baseballPossessionIdx].name}
                        selectedTank={selectedTank}
                        onToggleTank={handleToggleBoutiqTank}
                        onClickButton={() => {}}
                        customLeft={customLeftLabel}
                        customRight={customRightLabel}
                      />
                    )}
                  </>
                )}

                <div className="mt-2 text-center w-full">
                  <span className="text-[10px] font-mono flex items-center justify-center gap-1.5 font-bold" style={{ color: getDeviceAccentColor(baseballPlayers[baseballPossessionIdx]?.device || 'cartridge') }}>
                    {getDeviceIcon(baseballPlayers[baseballPossessionIdx]?.device || 'cartridge', 12)}
                    <span>{baseballPlayers[baseballPossessionIdx] ? getDeviceName(baseballPlayers[baseballPossessionIdx].device) : 'Cartridge'}</span>
                  </span>
                </div>
              </div>

              {/* Right Column: Console Control Screen & Action buttons */}
              <div className="lg:col-span-8 flex flex-col justify-between gap-4">
                
                {/* Active holding / turn banner */}
                <div className="border-b border-zinc-800 pb-3">
                  <span className="font-mono text-[10px] text-slate-400 block mb-1">POSSESSION OF CARTRIDGE</span>
                  <div className="flex justify-between items-center">
                    <h3 className="font-sans text-xl font-bold text-[#ffd700] uppercase tracking-tight flex items-center gap-2">
                       {baseballPlayers[baseballPossessionIdx]?.name || 'Player'}
                    </h3>
                    <div className="font-mono text-xs bg-[#00f3ff]/10 border border-[#00f3ff]/30 text-[#00f3ff] px-2 py-0.5 font-bold">
                      {baseballPlayers.length > 0 && baseballPlayers.filter(bp => !bp.isEliminated).every(bp => bp.hasRippedThisRound) ? 'EXHALATION TURN 💨' : 'RIP TURN 💨'}
                    </div>
                  </div>
                </div>

                {/* Display different prompts based on baseball state */}
                <div className="bg-[#080310] border-2 border-black p-4 flex-1 flex flex-col justify-center min-h-[120px]">
                  {baseballActiveSessionState === 'ROUND_FAILED_POPUP' ? (
                    <div className="text-center">
                      <span className="text-red-500 font-extrabold text-sm uppercase block tracking-widest mb-1.5">❌ PLAYER OUT</span>
                      <p className="font-mono text-xs text-white max-w-sm mx-auto">
                        <strong>{baseballFailedPlayerName}</strong> exhaled early or coughed! They have been disqualified from the Baseball circular ring.
                      </p>
                      <p className="font-mono text-[10px] text-zinc-500 mt-2">
                        Click below to terminate this round and proceed survivors.
                      </p>
                    </div>
                  ) : (baseballPlayers.length > 0 && baseballPlayers.filter(bp => !bp.isEliminated).every(bp => bp.hasRippedThisRound)) ? (
                    // EXHALING TURN
                    <div className="text-center">
                      {baseballPlayers[baseballPossessionIdx]?.status === 'SAFE' ? (
                        <div>
                          <p className="text-[#39ff14] font-bold text-xs uppercase flex items-center justify-center gap-1.5 mb-1">
                            ✅ SAFE EXHALATION COMPLETED!
                          </p>
                          <p className="font-mono text-[11px] text-zinc-400">
                            Excellent! Pass the cartridge to the next survivor so they are cleared to exhale as well.
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="font-sans text-xs text-[#00f3ff] font-bold uppercase tracking-wider mb-1">
                            Cleared to Exhale!
                          </p>
                          <p className="font-mono text-[11px] text-slate-300 max-w-sm mx-auto">
                            The cartridge is in your hand. You are safely allowed to EXHALE now! Click the action button below to declare.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    // RIP TURN
                    <div className="text-center">
                      {baseballActiveSessionState === 'RIP_SUCCESS' ? (
                        <div>
                          <p className="text-[#39ff14] font-bold text-xs uppercase mb-1">
                            🔥 SUCCESSFUL DRAW!
                          </p>
                          <p className="font-mono text-[11px] text-slate-300">
                            You took a 5-second pull. Keep holding your breath in real life, and pass the cartridge to the next player!
                          </p>
                        </div>
                      ) : baseballActiveSessionState === 'RIPPING' ? (
                        <div className="flex flex-col items-center">
                          <span className="text-[#ff007f] font-mono text-[10px] uppercase font-bold animate-pulse tracking-widest mb-2">
                            DRAWING VAPOR (5.0s TARGET)
                          </span>
                          
                          {/* Sled Timer visualizer */}
                          <div className="text-4xl font-mono font-black text-white px-6 py-2.5 bg-black/60 border-2 border-black rounded shadow-[3px_3px_0_#ff007f]">
                            {baseballTimer.toFixed(1)}s
                          </div>

                          {/* Progress bar */}
                          <div className="w-full max-w-[240px] bg-zinc-950 h-3 border border-zinc-800 p-0.5 mt-3">
                            <div 
                              className="h-full bg-gradient-to-r from-[#ff007f] to-[#ff75c3] transition-all duration-75"
                              style={{ width: `${(baseballTimer / 5.0) * 100}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="font-sans text-xs text-[#39ff14] font-bold uppercase tracking-wide mb-1">
                            Your turn to Rip!
                          </p>
                          <p className="font-mono text-[11px] text-slate-300 max-w-sm mx-auto">
                            Take a full 5.0-second draw. You are strictly FORBIDDEN from exhaling after this! Keep it held until the cart rounds the circle.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Console Action Panel (Execution button deck) */}
                <div>
                  {baseballActiveSessionState === 'ROUND_FAILED_POPUP' ? (
                    <button
                      onClick={startNextBaseballRound}
                      className="w-full bg-red-650 hover:bg-red-500 font-sans text-xs text-white font-bold p-4 border-4 border-black shadow-[4px_4px_0_#000] active:translate-y-0.5 cursor-pointer text-center uppercase"
                    >
                      ADVANCE TO NEXT ROUND (WITHOUT {baseballFailedPlayerName}) 👉
                    </button>
                  ) : (baseballPlayers.length > 0 && baseballPlayers.filter(bp => !bp.isEliminated).every(bp => bp.hasRippedThisRound)) ? (
                    // EXHALATION RETAIN ACTIONS
                    <div className="flex flex-col gap-3">
                      {baseballPlayers[baseballPossessionIdx]?.status === 'SAFE' ? (
                        // If current player already exhaled, show standard pass button
                        <div>
                          {baseballPlayers.filter(bp => !bp.isEliminated && bp.status === 'HOLDING').length > 0 ? (
                            <button
                              onClick={() => {
                                playSoundUiClick();
                                const nextIdx = getNextBaseballSurvivorIdx(baseballPossessionIdx);
                                setBaseballPossessionIdx(nextIdx);
                                setBaseballTimer(0);
                                setBaseballActiveSessionState('IDLE');
                                setBaseballLogStr(`Pass the cartridge to ${baseballPlayers[nextIdx].name} to exhale.`);
                              }}
                              className="w-full bg-[#00f3ff] hover:bg-cyan-450 font-sans text-xs text-black font-bold p-4 border-4 border-black shadow-[4px_4px_0_#000] active:translate-y-0.5 uppercase tracking-wider cursor-pointer"
                            >
                              PASS CARTRIDGE TO {baseballPlayers[getNextBaseballSurvivorIdx(baseballPossessionIdx)]?.name} 👉
                            </button>
                          ) : (
                            // All players safe!
                            <button
                              onClick={startNextBaseballRound}
                              className="w-full bg-[#39ff14] hover:bg-emerald-400 font-sans text-xs text-black font-bold p-4 border-4 border-black shadow-[5px_5px_0_#000] hover:translate-x-0.5 hover:translate-y-0.5 active:translate-y-1 transition-all uppercase tracking-wider cursor-pointer"
                            >
                              🎉 CLEAR ROUND {baseballRound} & START ROUND {baseballRound + 1}!
                            </button>
                          )}
                        </div>
                      ) : (
                        // Needs to exhale
                        <button
                          onClick={() => {
                            playSoundUiClick();
                            triggerAudioBeep(659, 'triangle', 0.1);
                            setTimeout(() => triggerAudioBeep(784, 'sine', 0.15), 50);
                            handleSpawnConfettiCloud();
                            setBaseballPlayers(prev => prev.map((bp, idx) => idx === baseballPossessionIdx ? { ...bp, status: 'SAFE' } : bp));
                            setBaseballLogStr(`${baseballPlayers[baseballPossessionIdx]?.name} exhaled!`);
                          }}
                          className="w-full bg-gradient-to-r from-[#00f3ff] to-[#39ff14] text-black font-sans text-sm font-bold p-4 border-4 border-black shadow-[4px_4px_0_#000] active:translate-y-1 transition-all uppercase tracking-widest text-center cursor-pointer"
                        >
                          💨 EXHALE
                        </button>
                      )}
                    </div>
                  ) : (
                    // INHALATION ACTIONS
                    <div>
                      {baseballActiveSessionState === 'RIP_SUCCESS' ? (
                        <button
                          onClick={() => {
                            playSoundUiClick();
                            const nextIdx = getNextBaseballSurvivorIdx(baseballPossessionIdx);
                            setBaseballPossessionIdx(nextIdx);
                            setBaseballTimer(0);
                            setBaseballActiveSessionState('IDLE');
                            
                            // Check if next is already holding. If yes, it's exhale time!
                            const survivors = baseballPlayers.filter(bp => !bp.isEliminated);
                            const allHoldingOrSafe = survivors.every(bp => bp.hasRippedThisRound || bp.id === baseballPlayers[nextIdx].id);
                            if (allHoldingOrSafe) {
                              setBaseballLogStr(`Circle pass completed! Return the cart back to ${baseballPlayers[nextIdx].name} for exhalation!`);
                            } else {
                              setBaseballLogStr(`Cartridge passed to ${baseballPlayers[nextIdx].name}. Take your 5s rip!`);
                            }
                          }}
                          className="w-full bg-[#39ff14] hover:bg-emerald-450 font-sans text-xs text-black font-bold p-4 border-4 border-black shadow-[4px_4px_0_#000] active:translate-y-0.5 uppercase cursor-pointer"
                        >
                          PASS CARTRIDGE TO {baseballPlayers[getNextBaseballSurvivorIdx(baseballPossessionIdx)]?.name} 👉
                        </button>
                      ) : (
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            onClick={() => {
                              if (baseballActiveSessionState === 'RIPPING') {
                                haltBaseballRip();
                              } else {
                                startBaseballRip();
                              }
                            }}
                            className={`font-mono text-xs p-3.5 border-4 border-black font-bold uppercase transition-all cursor-pointer ${
                              baseballActiveSessionState === 'RIPPING'
                                ? 'bg-red-600 text-white animate-pulse'
                                : 'bg-[#eab308] hover:bg-yellow-400 text-black shadow-[3px_3px_0_#000]'
                            }`}
                          >
                            {baseballActiveSessionState === 'RIPPING' 
                              ? 'TAP TO STOP 💨' 
                              : 'TAP TO RIP (5s) 💨'}
                          </button>

                          <button
                            onClick={concludeBaseballRipFail}
                            disabled={baseballActiveSessionState !== 'RIPPING'}
                            className={`font-mono text-xs p-3.5 border-4 border-black font-bold uppercase transition-all cursor-pointer ${
                              baseballActiveSessionState === 'RIPPING'
                                ? 'bg-red-950/80 hover:bg-red-800 text-red-200 animate-pulse'
                                : 'bg-zinc-950 text-slate-600 border-zinc-800'
                            }`}
                          >
                            TAP OUT / GASP
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </div>

            </div>

            {/* Quick Action Navigation Deck */}
            <div className="flex justify-between items-center bg-[#11061c] border-4 border-black p-4 neo-box shadow-none">
              <span className="font-mono text-[10px] text-zinc-500 uppercase">Passed cartridge must cycle fully around remaining players list!</span>
              <button
                onClick={triggerReset}
                className="font-mono text-[10px] p-2 bg-red-950/80 hover:bg-red-800 text-red-100 border-2 border-black font-bold uppercase cursor-pointer transition-colors"
              >
                Quit Game (Reset)
              </button>
            </div>

          </motion.div>
        )}

        {gamePhase === 'GAME_ON' && gameMode !== 'BASEBALL' && (
          <motion.div
            key="game-screen"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="w-full flex flex-col gap-6 text-slate-100"
          >
            
            <div className="flex justify-between items-center bg-[#110520] border-2 border-black px-4 py-2">
              <span className="font-mono text-xs text-[#ffd700] flex items-center gap-2 font-bold">
                <Sparkles size={12} className="text-[#39ff14] animate-pulse" /> Players
              </span>
              <span className="font-mono text-xs text-slate-400">
                Active player: #{activePlayerIdx + 1}
              </span>
            </div>

            {/* Squad cards */}
            <div className={`grid gap-4 w-full ${
              players.length === 1 ? 'grid-cols-1' :
              players.length === 2 ? 'grid-cols-1 sm:grid-cols-2' :
              'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
            }`}>
              <AnimatePresence mode="popLayout">
                {players.map((p, idx) => {
                  const isActive = idx === activePlayerIdx;
                  const isElim = p.isEliminated;
                  return (
                    <motion.div 
                      key={p.id}
                      layout
                      initial={{ opacity: 0, scale: 0.85, y: 25 }}
                      whileHover={isElim ? {} : { scale: isActive ? 1.03 : 1.02 }}
                      animate={isElim ? {
                        opacity: [1.0, 0.25, 0.95, 0.35, 0.45],
                        scaleX: [1.0, 1.15, 0.05, 0.97, 0.95],
                        scaleY: [1.0, 0.85, 0.02, 0.97, 0.95],
                        rotate: [0, 1.5, -4, -2.5, -2.5],
                        x: [0, -8, 6, -3, 0],
                        y: [0, 6, -4, 2, 0],
                        background: ["#11071e", "#3a1d6e", "#ffffff", "#0c041b", "#080210"],
                        borderColor: ["#39ff14", "#ef4444", "#ffffff", "#1e293b", "#4b5563"],
                        boxShadow: [
                          "8px 8px 0px #39ff14",
                          "0px 0px 25px rgba(239, 68, 68, 0.8)",
                          "0px 0px 40px rgba(255, 255, 255, 1)",
                          "0px 0px 0px rgba(0,0,0,0)",
                          "0px 0px 0px rgba(0,0,0,0)"
                        ],
                        transition: {
                          duration: 1.1,
                          times: [0, 0.15, 0.35, 0.6, 1.0],
                          ease: "easeInOut"
                        }
                      } : isActive ? {
                        opacity: 1.0,
                        scale: 1.01,
                        rotate: 0,
                        background: ["#11071e", "#1b0c30", "#11071e"],
                        borderColor: ["#39ff14", "#d946ef", "#39ff14"],
                        boxShadow: [
                          "8px 8px 0px #39ff14",
                          "8px 8px 16px rgba(217, 70, 239, 0.45)",
                          "8px 8px 0px #39ff14"
                        ],
                        transition: {
                          background: { repeat: Infinity, duration: 2.2, ease: "easeInOut" },
                          borderColor: { repeat: Infinity, duration: 2.2, ease: "easeInOut" },
                          boxShadow: { repeat: Infinity, duration: 2.2, ease: "easeInOut" },
                          scale: { duration: 0.3 }
                        }
                      } : {
                        opacity: 0.75,
                        scale: 1.0,
                        rotate: 0,
                        background: "#11071e",
                        borderColor: "#000000",
                        boxShadow: "0px 0px 0px rgba(0,0,0,0)",
                        transition: { duration: 0.3 }
                      }}
                      exit={{ 
                        opacity: 0, 
                        scale: 0.6, 
                        y: 70, 
                        rotate: 15, 
                        transition: { duration: 0.5, ease: "backIn" } 
                      }}
                      className={`glitch-hover relative border-4 p-4 flex flex-col justify-between transition-all duration-200 select-none ${
                        isElim
                          ? 'grayscale'
                          : isActive 
                            ? 'z-10' 
                            : 'hover:opacity-100'
                      }`}
                    >
                      {/* High-Contrast Interactive Hover Flash / Glow */}
                      {!isElim && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-tr from-[#00f3ff]/40 via-white to-[#ff007f]/40 pointer-events-none z-30 opacity-0"
                          whileHover={{
                            opacity: [0.95, 0],
                            transition: { duration: 0.4, ease: "easeOut" }
                          }}
                        />
                      )}

                      {/* Interactive CRT Collapse Beam shutoff lines */}
                      {isElim && (
                        <motion.div
                          initial={{ scaleY: 0, opacity: 0 }}
                          animate={{
                            scaleY: [0, 0.1, 1, 0.02, 0],
                            scaleX: [0, 1.15, 1, 0.02, 0],
                            opacity: [0, 1, 1, 0.9, 0],
                          }}
                          transition={{
                            duration: 0.9,
                            times: [0, 0.12, 0.28, 0.42, 0.6],
                            ease: "easeOut"
                          }}
                          className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[3.5px] bg-white shadow-[0_0_12px_rgba(255,255,255,1),0_0_24px_rgba(0,243,255,1),0_0_36px_rgba(255,0,127,1)] z-40 pointer-events-none"
                        />
                      )}
                      
                      {isElim && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [0, 0.9, 0.2, 0.75, 0] }}
                          transition={{
                            duration: 0.8,
                            times: [0, 0.15, 0.3, 0.5, 0.7]
                          }}
                          className="absolute inset-0 bg-white/20 mix-blend-color-dodge z-30 pointer-events-none"
                        />
                      )}

                      {isElim && (
                        <div className="absolute -top-3.5 left-4 bg-red-600/95 text-white font-mono text-[9px] px-2 py-0.5 border-2 border-black font-bold uppercase tracking-wider">
                          Eliminated
                        </div>
                      )}
                      {!isElim && isActive && (
                        <div className="absolute -top-3.5 left-4 bg-[#39ff14]/90 text-black font-mono text-[10px] px-2 py-0.5 border-2 border-black font-bold animate-pulse">
                          Active
                        </div>
                      )}
                      
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <AvatarBadge score={p.score} status={p.status} />
                          <div className="overflow-hidden">
                            <h4 className="font-mono text-xs text-white truncate max-w-[100px] tracking-tight">
                              {p.name}
                            </h4>
                            <span className="font-mono text-[10px] flex items-center gap-1 mt-0.5" style={{ color: getDeviceAccentColor(p.device) }}>
                              {getDeviceIcon(p.device, 12)}
                              <span>{getDeviceName(p.device)}</span>
                            </span>
                          </div>
                        </div>

                        <div className="pt-1">
                          <BatteryIcon level={p.batteryLevel ?? 1.0} />
                        </div>
                      </div>

                      <div className="my-4 py-2 border-t border-b border-[#222]/50 bg-black/30 px-2.5">
                        <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-1">
                          <span>Power</span>
                          <span>{p.device === 'cartridge' ? '3.7V' : p.device === 'boutiq' ? 'Dual-Core' : 'Direct'}</span>
                        </div>
                        {p.device === 'cartridge' ? (
                          <div className="w-full bg-[#180d28] border border-black h-4 p-0.5 relative">
                            <div 
                              className="h-full bg-oil transition-all duration-300"
                              style={{ width: `${p.oilLevel * 100}%` }}
                            />
                            <span className="absolute inset-0 flex justify-center items-center text-[9px] font-mono text-black font-bold">
                              Oil level: {Math.round(p.oilLevel * 100)}%
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1.5">
                            <div className="w-full bg-[#180d28] border border-black h-4 p-0.5 relative">
                              <div 
                                className={`h-full transition-all duration-300 ${p.batteryLevel < 0.1 ? 'bg-red-600 animate-pulse' : 'bg-[#00f3ff]'}`}
                                style={{ width: `${(p.batteryLevel ?? 1.0) * 100}%` }}
                              />
                              <span className={`absolute inset-0 flex justify-center items-center text-[9px] font-mono font-bold ${p.batteryLevel < 0.1 ? 'text-white animate-pulse' : 'text-black'}`}>
                                Battery: {Math.round((p.batteryLevel ?? 1.0) * 100)}%
                              </span>
                            </div>
                            
                            <div className="w-full bg-[#180d28] border border-black h-4 p-0.5 relative">
                              <div 
                                className="h-full bg-oil transition-all duration-300"
                                style={{ width: `${p.oilLevel * 100}%` }}
                              />
                              <span className="absolute inset-0 flex justify-center items-center text-[9px] font-mono text-black font-bold">
                                Oil: {Math.round(p.oilLevel * 100)}%
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Summary Panel */}
                      <div className="bg-[#12071f]/80 p-2.5 border border-[#39ff14]/30 rounded-xs mb-2">
                        <span className="block text-[9px] text-[#00f3ff] uppercase font-bold tracking-tight mb-1 border-b border-zinc-800 pb-1">
                          Summary Panel
                        </span>
                        <div className="space-y-1 font-mono text-[10px] text-slate-300">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Total Blinks:</span>
                            <span className="text-white font-bold">{p.totalBlinks}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Avg Duration:</span>
                            <span className="text-white font-bold">
                              {p.totalAttempts > 0 
                                ? `${(p.totalDuration / p.totalAttempts).toFixed(1)}s` 
                                : '0.0s'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Streak & Score Row */}
                      <div className="flex justify-between items-center bg-black/40 p-2 border border-black mb-2">
                        <span className="font-mono text-xs text-[#ffd700] flex items-center gap-1">
                          <Award size={10} /> Score
                        </span>
                        <span className="font-mono text-xs text-[#39ff14] font-bold">
                          {p.score} pts
                        </span>
                      </div>

                      {/* Quick Stats details row */}
                      <div className="bg-black/20 p-2 border border-black/50 text-[10px] space-y-1 mb-2 font-mono">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Streak:</span>
                          <span className="text-[#3aef14] font-bold">
                            {p.streak || 0}
                          </span>
                        </div>
                      </div>

                      <div className="text-center font-mono text-xs mt-1">
                        {isElim ? (
                          <span className="block bg-red-950/40 border border-red-900 text-red-500 py-1 uppercase font-bold">
                            Out
                          </span>
                        ) : p.status === 'INHALING' ? (
                          <span className="block bg-pink-900 border border-pink-500 text-pink-100 py-1 uppercase animate-pulse font-bold flex items-center justify-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping inline-block" />
                            HOLD ({inhaleTimer.toFixed(1)}s)
                          </span>
                        ) : p.status === 'SUCCESS' ? (
                          <span className="block bg-green-950 border border-green-500 text-green-300 py-1 uppercase font-bold">
                            Done
                          </span>
                        ) : p.status === 'TAPPED_OUT' ? (
                          <span className="block bg-red-950 border border-red-500 text-red-300 py-1 uppercase font-bold">
                            Stopped
                          </span>
                        ) : (
                          <span className="block bg-zinc-950 border border-zinc-800 text-zinc-500 py-1 uppercase font-bold">
                            Wait
                          </span>
                        )}
                      </div>

                      {/* Visual Progress Bar beneath active player card */}
                      {isActive && !isElim && (
                        <div className="mt-3 pt-2 border-t border-zinc-800/60">
                          <div className="flex justify-between items-center text-[9px] font-mono text-[#00f3ff] mb-1">
                            <span className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#39ff14] animate-ping" />
                              Progress
                            </span>
                            <span>
                              {p.status === 'SUCCESS' ? '100%' : `${Math.min(100, Math.round(progressRatio * 100))}%`}
                            </span>
                          </div>
                          <div className="w-full bg-[#1b0b2e] border border-black h-2.5 overflow-hidden relative rounded-xs">
                            <div 
                              className={`h-full transition-all duration-100 ease-out ${
                                p.status === 'TAPPED_OUT'
                                  ? 'bg-red-500'
                                  : 'bg-gradient-to-r from-[#ff007f] via-[#00f3ff] to-[#39ff14]'
                              }`}
                              style={{ 
                                width: `${
                                  p.status === 'SUCCESS' 
                                    ? 100 
                                    : p.status === 'TAPPED_OUT'
                                      ? (inhaleTimer / targetTime) * 100
                                      : Math.min(100, progressRatio * 100)
                                }%` 
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Interaction control board */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#11061c] border-4 border-black p-6 neo-box relative" ref={containerRef}>
              
              {/* Graphical Display */}
              <div className={`lg:col-span-4 flex flex-col justify-center items-center bg-[#07030e] border-2 border-black p-4 relative min-h-[220px] transition-transform ${getScreenRumbleStyle()}`}>
                {activePlayer.device === 'cartridge' && (
                  <CartridgeSVG 
                    oilLevel={activePlayer.oilLevel} 
                    isPulsing={activeSessionState === 'INHALING'} 
                    voltage={voltage}
                    batteryLevel={activePlayer.batteryLevel}
                    isCompleted={activeSessionState === 'SUCCESS'}
                    progress={progressRatio}
                  />
                )}
                {activePlayer.device === 'disposable' && (
                  <DisposableVapeSVG 
                    isPulsing={activeSessionState === 'INHALING'} 
                    oilLevel={activePlayer.oilLevel}
                    batteryLevel={activePlayer.batteryLevel}
                    voltage={voltage}
                    isCompleted={activeSessionState === 'SUCCESS'}
                    progress={progressRatio}
                  />
                )}
                {activePlayer.device === 'muhameds' && (
                  <MuhaMedsSVG 
                    isPulsing={activeSessionState === 'INHALING'} 
                    oilLevel={activePlayer.oilLevel}
                    batteryLevel={activePlayer.batteryLevel}
                    voltage={voltage}
                    isCompleted={activeSessionState === 'SUCCESS'}
                    progress={progressRatio}
                  />
                )}
                {activePlayer.device === 'boutiq' && (
                  <BoutiqSVG 
                    isPulsing={activeSessionState === 'INHALING'} 
                    oilLevel={activePlayer.oilLevel}
                    batteryLevel={activePlayer.batteryLevel}
                    voltage={voltage}
                    isCompleted={activeSessionState === 'SUCCESS'}
                    progress={progressRatio}
                    playerName={activePlayer.name}
                    selectedTank={selectedTank}
                    onToggleTank={handleToggleBoutiqTank}
                    onClickButton={handleBoutiqButtonPress}
                    customLeft={customLeftLabel}
                    customRight={customRightLabel}
                  />
                )}

                {/* Real-time Dynamic Smoke/Vapor Clouds - using pre-feathered native gradients */}
                {activeSessionState === 'INHALING' && (
                  <div className="absolute top-10 left-1/2 -translate-x-1/2 w-32 h-32 pointer-events-none z-20 flex justify-center" style={{ filter: `brightness(${voltage >= 4.0 ? 1.45 : voltage <= 2.4 ? 0.75 : 1.15})` }}>
                    {getSmokeParticles().map((p) => (
                      <div 
                        key={p.id}
                        className={`absolute rounded-full ${p.bg} animate-smoke-${p.dir}`}
                        style={{
                          animationDelay: p.delay,
                          width: p.size,
                          height: p.size,
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Persistent Faint Drifting White Trail Clouds - using pre-feathered native gradients */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-25">
                  {trailParticles.map((t) => (
                    <div
                      key={t.id}
                      className="absolute rounded-full p-0 m-0"
                      style={{
                        left: `calc(50% + ${t.x}px)`,
                        top: `${t.y}px`,
                        width: `${t.size * 2.2}px`,
                        height: `${t.size * 2.2}px`,
                        background: 'radial-gradient(circle, rgba(235, 235, 240, 0.45) 0%, rgba(235, 235, 240, 0.15) 50%, rgba(235, 235, 240, 0) 100%)',
                        opacity: t.opacity,
                        transform: 'translate(-50%, -50%)',
                      }}
                    />
                  ))}
                </div>

                <div className="mt-2 text-center w-full">
                  <span className="text-[10px] font-mono flex items-center justify-center gap-1.5 font-bold" style={{ color: getDeviceAccentColor(activePlayer.device) }}>
                    {getDeviceIcon(activePlayer.device, 12)}
                    <span>{getDeviceName(activePlayer.device)}</span>
                  </span>
                </div>
              </div>

              {/* Console Control Interface */}
              <div className="lg:col-span-8 flex flex-col justify-between gap-4">
                
                <div className="border-b border-zinc-800 pb-2">
                  <span className="font-mono text-[10px] text-slate-400 block mb-1">Active player</span>
                  <div className="flex justify-between items-center">
                    <h3 className="font-sans text-xl font-bold text-white uppercase tracking-tight font-sans">
                      {activePlayer.name}
                    </h3>
                    <div className="font-mono text-xs bg-[#ff007f] text-black px-2 py-0.5 border border-black font-bold">
                      Score: {activePlayer.score}
                    </div>
                  </div>
                </div>

                {/* Vintage Voltage Selector Dial */}
                <div className="bg-[#0b0413] p-3 border-2 border-black flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-mono text-xs text-[#00f3ff] block font-bold uppercase">Battery Voltage</span>
                    <span className="text-[9px] text-slate-400 font-mono block">Higher voltage = thick clouds, faster drain. Lower = smooth flavor.</span>
                  </div>
                  <div className="flex gap-2">
                    {[2.4, 3.2, 4.0].map((v) => (
                      <button
                        key={v}
                        id={`voltage-${v}`}
                        onClick={() => {
                          setVoltage(v);
                          triggerAudioBeep(220 + (v * 100), 'triangle', 0.06);
                        }}
                        className={`font-mono text-xs px-3 py-1.5 border-2 border-black font-bold transition-all flex items-center justify-center gap-1.5 ${
                          voltage === v
                            ? 'bg-[#00f3ff] text-black shadow-[2px_2px_0px_#000]'
                            : 'bg-[#180a24] text-slate-400 hover:text-white hover:bg-[#2c133f]'
                        }`}
                      >
                        <span>{v.toFixed(1)}V</span>
                        <span 
                          className={`w-2 h-2 rounded-full border border-black/50 ${
                            v === 2.4 ? 'bg-[#c084fc]' : v === 3.2 ? 'bg-[#34d399]' : 'bg-[#f87171]'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                    <div className="bg-[#0b0413] p-3 border-2 border-black">
                  <span className="font-mono text-xs text-[#00f3ff] block mb-2 font-bold uppercase">Select duration</span>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        setBlinkMode('TAKE_BLINKER');
                        playSoundModeSelect();
                      }}
                      disabled={activeSessionState === 'INHALING'}
                      className={`font-mono text-xs p-2.5 border-2 text-left flex flex-col gap-1 transition-all ${
                        blinkMode === 'TAKE_BLINKER'
                          ? 'border-[#39ff14] bg-[#39ff14]/10 text-[#39ff14]'
                          : 'border-zinc-800 text-slate-400'
                      }`}
                    >
                      <span className="font-bold text-white">8 seconds</span>
                      <span className="text-slate-400">1 point</span>
                    </button>
 
                    <button
                      onClick={() => {
                        setBlinkMode('DOUBLE_BLINKER');
                        playSoundModeSelect();
                      }}
                      disabled={activeSessionState === 'INHALING'}
                      className={`font-mono text-xs p-2.5 border-2 text-left flex flex-col gap-1 transition-all ${
                        blinkMode === 'DOUBLE_BLINKER'
                          ? 'border-[#ff007f] bg-[#ff007f]/10 text-[#ff007f]'
                          : 'border-zinc-800 text-slate-400'
                      }`}
                    >
                      <span className="font-bold text-white">10 seconds</span>
                      <span className="text-slate-400">2 points</span>
                    </button>
                  </div>
                </div>

                {activePlayer.device === 'boutiq' && (
                  <div className="bg-[#0b0413] p-3 border-2 border-[#ff007f]/40 flex flex-col gap-3">
                    <div>
                      <span className="font-mono text-xs text-[#ffd700] block mb-1 font-bold uppercase">Boutiq Hardware Label Config</span>
                      <span className="text-[9px] text-slate-400 font-mono block">Type custom text onto the physical LED display plaque of your Boutiq hardware.</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-mono text-[9px] text-zinc-400 block mb-1">Left Tank Label (Indica)</label>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            className="bg-[#07030e] border border-zinc-700 text-white font-mono text-xs px-2.5 py-1.5 w-full uppercase focus:outline-none focus:border-[#39ff14]/80"
                            placeholder="e.g. PINK DRAGON"
                            maxLength={14}
                            value={customLeftLabel}
                            onChange={(e) => {
                              setCustomLeftLabel(e.target.value);
                            }}
                          />
                          {customLeftLabel && (
                            <button 
                              className="text-zinc-500 hover:text-white px-1 font-mono text-xs"
                              onClick={() => setCustomLeftLabel('')}
                            >
                              ×
                            </button>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="font-mono text-[9px] text-zinc-400 block mb-1">Right Tank Label (Sativa)</label>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            className="bg-[#07030e] border border-zinc-700 text-white font-mono text-xs px-2.5 py-1.5 w-full uppercase focus:outline-none focus:border-[#ff007f]/80"
                            placeholder="e.g. GRAPE APE"
                            maxLength={14}
                            value={customRightLabel}
                            onChange={(e) => {
                              setCustomRightLabel(e.target.value);
                            }}
                          />
                          {customRightLabel && (
                            <button 
                              className="text-zinc-500 hover:text-white px-1 font-mono text-xs"
                              onClick={() => setCustomRightLabel('')}
                            >
                              ×
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
 
              </div>

                <div className="bg-[#07030e] border-2 border-black p-3 text-center my-1">
                  <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                    <span>Temperature: {Math.round(25 + progressRatio * 315)}°C</span>
                    <span>Timer</span>
                  </div>

                  <div className={`w-full bg-[#1b0b2e] border-2 border-black h-10 relative overflow-hidden transition-all duration-300 ${activeSessionState === 'INHALING' && progressRatio >= 0.75 ? 'animate-glow-pulse' : ''}`}>
                    <div 
                      className="h-full absolute left-0 top-0 transition-all duration-100 ease-out"
                      style={{ 
                        width: `${progressRatio * 100}%`,
                        background: activeSessionState === 'INHALING'
                          ? 'linear-gradient(90deg, #ff007f, #00f3ff, #39ff14, #ff007f)'
                          : 'linear-gradient(270deg, #444, #666)'
                      }}
                    />
                    
                    <span className="absolute inset-0 flex justify-center items-center text-xs font-mono text-white z-10 font-bold tracking-widest drop-shadow-[2px_2px_0px_#000]">
                      {inhaleTimer.toFixed(1)}s / {targetTime}.0s
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-black/50 border border-[#222] min-h-[50px] flex items-center gap-3">
                  <AlertTriangle className={activeSessionState === 'TAPPED_OUT' || activeSessionState === 'INHALING' ? 'text-red-500 animate-bounce' : 'text-[#ffd700]'} size={20} />
                  <p className="font-mono text-sm uppercase text-slate-300 leading-tight">
                    {funnyQuote}
                  </p>
                </div>

                {/* Tactile Activations Grid */}
                <div className="flex flex-col gap-3">
                  <button
                    id="inhale-toggle-btn"
                    onClick={() => {
                      if (activeSessionState === 'INHALING') {
                        haltInhalation();
                        setIsDirectToggled(false);
                      } else {
                        startInhalation();
                        setIsDirectToggled(true);
                      }
                    }}
                    disabled={activeSessionState === 'SUCCESS' || activeSessionState === 'TAPPED_OUT'}
                    className={`w-full text-center py-4 border-4 border-black text-black font-sans font-black text-sm uppercase tracking-widest transition-all duration-300 relative overflow-hidden select-none touch-none ${
                      activeSessionState === 'SUCCESS' || activeSessionState === 'TAPPED_OUT'
                        ? 'bg-zinc-800 text-zinc-500 border-zinc-950 cursor-not-allowed shadow-none'
                        : isDirectToggled
                          ? 'rainbow-smoke-bg text-white shadow-[0_0_20px_rgba(255,0,127,0.5)] border-[#ff007f] scale-[0.98]'
                          : 'bg-[#00f3ff] hover:bg-cyan-300 cursor-pointer shadow-[6px_6px_0px_#000000] hover:shadow-[3px_3px_0px_#000000] hover:translate-x-0.5 hover:translate-y-0.5 active:scale-95'
                    }`}
                  >
                    {isDirectToggled && (
                      <span className="absolute inset-0 bg-gradient-to-r from-[#ff007f]/20 via-[#00f3ff]/20 to-[#39ff14]/20 animate-pulse" />
                    )}
                    {isDirectToggled ? 'STOP BLINKER' : 'TAKE A BLINKER'}
                  </button>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      id="manual-tap-btn"
                      onClick={concludeFail}
                      disabled={activeSessionState !== 'INHALING'}
                      className={`font-mono text-xs p-3.5 border-4 border-black font-bold uppercase transition-all ${
                        activeSessionState === 'INHALING'
                          ? 'bg-red-600 text-white hover:bg-red-500 hover:shadow-[3px_3px_0_#000] cursor-pointer animate-pulse'
                          : 'bg-zinc-950 text-slate-600 border-zinc-800'
                      }`}
                    >
                      Tap out
                    </button>

                    <button
                      id="next-combatant-btn"
                      onClick={() => {
                        if (isGameOver) {
                          triggerAudioBeep(450, 'sine', 0.1);
                          setGamePhase('SUMMARY');
                          setShowCelebration(true);
                        } else {
                          proceedNextTurn();
                        }
                      }}
                      disabled={activeSessionState === 'IDLE' || activeSessionState === 'INHALING'}
                      className={`font-mono text-xs p-3.5 border-4 border-black font-bold uppercase transition-all ${
                        activeSessionState === 'IDLE' || activeSessionState === 'INHALING'
                          ? 'bg-zinc-900 border-zinc-800 text-slate-500 cursor-not-allowed'
                          : isGameOver
                            ? 'bg-[#ffd700] text-black hover:bg-amber-400 shadow-[4px_4px_0_#000] active:translate-y-0.5'
                            : 'bg-[#39ff14] text-black hover:bg-[#59ff3b] shadow-[4px_4px_0_#000] active:translate-y-0.5'
                      }`}
                    >
                      {isGameOver ? "Results" : "Next"}
                    </button>
                  </div>

                </div>

              </div>

            </div>

            {/* Quick Action Navigation Deck */}
            <div className="flex justify-between items-center flex-wrap gap-4 bg-[#11061c] border-4 border-black p-4 neo-box shadow-none">
              <span className="font-mono text-xs text-slate-400">Controls</span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    triggerAudioBeep(450, 'sine', 0.1);
                    setGamePhase('SUMMARY');
                    setShowCelebration(true);
                  }}
                  className="font-mono text-xs p-2.5 bg-[#ffd700] hover:bg-amber-400 text-black border-2 border-black font-bold hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                >
                  Results
                </button>
                <button
                  onClick={() => {
                    triggerAudioBeep(300, 'square', 0.1);
                    setGamePhase('LOBBY');
                  }}
                  className="font-mono text-xs p-2.5 bg-[#120a1f] hover:bg-slate-800 text-slate-300 border-2 border-black font-bold hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                >
                  Lobby
                </button>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* SUMMARY / LEADERBOARD VIEW */}
      <AnimatePresence mode="wait">
        {gamePhase === 'SUMMARY' && (
          <motion.div
            key="summary-screen"
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -30 }}
            transition={{ type: "spring", stiffness: 180, damping: 18 }}
            className="w-full max-w-xl mx-auto flex flex-col gap-6 text-center p-2 self-center"
          >
            
            <div className="bg-[#12061c] border-4 border-black p-6 neo-box-pink relative flex flex-col items-center">
              <h2 className="font-sans text-3xl font-extrabold text-[#ff007f] uppercase tracking-wide select-none">
                Results
              </h2>
              <div className="font-mono text-xs text-[#00f3ff] mt-2 border border-[#333] px-2 py-0.5 bg-black uppercase">
                Session finished
              </div>
            </div>

            <div className="bg-[#11051e] border-4 border-black p-5 neo-box">
              <h3 className="font-mono text-xs text-slate-400 mb-4 uppercase font-bold">
                Rankings
              </h3>
              
              <div className="flex flex-col gap-4">
                {[...players]
                  .sort((a, b) => b.score - a.score)
                  .map((p, idx) => {
                    const labelText = `${p.score} points`;
                    return (
                      <div 
                        key={p.id}
                        className="bg-black/50 border-2 border-black p-4 flex flex-col gap-2 animate-fade-in"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs text-[#ffd700] font-bold">
                              {idx === 0 ? (
                                <span className="flex items-center gap-1 text-[#c084fc]">
                                  <PixelCrownIcon size={14} /> 1st
                                </span>
                              ) : `#${idx + 1}`}
                            </span>
                            <AvatarBadge score={p.score} status="IDLE" />
                            <div className="text-left ml-1">
                              <p className="font-mono text-sm font-bold text-white uppercase">{p.name}</p>
                              <span className="font-mono text-xs text-[#39ff14]">
                                {p.score <= 2 ? 'Level 1' : p.score <= 5 ? 'Level 2' : p.score <= 9 ? 'Level 3' : 'Level 4'}
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="font-mono text-sm text-[#00f3ff] block pr-1 font-bold">
                              {labelText}
                            </span>
                          </div>
                        </div>

                        {/* Summary Player Card Statistics Expansion */}
                        {(() => {
                          const pb = getPersonalBest(p.name);
                          return (
                            <div className="flex flex-col gap-2">
                              <div className="grid grid-cols-2 gap-2 bg-[#170e24]/40 p-2.5 border border-black/40 text-[11px] text-slate-400 font-mono text-left">
                                <div>
                                  <span className="block text-[9px] text-slate-500 uppercase">Total Blinks</span>
                                  <span className="text-white font-bold">{p.totalBlinks}</span>
                                </div>
                                <div>
                                  <span className="block text-[9px] text-slate-500 uppercase">Avg Duration</span>
                                  <span className="text-white font-bold">
                                    {p.totalAttempts > 0 
                                      ? `${(p.totalDuration / p.totalAttempts).toFixed(1)}s` 
                                      : '0.0s'}
                                  </span>
                                </div>
                              </div>
                              {/* Personal Bests (Local Storage) */}
                              <div className="bg-black/40 border border-zinc-800 p-2 text-left text-[10px] font-mono">
                                <span className="block text-[8px] text-[#00f3ff] uppercase font-bold mb-1">Personal Best</span>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <span className="text-slate-500 block text-[8px] uppercase">Streak</span>
                                    <span className="text-[#39ff14] font-bold">{pb.maxStreak} blinks</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-500 block text-[8px] uppercase">Score</span>
                                    <span className="text-[#ffd700] font-bold">{pb.maxScore} points</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                      </div>
                    );
                  })}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <button
                  onClick={() => {
                    triggerAudioBeep(320, 'sine', 0.1);
                    setGamePhase('GAME_ON');
                  }}
                  className="font-mono text-xs p-3.5 text-black bg-[#00f3ff] hover:bg-cyan-300 font-bold border-2 border-black shadow-[3px_3px_0_#000] hover:translate-x-0.5 hover:translate-y-0.5 active:translate-y-1.5 active:translate-x-1.5 transition-all"
                >
                  Play
                </button>
                <button
                  onClick={triggerReset}
                  className="font-mono text-xs p-3.5 text-black bg-[#ff007f] hover:bg-pink-400 font-bold border-2 border-black shadow-[3px_3px_0_#000] hover:translate-x-0.5 hover:translate-y-0.5 active:translate-y-1.5 active:translate-x-1.5 transition-all"
                >
                  Reset
                </button>
              </div>

            </div>

          </motion.div>
        )}
      </AnimatePresence>

      </main>

      {/* Cyber Sidebar Guide Overlay Drawer */}
      <AnimatePresence>
        {isInfoOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsInfoOpen(false)}
              className="fixed inset-0 bg-black/80 z-40 backdrop-blur-xs cursor-pointer"
            />

            {/* Sidebar drawer panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0e0514] border-l-4 border-black z-50 shadow-[0_0_50px_rgba(0,0,0,0.85)] flex flex-col overflow-y-auto"
            >
              {/* Drawer Header */}
              <div className="bg-[#180a24] p-5 border-b-4 border-black flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Info className="text-[#00f3ff]" size={18} />
                  <h2 className="font-sans text-sm font-bold text-white uppercase tracking-tight">
                    Guide
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setIsInfoOpen(false);
                    triggerAudioBeep(320, 'sine', 0.05);
                  }}
                  className="p-1 px-2 border-2 border-black bg-red-950 text-red-200 hover:bg-red-500 hover:text-white transition-all font-mono text-xs font-bold flex items-center gap-1"
                >
                  <X size={12} /> Close
                </button>
              </div>

              {/* Drawer Content */}
              <div className="p-6 space-y-6 flex-grow font-mono text-xs">
                
                {/* Section: Blinker Modes */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-[#a855f7]/30 pb-1.5">
                    <Sparkles className="text-[#d946ef]" size={13} />
                    <h3 className="font-sans text-[11px] font-bold text-[#d946ef] uppercase tracking-wider">Modes</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="bg-black/40 p-3 border-2 border-black rounded-sm">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[#39ff14] font-bold uppercase">8 Seconds</span>
                        <span className="bg-[#39ff14]/15 text-[#39ff14] border border-[#39ff14]/30 text-[9px] px-1.5 font-bold">1 Point</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed text-[11px] font-sans">
                        Draw continuously and release at 8 seconds to secure your point.
                      </p>
                    </div>

                    <div className="bg-black/40 p-3 border-2 border-black rounded-sm">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[#00f3ff] font-bold uppercase">10 Seconds</span>
                        <span className="bg-[#00f3ff]/15 text-[#00f3ff] border border-[#00f3ff]/30 text-[9px] px-1.5 font-bold">2 Points</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed text-[11px] font-sans">
                        Draw continuously and release at 10 seconds. Higher oil and battery use.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section: Controls */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-[#a855f7]/30 pb-1.5">
                    <Sparkles className="text-[#00f3ff]" size={13} />
                    <h3 className="font-sans text-[11px] font-bold text-[#00f3ff] uppercase tracking-wider">Controls</h3>
                  </div>
                  <div className="bg-black/40 p-3.5 border-2 border-black rounded-sm">
                    <span className="text-[#39ff14] font-bold block mb-1 uppercase">Tap to Play</span>
                    <p className="text-slate-300 text-[11px] leading-relaxed font-sans">
                      Simply tap the <span className="text-[#00f3ff] font-bold">"TAKE A BLINKER"</span> button to initiate inhalation and start drawing. When the timer reaches your exact target time (8.0s or 10.0s), tap the button again to successfully stop and lock in your score.
                    </p>
                  </div>
                </div>

                {/* Section: Voltage adjustments explained */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-[#a855f7]/30 pb-1.5">
                    <Sparkles className="text-[#ffd700]" size={13} />
                    <h3 className="font-sans text-[11px] font-bold text-[#ffd700] uppercase tracking-wider">Voltage</h3>
                  </div>
                  <div className="bg-black/30 p-3 border border-zinc-900/80 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[#c084fc] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#c084fc] border border-black/40" />
                        <span>2.4V (Low)</span>
                      </span>
                      <span className="text-slate-500 font-bold">0.6x Drain Rate</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[#34d399] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#34d399] border border-black/40" />
                        <span>3.2V (Standard)</span>
                      </span>
                      <span className="text-slate-500 font-bold">1.0x Drain Rate</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[#f87171] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#f87171] border border-black/40" />
                        <span>4.0V (High)</span>
                      </span>
                      <span className="text-slate-500 font-bold">1.6x Drain Rate</span>
                    </div>
                  </div>
                </div>

                {/* Section: Multiplayer Rules */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-[#a855f7]/30 pb-1.5">
                    <Sparkles className="text-red-500" size={13} />
                    <h3 className="font-sans text-[11px] font-bold text-red-400 uppercase tracking-wider">Rules</h3>
                  </div>
                  <div className="text-slate-300 leading-relaxed text-[11px] bg-[#1a0a0f] p-3 border border-red-950 rounded-sm space-y-2 font-sans">
                    <p><strong>2 Players</strong>: If a player stops early, the game ends.</p>
                    <p><strong>3-4 Players</strong>: When a player stops early, they are eliminated. The last remaining player wins.</p>
                  </div>
                </div>

              </div>

              {/* Drawer Footer */}
              <div className="bg-[#12071a] p-4 border-t-4 border-black text-center">
                <span className="text-[10px] text-slate-400 block mb-1">Developer Links</span>
                <a 
                  href="https://instagram.com/blinkergamefhs" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="font-bold text-xs text-[#00f3ff] hover:underline"
                >
                  @blinkergamefhs
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modern Brutalist Footer */}
      <footer className="w-full bg-[#11061c] border-t-4 border-black p-3.5 z-10 text-center font-mono text-[10px] text-slate-500 uppercase flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>Blinker Board © {new Date().getFullYear()}</span>
        <div className="flex gap-2 items-center">
          <span>Links:</span>
          <a href="https://instagram.com/blinkergamefhs" target="_blank" rel="noopener noreferrer" className="hover:underline text-[#00f3ff] font-bold">
            @blinkergamefhs
          </a>
        </div>
      </footer>

    </div>
  );
}
