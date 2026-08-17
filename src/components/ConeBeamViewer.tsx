/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { CBCT_PRESETS } from '../data';
import { 
  Box, 
  Settings, 
  Maximize, 
  Sliders, 
  HelpCircle, 
  Eye, 
  Dna,
  Zap,
  Activity,
  ChevronRight,
  Info
} from 'lucide-react';

interface ConeBeamProps {
  patientName: string;
  patientDni: string;
}

export default function ConeBeamViewer({ patientName, patientDni }: ConeBeamProps) {
  const [activeFov, setActiveFov] = useState<string>('FOV 13x15 Campo Bimaxilar');
  const [axialSlice, setAxialSlice] = useState<number>(140);
  const [coronalSlice, setCoronalSlice] = useState<number>(120);
  const [sagittalSlice, setSagittalSlice] = useState<number>(100);
  const [mprColorPreset, setMprColorPreset] = useState<'standard' | 'contrast' | '3D-copper' | 'soft-tissue'>('standard');
  const [isRotating3D, setIsRotating3D] = useState<boolean>(true);
  const [rotationAngle, setRotationAngle] = useState<number>(30);
  const [measurementMode, setMeasurementMode] = useState<boolean>(false);
  const [measurePoint, setMeasurePoint] = useState<{ x: number; y: number } | null>(null);

  const requestRef = useRef<number | null>(null);

  // Auto rotate 3D volume for realistic feeling
  useEffect(() => {
    let lastTime = Date.now();
    const animate = () => {
      if (isRotating3D) {
        const now = Date.now();
        const delta = (now - lastTime) / 1000;
        setRotationAngle((prev) => (prev + delta * 8) % 360);
      }
      lastTime = Date.now();
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isRotating3D]);

  const preset = CBCT_PRESETS[activeFov] || CBCT_PRESETS['FOV 13x15 Campo Bimaxilar'];

  // Helper color map depending on preset
  const getFilterStyles = () => {
    switch (mprColorPreset) {
      case 'contrast':
        return 'brightness(95%) contrast(140%) grayscale(100%)';
      case '3D-copper':
        return 'brightness(100%) contrast(120%) sepia(80%) hue-rotate(330deg) saturate(200%)';
      case 'soft-tissue':
        return 'brightness(110%) contrast(90%) hue-rotate(180deg) invert(100%)';
      default:
        return 'brightness(100%) contrast(100%) grayscale(100%)';
    }
  };

  return (
    <div className="flex flex-col xl:flex-row gap-5 h-full text-slate-800 font-sans" id="cbct-multiplanar-module">
      
      {/* 4-Quadrant CBCT Grid Layout */}
      <div className="flex-1 flex flex-col bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        
        {/* Top bar with active scan and info metadata */}
        <div className="px-4 py-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
              <Box size={18} />
            </span>
            <div>
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                Visor de Reconstrucción Tomográfica (CBCT 3D)
                <span className="px-2 py-0.5 text-xs bg-blue-50 text-blue-600 border border-blue-100 rounded-full font-mono font-bold">
                  {preset.fov}
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Paciente: <b className="text-slate-700">{patientName}</b> | DNI: {patientDni}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Tech Specs */}
            <div className="hidden sm:flex items-center gap-4 text-[11px] font-mono text-slate-400 border-r border-slate-200 pr-4">
              <span><b>Tensión:</b> 89 kVp</span>
              <span><b>Corriente:</b> 12 mA</span>
              <span><b>Vóxel:</b> 0.125 mm</span>
            </div>
            <span className="px-2.5 py-1 rounded bg-blue-50 border border-blue-100 text-xs font-mono text-blue-600 font-bold">
              MPR MODO ACTIVO
            </span>
          </div>
        </div>

        {/* The 2x2 Grid representing coronal, sagittal, axial and 3D views */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 bg-slate-200 gap-1.5 p-1.5">
          
          {/* Quadrant 1: CORONAL VIEW */}
          <div className="bg-slate-900 aspect-square md:aspect-auto flex flex-col border border-slate-950 rounded-xl overflow-hidden relative group">
            <div className="absolute top-2 left-2 z-10 bg-slate-950/80 border border-slate-850 px-2 py-1 rounded text-[10px] font-mono text-slate-300">
              ID: {patientDni} <br />
              <b>CORONAL [Y]</b> - Corte: {coronalSlice}mm
            </div>
            <div className="absolute top-2 right-2 z-10 bg-slate-950/80 border border-slate-850 px-2 py-1 rounded text-[10px] font-mono text-cyan-400 font-bold uppercase">
              Coronal
            </div>

            {/* Simulated Coronal Tomography Slice (Using custom high-fidelity SVG) */}
            <div className="flex-1 bg-black flex items-center justify-center p-3 relative overflow-hidden">
              <svg 
                viewBox="0 0 300 240" 
                className="w-full h-full max-h-[220px]"
                style={{ filter: getFilterStyles() }}
              >
                <rect width="300" height="240" fill="#040508" />
                <radialGradient id="coronal-glow" cx="50%" cy="40%" r="55%">
                  <stop offset="0%" stopColor="#2c303f" />
                  <stop offset="50%" stopColor="#12141a" />
                  <stop offset="100%" stopColor="#040508" />
                </radialGradient>
                <rect width="300" height="240" fill="url(#coronal-glow)" opacity="0.8" />

                {/* Maxillary and Mandibular arch cross section */}
                {/* Maxillary bone line */}
                <path d="M 50 80 Q 150 110, 250 80 L 250 50 Q 150 60, 50 50 Z" fill="#1b1e26" opacity="0.75" />
                {/* Sinus cavities */}
                <ellipse cx="90" cy="55" rx="25" ry="15" fill="#000000" opacity="0.9" />
                <ellipse cx="210" cy="55" rx="25" ry="15" fill="#000000" opacity="0.9" />

                {/* Mandible bone line */}
                <path d="M 60 160 Q 150 190, 240 160 L 240 210 Q 150 230, 60 210 Z" fill="#20242e" opacity="0.7" />
                {/* Teeth cuts appearing at this depth slice */}
                <g opacity="0.9">
                  {/* Upper teeth roots and crowns */}
                  {Array.from({ length: 10 }).map((_, i) => {
                    const x = 70 + i * 18 + Math.sin(coronalSlice / 10) * 1.5;
                    const h = 18 + Math.cos(i + coronalSlice / 20) * 4;
                    return (
                      <g key={i}>
                        <polygon points={`${x-6},90 ${x+6},90 ${x+4},${90+h} ${x-4},${90+h}`} fill="#4d5469" stroke="#727d9c" strokeWidth="0.8" />
                        <line x1={x} y1="90" x2={x} y2="90 - h/1.5" stroke="#040508" strokeWidth="1.2" />
                      </g>
                    );
                  })}

                  {/* Lower teeth roots and crowns */}
                  {Array.from({ length: 10 }).map((_, i) => {
                    const x = 72 + i * 17.5 + Math.cos(coronalSlice / 15) * 1.5;
                    const h = 16 + Math.sin(i + coronalSlice / 20) * 4;
                    return (
                      <g key={`l-${i}`}>
                        <polygon points={`${x-6},158 ${x+6},158 ${x+4},${158-h} ${x-4},${158-h}`} fill="#4d5469" stroke="#727d9c" strokeWidth="0.8" />
                        <line x1={x} y1="158" x2={x} y2="158 + h/1.5" stroke="#040508" strokeWidth="1.2" />
                      </g>
                    );
                  })}
                </g>

                {/* Sub-structures depending on slice */}
                {coronalSlice > 150 && (
                  <circle cx="150" cy="180" r="12" fill="#d1d5db" opacity="0.3" filter="blur(2px)" />
                )}
              </svg>

              {/* Axial Crosshair line (representing slice height) */}
              <line 
                x1="0" 
                y1={`${60 + (coronalSlice / 250) * 120}`} 
                x2="100%" 
                y2={`${60 + (coronalSlice / 250) * 120}`} 
                stroke="#ef4444" 
                strokeWidth="1.2" 
                strokeDasharray="3,3" 
                className="absolute w-full opacity-65" 
              />
              {/* Sagittal Crosshair line */}
              <line 
                x1={`${50 + (sagittalSlice / 200) * 200}`} 
                y1="0" 
                x2={`${50 + (sagittalSlice / 200) * 200}`} 
                y2="100%" 
                stroke="#eab308" 
                strokeWidth="1.2" 
                strokeDasharray="3,3" 
                className="absolute h-full opacity-65" 
              />
            </div>
            
            {/* Compass orientation markers */}
            <div className="absolute bottom-2 left-2 text-[9px] font-mono text-slate-500 uppercase">R</div>
            <div className="absolute bottom-2 right-2 text-[9px] font-mono text-slate-500 uppercase">L</div>
          </div>

          {/* Quadrant 2: SAGITTAL VIEW */}
          <div className="bg-slate-900 aspect-square md:aspect-auto flex flex-col border border-slate-950 rounded-xl overflow-hidden relative group">
            <div className="absolute top-2 left-2 z-10 bg-slate-950/80 border border-slate-850 px-2 py-1 rounded text-[10px] font-mono text-slate-300">
              ID: {patientDni} <br />
              <b>SAGITTAL [X]</b> - Corte: {sagittalSlice}mm
            </div>
            <div className="absolute top-2 right-2 z-10 bg-slate-950/80 border border-slate-850 px-2 py-1 rounded text-[10px] font-mono text-yellow-400 font-bold uppercase">
              Sagittal
            </div>

            {/* Simulated Sagittal Tomography Slice */}
            <div className="flex-1 bg-black flex items-center justify-center p-3 relative overflow-hidden">
              <svg 
                viewBox="0 0 300 240" 
                className="w-full h-full max-h-[220px]"
                style={{ filter: getFilterStyles() }}
              >
                <rect width="300" height="240" fill="#040508" />
                <radialGradient id="sagittal-glow" cx="40%" cy="50%" r="60%">
                  <stop offset="0%" stopColor="#2a2e3d" />
                  <stop offset="60%" stopColor="#0f1117" />
                  <stop offset="100%" stopColor="#040508" />
                </radialGradient>
                <rect width="300" height="240" fill="url(#sagittal-glow)" opacity="0.8" />

                {/* Profile of alveolar crest and single molar tooth in focus */}
                {/* Alveolar bone structure profile */}
                <path d="M 80 240 Q 110 120, 150 120 Q 190 120, 220 240 Z" fill="#20242f" opacity="0.7" />
                
                {/* Single central molar, root canals highly visible! */}
                <g transform="translate(115, 60)" opacity="0.95">
                  {/* Tooth Crown */}
                  <path d="M 10 70 C 5 70, 0 65, 0 55 C 0 30, 10 15, 35 15 C 60 15, 70 30, 70 55 C 70 65, 65 70, 60 70 Z" fill="#4d5366" stroke="#727d9c" strokeWidth="1.5" />
                  {/* Pulp Chamber */}
                  <path d="M 22 55 C 20 55, 18 50, 18 45 C 18 35, 25 30, 35 30 C 45 30, 52 35, 52 45 C 52 50, 50 55, 48 55 Z" fill="#040508" />
                  {/* Roots */}
                  <path d="M 5 70 C 5 70, 10 110, 22 150 C 24 155, 32 155, 32 150 C 35 120, 35 70, 35 70 Z" fill="#3a3f4e" stroke="#4d5366" strokeWidth="1.5" />
                  <path d="M 35 70 C 35 70, 42 110, 54 145 C 56 150, 64 150, 64 145 C 65 120, 65 70, 65 70 Z" fill="#3a3f4e" stroke="#4d5366" strokeWidth="1.5" />
                  
                  {/* Root canal lines (radiopaque filler or void) */}
                  <path d="M 27 55 Q 18 100, 25 145" stroke="#040508" strokeWidth="1.8" fill="none" />
                  <path d="M 43 55 Q 50 100, 58 140" stroke="#040508" strokeWidth="1.8" fill="none" />
                  
                  {/* Alveolar bone margin line around tooth */}
                  <path d="M -15 95 C 10 90, 20 100, 35 105 C 50 110, 65 95, 85 95" stroke="#64748b" strokeWidth="1" strokeDasharray="2,3" fill="none" />
                </g>

                {/* Small adjacent teeth contours (faded) */}
                <g opacity="0.3">
                  <path d="M 50 130 C 50 110, 60 100, 80 100 C 100 100, 110 110, 110 130 Z" fill="#1b1e26" />
                  <path d="M 190 130 C 190 110, 200 100, 220 100 C 240 100, 250 110, 250 130 Z" fill="#1b1e26" />
                </g>
              </svg>

              {/* Axial Slice line indicator */}
              <line 
                x1="0" 
                y1={`${40 + (axialSlice / 250) * 140}`} 
                x2="100%" 
                y2={`${40 + (axialSlice / 250) * 140}`} 
                stroke="#3b82f6" 
                strokeWidth="1.2" 
                strokeDasharray="3,3" 
                className="absolute w-full opacity-65" 
              />
              {/* Coronal Slice line indicator */}
              <line 
                x1={`${40 + (coronalSlice / 250) * 220}`} 
                y1="0" 
                x2={`${40 + (coronalSlice / 250) * 220}`} 
                y2="100%" 
                stroke="#10b981" 
                strokeWidth="1.2" 
                strokeDasharray="3,3" 
                className="absolute h-full opacity-65" 
              />
            </div>

            <div className="absolute bottom-2 left-2 text-[9px] font-mono text-slate-500 uppercase">A</div>
            <div className="absolute bottom-2 right-2 text-[9px] font-mono text-slate-500 uppercase">P</div>
          </div>

          {/* Quadrant 3: AXIAL VIEW */}
          <div className="bg-slate-900 aspect-square md:aspect-auto flex flex-col border border-slate-950 rounded-xl overflow-hidden relative group">
            <div className="absolute top-2 left-2 z-10 bg-slate-950/80 border border-slate-850 px-2 py-1 rounded text-[10px] font-mono text-slate-300">
              ID: {patientDni} <br />
              <b>AXIAL [Z]</b> - Corte: {axialSlice}mm
            </div>
            <div className="absolute top-2 right-2 z-10 bg-slate-950/80 border border-slate-850 px-2 py-1 rounded text-[10px] font-mono text-blue-400 font-bold uppercase">
              Axial
            </div>

            {/* Simulated Axial Tomography Slice */}
            <div className="flex-1 bg-black flex items-center justify-center p-3 relative overflow-hidden">
              <svg 
                viewBox="0 0 300 240" 
                className="w-full h-full max-h-[220px]"
                style={{ filter: getFilterStyles() }}
              >
                <rect width="300" height="240" fill="#040508" />
                <radialGradient id="axial-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#252938" />
                  <stop offset="70%" stopColor="#0d0e14" />
                  <stop offset="100%" stopColor="#040508" />
                </radialGradient>
                <rect width="300" height="240" fill="url(#axial-glow)" opacity="0.8" />

                {/* Mandibular horseshoe-shaped bone ring */}
                <path d="M 60 210 Q 70 80, 150 75 Q 230 80, 240 210" fill="none" stroke="#252a3a" strokeWidth="25" strokeLinecap="round" opacity="0.75" />
                <path d="M 60 210 Q 70 80, 150 75 Q 230 80, 240 210" fill="none" stroke="#363d54" strokeWidth="15" strokeLinecap="round" opacity="0.4" />

                {/* Small circles representing root canals cross sections appearing at this height */}
                <g opacity="0.9" fill="#ffffff" stroke="#727d9c" strokeWidth="0.8">
                  {Array.from({ length: 12 }).map((_, i) => {
                    const angle = Math.PI * (0.15 + (i * 0.7) / 11);
                    const cx = 150 - Math.cos(angle) * 88;
                    const cy = 160 - Math.sin(angle) * 82;
                    // Vary radius based on slider coordinate to simulate 3D scanning
                    const size = 3 + Math.sin(axialSlice / 10 + i) * 1.2;
                    return (
                      <g key={i}>
                        <circle cx={cx} cy={cy} r={size} />
                        <circle cx={cx} cy={cy} r={size * 0.4} fill="#040508" />
                      </g>
                    );
                  })}
                </g>

                {/* Spongy bone texture noise */}
                <g opacity="0.1" filter="blur(0.5px)">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <circle key={i} cx={100 + (i % 5) * 25 + Math.sin(i) * 5} cy={90 + Math.floor(i / 5) * 20} r={1.5} fill="#ffffff" />
                  ))}
                </g>
              </svg>

              {/* Coronal Slice line indicator */}
              <line 
                x1="0" 
                y1={`${50 + (coronalSlice / 250) * 140}`} 
                x2="100%" 
                y2={`${50 + (coronalSlice / 250) * 140}`} 
                stroke="#10b981" 
                strokeWidth="1.2" 
                strokeDasharray="3,3" 
                className="absolute w-full opacity-65" 
              />
              {/* Sagittal Slice line indicator */}
              <line 
                x1={`${50 + (sagittalSlice / 200) * 200}`} 
                y1="0" 
                x2={`${50 + (sagittalSlice / 200) * 200}`} 
                y2="100%" 
                stroke="#eab308" 
                strokeWidth="1.2" 
                strokeDasharray="3,3" 
                className="absolute h-full opacity-65" 
              />
            </div>

            <div className="absolute bottom-2 left-2 text-[9px] font-mono text-slate-500 uppercase">R</div>
            <div className="absolute bottom-2 right-2 text-[9px] font-mono text-slate-500 uppercase">L</div>
          </div>

          {/* Quadrant 4: 3D VOLUME VIEW */}
          <div className="bg-slate-900 aspect-square md:aspect-auto flex flex-col border border-slate-950 rounded-xl overflow-hidden relative group">
            <div className="absolute top-2 left-2 z-10 bg-slate-950/80 border border-slate-850 px-2 py-1 rounded text-[10px] font-mono text-slate-300">
              Rotación 3D: <b className="text-cyan-400">{Math.round(rotationAngle)}°</b>
            </div>
            <div className="absolute top-2 right-2 z-10 bg-slate-950/80 border border-slate-850 px-2 py-1 rounded text-[10px] font-mono text-emerald-400 font-bold uppercase">
              3D Volume
            </div>

            {/* Simulated 3D Volume Rendering */}
            <div className="flex-1 bg-black flex items-center justify-center p-3 relative overflow-hidden">
              <svg 
                viewBox="0 0 300 240" 
                className="w-full h-full max-h-[220px]"
              >
                <rect width="300" height="240" fill="#020305" />
                <radialGradient id="vol-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#1e3a47" />
                  <stop offset="70%" stopColor="#0a1217" />
                  <stop offset="100%" stopColor="#020305" />
                </radialGradient>
                <rect width="300" height="240" fill="url(#vol-glow)" opacity="0.6" />

                {/* 3D Mandible and Teeth structure revolving around Y axis */}
                <g 
                  transform={`translate(150, 130) rotate(${Math.sin((rotationAngle * Math.PI) / 180) * 15}, 0, 0)`}
                  opacity="0.85"
                >
                  {/* Rotating horseshoe with copper/bone color tone */}
                  <ellipse 
                    cx="0" 
                    cy="20" 
                    rx={`${80 + Math.cos((rotationAngle * Math.PI) / 180) * 10}`} 
                    ry="45" 
                    fill="none" 
                    stroke="url(#vol-bone-gradient)" 
                    strokeWidth="24" 
                    opacity="0.75" 
                  />

                  {/* 3D simulated teeth on arch */}
                  {Array.from({ length: 14 }).map((_, i) => {
                    const baseAngle = (i * 180) / 13 - 90;
                    const dynamicAngle = baseAngle + rotationAngle;
                    const x = Math.sin((dynamicAngle * Math.PI) / 180) * 75;
                    const z = Math.cos((dynamicAngle * Math.PI) / 180) * 45;
                    const isFront = z > 0;

                    return (
                      <g 
                        key={i} 
                        transform={`translate(${x}, ${z / 5 - 10})`} 
                        opacity={isFront ? 1 : 0.45}
                      >
                        <ellipse cx="0" cy="0" rx="4" ry={isFront ? '6' : '3'} fill="#f8fafc" stroke="#38bdf8" strokeWidth="0.5" />
                        <line x1="0" y1="0" x2="0" y2="15" stroke="#94a3b8" strokeWidth="1" />
                      </g>
                    );
                  })}
                </g>

                {/* Color gradients definition */}
                <defs>
                  <linearGradient id="vol-bone-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#d97706" />
                    <stop offset="50%" stopColor="#fef08a" />
                    <stop offset="100%" stopColor="#d97706" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Rotate pause overlay toggle */}
              <button 
                onClick={() => setIsRotating3D(!isRotating3D)}
                className="absolute bottom-3 right-3 bg-slate-950/80 hover:bg-slate-900 text-[10px] font-semibold border border-slate-850 px-2 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-all text-slate-350 shadow-sm"
              >
                <Zap size={11} className={isRotating3D ? 'text-cyan-400 animate-pulse' : 'text-slate-400'} />
                {isRotating3D ? 'Pausar Giro' : 'Girar 3D'}
              </button>
            </div>

            <div className="absolute bottom-2 left-2 text-[9px] font-mono text-slate-500 uppercase">3D Render</div>
          </div>

        </div>

        {/* Multi-slice manual browsing controller drawers */}
        <div className="px-4 py-4.5 bg-white border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4 rounded-b-2xl">
          
          {/* Axial Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="flex items-center gap-1.5 text-blue-600 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Axial (Z)
              </span>
              <span className="text-slate-500 font-medium">{axialSlice} / 250 mm</span>
            </div>
            <input 
              type="range" 
              min="10" 
              max="240" 
              value={axialSlice}
              onChange={(e) => setAxialSlice(Number(e.target.value))}
              className="w-full accent-blue-600 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer" 
            />
          </div>

          {/* Coronal Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Coronal (Y)
              </span>
              <span className="text-slate-500 font-medium">{coronalSlice} / 250 mm</span>
            </div>
            <input 
              type="range" 
              min="10" 
              max="240" 
              value={coronalSlice}
              onChange={(e) => setCoronalSlice(Number(e.target.value))}
              className="w-full accent-emerald-600 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer" 
            />
          </div>

          {/* Sagittal Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="flex items-center gap-1.5 text-amber-600 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Sagittal (X)
              </span>
              <span className="text-slate-500 font-medium">{sagittalSlice} / 200 mm</span>
            </div>
            <input 
              type="range" 
              min="10" 
              max="190" 
              value={sagittalSlice}
              onChange={(e) => setSagittalSlice(Number(e.target.value))}
              className="w-full accent-amber-600 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer" 
            />
          </div>

        </div>

      </div>

      {/* Right panel: FOV Selection & Clinical Specs */}
      <div className="w-full xl:w-80 flex flex-col gap-5">
        
        {/* FOV configuration presets */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <h4 className="text-slate-800 font-bold text-sm mb-3 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Settings size={16} className="text-blue-500" />
            Configuración de Adquisición
          </h4>

          <div className="space-y-2.5">
            {Object.keys(CBCT_PRESETS).map((key) => (
              <button
                key={key}
                onClick={() => setActiveFov(key)}
                className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer flex flex-col gap-1 ${
                  activeFov === key
                    ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm font-semibold'
                    : 'bg-slate-55 border-slate-200 hover:bg-slate-100 text-slate-600'
                }`}
              >
                <span className="font-bold">{CBCT_PRESETS[key].title}</span>
                <span className="text-[10px] text-slate-500 font-mono">Campo de visión: {CBCT_PRESETS[key].fov}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Selected FOV Case specifications */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex-1">
          <h4 className="text-slate-800 font-bold text-sm mb-3 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Activity size={16} className="text-blue-500" />
            Aplicaciones Diagnósticas
          </h4>

          <div className="space-y-3">
            <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
              {preset.desc}
            </p>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <ChevronRight size={13} className="text-blue-500" /> Hallazgos Clínicos ({preset.fov}):
              </span>
              <ul className="space-y-1.5 pl-1">
                {preset.slices.map((sliceText, index) => (
                  <li key={index} className="text-xs text-slate-600 flex items-start gap-1.5 bg-slate-55 p-2 rounded-xl border border-slate-200">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                    <span>{sliceText}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Window preset buttons */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-500">Ventana Hounsfield (HU):</span>
              <div className="grid grid-cols-2 gap-1.5 mt-2">
                {(['standard', 'contrast', '3D-copper', 'soft-tissue'] as const).map((presetKey) => (
                  <button
                    key={presetKey}
                    onClick={() => setMprColorPreset(presetKey)}
                    className={`py-1.5 px-2 rounded-lg border text-[10px] font-mono capitalize cursor-pointer transition-all ${
                      mprColorPreset === presetKey
                        ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                        : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {presetKey.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
