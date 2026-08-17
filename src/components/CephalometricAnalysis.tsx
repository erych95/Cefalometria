/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { DentalStudy } from '../types';
import { 
  Compass, 
  Activity, 
  ChevronRight, 
  HelpCircle, 
  Undo, 
  Save, 
  MousePointer, 
  Sliders,
  Sparkles,
  Info,
  PenTool,
  Move
} from 'lucide-react';

interface CephalometricProps {
  study: DentalStudy;
  onSave: (studyId: string, updates: Partial<DentalStudy>) => void;
}

// Default positions of landmarks for our skull template box of 600x500
const DEFAULT_LANDMARKS: Record<string, { x: number; y: number; label: string }> = {
  S: { x: 280, y: 150, label: 'Silla (S)' },
  N: { x: 440, y: 120, label: 'Nasion (N)' },
  A: { x: 430, y: 240, label: 'Punto A (A)' },
  B: { x: 405, y: 310, label: 'Punto B (B)' },
  Po: { x: 190, y: 190, label: 'Porion (Po)' },
  Or: { x: 390, y: 180, label: 'Orbitale (Or)' },
  Go: { x: 210, y: 340, label: 'Gonion (Go)' },
  Me: { x: 380, y: 400, label: 'Menton (Me)' },
  Pog: { x: 408, y: 370, label: 'Pogonion (Pog)' },
  U1A: { x: 410, y: 260, label: 'Ápice Incisivo Sup (U1A)' },
  U1C: { x: 425, y: 310, label: 'Corona Incisivo Sup (U1C)' },
  L1A: { x: 395, y: 350, label: 'Ápice Incisivo Inf (L1A)' },
  L1C: { x: 415, y: 315, label: 'Corona Incisivo Inf (L1C)' }
};

interface MeasurementResult {
  code: string;
  name: string;
  norm: string;
  value: number;
  unit: string;
  interpretation: string;
}

interface BezierNode {
  id: string;
  x: number;
  y: number;
  h1x: number;
  h1y: number;
  h2x: number;
  h2y: number;
  symmetric: boolean;
}

export default function CephalometricAnalysis({ study, onSave }: CephalometricProps) {
  const [activeModel, setActiveModel] = useState<'Steiner' | 'McNamara' | 'USP' | 'UPCH'>('Steiner');
  const [landmarks, setLandmarks] = useState<Record<string, { x: number; y: number }>>(() => {
    return study.cephalometricPoints ?? {
      S: { ...DEFAULT_LANDMARKS.S },
      N: { ...DEFAULT_LANDMARKS.N },
      A: { ...DEFAULT_LANDMARKS.A },
      B: { ...DEFAULT_LANDMARKS.B },
      Po: { ...DEFAULT_LANDMARKS.Po },
      Or: { ...DEFAULT_LANDMARKS.Or },
      Go: { ...DEFAULT_LANDMARKS.Go },
      Me: { ...DEFAULT_LANDMARKS.Me },
      Pog: { ...DEFAULT_LANDMARKS.Pog },
      U1A: { ...DEFAULT_LANDMARKS.U1A },
      U1C: { ...DEFAULT_LANDMARKS.U1C },
      L1A: { ...DEFAULT_LANDMARKS.L1A },
      L1C: { ...DEFAULT_LANDMARKS.L1C }
    };
  });

  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const svgContainerRef = useRef<SVGSVGElement>(null);

  // Custom Profile Drawing State
  const [isDrawMode, setIsDrawMode] = useState(false);
  const [profileNodes, setProfileNodes] = useState<BezierNode[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedHandle, setSelectedHandle] = useState<'main' | 'h1' | 'h2' | null>(null);

  useEffect(() => {
    if (study.cephalometricPoints) {
      setLandmarks(study.cephalometricPoints);
    } else {
      setLandmarks({
        S: { ...DEFAULT_LANDMARKS.S },
        N: { ...DEFAULT_LANDMARKS.N },
        A: { ...DEFAULT_LANDMARKS.A },
        B: { ...DEFAULT_LANDMARKS.B },
        Po: { ...DEFAULT_LANDMARKS.Po },
        Or: { ...DEFAULT_LANDMARKS.Or },
        Go: { ...DEFAULT_LANDMARKS.Go },
        Me: { ...DEFAULT_LANDMARKS.Me },
        Pog: { ...DEFAULT_LANDMARKS.Pog },
        U1A: { ...DEFAULT_LANDMARKS.U1A },
        U1C: { ...DEFAULT_LANDMARKS.U1C },
        L1A: { ...DEFAULT_LANDMARKS.L1A },
        L1C: { ...DEFAULT_LANDMARKS.L1C }
      });
    }
  }, [study]);

  // Vector helpers
  const calculateAngle = (p1: { x: number; y: number }, vertex: { x: number; y: number }, p2: { x: number; y: number }): number => {
    const v1 = { x: p1.x - vertex.x, y: p1.y - vertex.y };
    const v2 = { x: p2.x - vertex.x, y: p2.y - vertex.y };
    const dotProduct = v1.x * v2.x + v1.y * v2.y;
    const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
    const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
    if (mag1 === 0 || mag2 === 0) return 0;
    const cosAngle = dotProduct / (mag1 * mag2);
    const angleRad = Math.acos(Math.max(-1, Math.min(1, cosAngle)));
    return Math.round((angleRad * 180) / Math.PI);
  };

  const calculateDistance = (p1: { x: number; y: number }, p2: { x: number; y: number }): number => {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.round((Math.sqrt(dx * dx + dy * dy) / 5) * 10) / 10;
  };

  const getMeasurements = (): MeasurementResult[] => {
    const { S, N, A, B, Go, Me, Pog, Or, Po } = landmarks;
    if (activeModel === 'Steiner') {
      const sna = calculateAngle(S, N, A);
      const snb = calculateAngle(S, N, B);
      const anb = sna - snb;
      const snd = landmarks.D ? calculateAngle(S, N, landmarks.D) : 76;

      const vSN = { x: N.x - S.x, y: N.y - S.y };
      const vGoMe = { x: Me.x - Go.x, y: Me.y - Go.y };
      const dot = vSN.x * vGoMe.x + vSN.y * vGoMe.y;
      const magSN = Math.sqrt(vSN.x * vSN.x + vSN.y * vSN.y);
      const magGoMe = Math.sqrt(vGoMe.x * vGoMe.x + vGoMe.y * vGoMe.y);
      const snGoMe = Math.round((Math.acos(Math.max(-1, Math.min(1, dot / (magSN * magGoMe)))) * 180) / Math.PI);

      return [
        { code: 'SNA', name: 'Ángulo SNA (Maxilar)', norm: '82°', value: sna, unit: '°', interpretation: sna > 84 ? 'Protrusión Maxilar' : sna < 80 ? 'Retrusión Maxilar' : 'Normoposición' },
        { code: 'SNB', name: 'Ángulo SNB (Mandíbula)', norm: '80°', value: snb, unit: '°', interpretation: snb > 82 ? 'Prognatismo Mandibular' : snb < 78 ? 'Retrognatismo Mandibular' : 'Normoposición' },
        { code: 'ANB', name: 'Diferencia ANB', norm: '2°', value: anb, unit: '°', interpretation: anb > 4 ? 'Clase II Esquelética' : anb < 0 ? 'Clase III Esquelética' : 'Clase I' },
        { code: 'SND', name: 'Ángulo SND', norm: '76°', value: snd, unit: '°', interpretation: snd > 78 ? 'Protrusión Sínfisis' : snd < 74 ? 'Retrusión Sínfisis' : 'Normoposición' },
        { code: 'SN-GoMe', name: 'Plano Mandibular (SN-GoMe)', norm: '32°', value: snGoMe, unit: '°', interpretation: snGoMe > 35 ? 'Hiperdivergente (Crec. Vertical)' : snGoMe < 29 ? 'Hipodivergente (Crec. Horizontal)' : 'Normodivergencia' }
      ];
    } else if (activeModel === 'McNamara') {
      const nPerpA = calculateDistance(N, A) - 34;
      const nPerpPog = calculateDistance(N, Pog) - 36;
      return [
        { code: 'N-Perp-A', name: 'Punto A a Perp. Nasion', norm: '0.0 mm', value: Math.round(nPerpA), unit: ' mm', interpretation: nPerpA > 2 ? 'Protrusión Maxilar' : nPerpA < -2 ? 'Retrusión Maxilar' : 'Normoposición' },
        { code: 'N-Perp-Pog', name: 'Pogonion a Perp. Nasion', norm: '-4.0 mm', value: Math.round(nPerpPog), unit: ' mm', interpretation: nPerpPog > 2 ? 'Prognatismo Mandibular' : nPerpPog < -6 ? 'Retrusión Mandibular' : 'Normoposición' }
      ];
    }
    return [];
  };

  const handleMeasurementChange = (code: string, newValue: number) => {
    if (isNaN(newValue)) return;
    setLandmarks(prev => {
      const updated = { ...prev };
      const setAngleBetween = (center: {x: number, y: number}, p1: {x: number, y: number}, pTarget: {x: number, y: number}, targetAngleDeg: number) => {
         const theta1 = Math.atan2(p1.y - center.y, p1.x - center.x);
         const thetaTarget = Math.atan2(pTarget.y - center.y, pTarget.x - center.x);
         let diff = thetaTarget - theta1;
         while(diff <= -Math.PI) diff += 2 * Math.PI;
         while(diff > Math.PI) diff -= 2 * Math.PI;
         const sign = Math.sign(diff) || 1;
         const targetRad = targetAngleDeg * Math.PI / 180;
         const newTheta = theta1 + sign * targetRad;
         const dist = Math.hypot(pTarget.x - center.x, pTarget.y - center.y);
         return { x: Math.round(center.x + dist * Math.cos(newTheta)), y: Math.round(center.y + dist * Math.sin(newTheta)) };
      };

      if (code === 'SNA') updated.A = setAngleBetween(updated.N, updated.S, updated.A, newValue);
      else if (code === 'SNB') updated.B = setAngleBetween(updated.N, updated.S, updated.B, newValue);
      else if (code === 'ANB') {
        const sna = calculateAngle(updated.S, updated.N, updated.A);
        const targetSNB = sna - newValue;
        updated.B = setAngleBetween(updated.N, updated.S, updated.B, targetSNB);
      }
      else if (code === 'SND') {
        if (!updated.D) updated.D = { x: 390, y: 320 };
        updated.D = setAngleBetween(updated.N, updated.S, updated.D, newValue);
      }
      else if (code === 'SN-GoMe') {
        const thetaSN = Math.atan2(updated.N.y - updated.S.y, updated.N.x - updated.S.x);
        const thetaGoMe = Math.atan2(updated.Me.y - updated.Go.y, updated.Me.x - updated.Go.x);
        let diff = thetaGoMe - thetaSN;
        while(diff <= -Math.PI) diff += 2 * Math.PI;
        while(diff > Math.PI) diff -= 2 * Math.PI;
        const sign = Math.sign(diff) || 1;
        const targetRad = newValue * Math.PI / 180;
        const newThetaGoMe = thetaSN + sign * targetRad;
        const dist = Math.hypot(updated.Me.x - updated.Go.x, updated.Me.y - updated.Go.y);
        updated.Me = { x: Math.round(updated.Go.x + dist * Math.cos(newThetaGoMe)), y: Math.round(updated.Go.y + dist * Math.sin(newThetaGoMe)) };
      }
      return updated;
    });
  };

  const handleSvgMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgContainerRef.current) return;
    const rect = svgContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 600;
    const y = ((e.clientY - rect.top) / rect.height) * 500;

    if (isDrawMode) {
      // Check handles first
      let clickedNode: string | null = null;
      let clickedHandle: 'main' | 'h1' | 'h2' | null = null;
      const tol = 10;
      
      if (selectedNodeId) {
        const node = profileNodes.find(n => n.id === selectedNodeId);
        if (node) {
          if (Math.hypot(node.h1x - x, node.h1y - y) < tol) {
            clickedNode = node.id; clickedHandle = 'h1';
          } else if (Math.hypot(node.h2x - x, node.h2y - y) < tol) {
            clickedNode = node.id; clickedHandle = 'h2';
          }
        }
      }
      
      if (!clickedNode) {
        profileNodes.forEach(node => {
          if (Math.hypot(node.x - x, node.y - y) < tol) {
            clickedNode = node.id; clickedHandle = 'main';
          }
        });
      }

      if (clickedNode) {
        setSelectedNodeId(clickedNode);
        setSelectedHandle(clickedHandle);
        setIsDragging(true);
      } else {
        // Add new node
        const newNode: BezierNode = {
          id: Date.now().toString(),
          x, y,
          h1x: x - 20, h1y: y - 20,
          h2x: x + 20, h2y: y + 20,
          symmetric: true
        };
        setProfileNodes([...profileNodes, newNode]);
        setSelectedNodeId(newNode.id);
        setSelectedHandle('main');
        setIsDragging(true);
      }
      return;
    }

    // Default landmark dragging
    let foundPoint: string | null = null;
    const clickTolerance = 15;
    (Object.entries(landmarks) as [string, { x: number; y: number }][]).forEach(([key, pt]) => {
      const dist = Math.hypot(pt.x - x, pt.y - y);
      if (dist < clickTolerance) foundPoint = key;
    });

    if (foundPoint) {
      setSelectedPoint(foundPoint);
      setIsDragging(true);
    }
  };

  const handleSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDragging || !svgContainerRef.current) return;
    const rect = svgContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 600;
    const y = ((e.clientY - rect.top) / rect.height) * 500;

    if (isDrawMode && selectedNodeId && selectedHandle) {
      setProfileNodes(prev => prev.map(node => {
        if (node.id === selectedNodeId) {
          if (selectedHandle === 'main') {
            const dx = x - node.x;
            const dy = y - node.y;
            return { ...node, x, y, h1x: node.h1x + dx, h1y: node.h1y + dy, h2x: node.h2x + dx, h2y: node.h2y + dy };
          } else if (selectedHandle === 'h1') {
            if (node.symmetric) {
              const dx = node.x - x;
              const dy = node.y - y;
              return { ...node, h1x: x, h1y: y, h2x: node.x + dx, h2y: node.y + dy };
            }
            return { ...node, h1x: x, h1y: y };
          } else if (selectedHandle === 'h2') {
            if (node.symmetric) {
              const dx = node.x - x;
              const dy = node.y - y;
              return { ...node, h2x: x, h2y: y, h1x: node.x + dx, h1y: node.y + dy };
            }
            return { ...node, h2x: x, h2y: y };
          }
        }
        return node;
      }));
      return;
    }

    if (selectedPoint) {
      setLandmarks(prev => ({
        ...prev,
        [selectedPoint]: { x: Math.round(Math.max(10, Math.min(590, x))), y: Math.round(Math.max(10, Math.min(490, y))) }
      }));
    }
  };

  const handleSvgMouseUp = () => setIsDragging(false);

  const toggleSymmetric = () => {
    if (selectedNodeId) {
      setProfileNodes(prev => prev.map(node => {
        if (node.id === selectedNodeId) {
          const sym = !node.symmetric;
          if (sym) {
            const dx = node.x - node.h1x;
            const dy = node.y - node.h1y;
            return { ...node, symmetric: sym, h2x: node.x + dx, h2y: node.y + dy };
          }
          return { ...node, symmetric: sym };
        }
        return node;
      }));
    }
  };

  const getBezierPath = () => {
    if (profileNodes.length === 0) return '';
    let d = `M ${profileNodes[0].x} ${profileNodes[0].y}`;
    for (let i = 1; i < profileNodes.length; i++) {
      const prev = profileNodes[i - 1];
      const curr = profileNodes[i];
      d += ` C ${prev.h2x} ${prev.h2y}, ${curr.h1x} ${curr.h1y}, ${curr.x} ${curr.y}`;
    }
    return d;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full text-slate-800" id="cephalometric-analysis-module">
      <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-sm relative flex flex-col">
        <div className="px-4 py-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
              <Compass size={18} />
            </span>
            <div>
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                Trazado Cefalométrico Interactivo
                <span className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded font-mono font-bold">
                  {activeModel}
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {isDrawMode ? "Modo Trazado Libre: Haz clic para añadir puntos. Arrastra manejadores." : "Modo Puntos: Haz clic y arrastra los puntos azules para ajustar."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { setIsDrawMode(!isDrawMode); setSelectedPoint(null); }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all border ${isDrawMode ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'}`}
              title="Herramienta de pluma para curvas"
            >
              {isDrawMode ? <Move size={14} /> : <PenTool size={14} />}
              {isDrawMode ? 'Volver a Puntos' : 'Dibujar Perfil'}
            </button>
            {isDrawMode && selectedNodeId && (
              <button
                onClick={toggleSymmetric}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200"
              >
                {profileNodes.find(n => n.id === selectedNodeId)?.symmetric ? 'Hacer Asimétrico' : 'Hacer Simétrico'}
              </button>
            )}
            <button
              onClick={() => {
                setLandmarks({
                  S: { ...DEFAULT_LANDMARKS.S }, N: { ...DEFAULT_LANDMARKS.N },
                  A: { ...DEFAULT_LANDMARKS.A }, B: { ...DEFAULT_LANDMARKS.B },
                  Po: { ...DEFAULT_LANDMARKS.Po }, Or: { ...DEFAULT_LANDMARKS.Or },
                  Go: { ...DEFAULT_LANDMARKS.Go }, Me: { ...DEFAULT_LANDMARKS.Me },
                  Pog: { ...DEFAULT_LANDMARKS.Pog }, U1A: { ...DEFAULT_LANDMARKS.U1A },
                  U1C: { ...DEFAULT_LANDMARKS.U1C }, L1A: { ...DEFAULT_LANDMARKS.L1A },
                  L1C: { ...DEFAULT_LANDMARKS.L1C }
                });
                setProfileNodes([]);
              }}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-750 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all border border-slate-250"
            >
              <Undo size={14} /> Reinicio
            </button>
            <button
              onClick={() => {
                onSave(study.id, { cephalometricPoints: landmarks });
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 3000);
              }}
              className="px-3 py-1.5 bg-blue-650 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm cursor-pointer transition-all"
            >
              <Save size={14} /> Guardar
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-[400px] bg-slate-900 flex items-center justify-center p-4">
          <div className="relative w-full max-w-[600px] aspect-[6/5] bg-slate-950 border border-slate-950 rounded-xl overflow-hidden shadow-inner">
            <svg
              ref={svgContainerRef}
              viewBox="0 0 600 500"
              className="w-full h-full select-none"
              onMouseDown={handleSvgMouseDown}
              onMouseMove={handleSvgMouseMove}
              onMouseUp={handleSvgMouseUp}
              onMouseLeave={handleSvgMouseUp}
            >
              {/* CEPHALOMETRIC LINES */}
              <line x1={landmarks.S.x} y1={landmarks.S.y} x2={landmarks.N.x} y2={landmarks.N.y} stroke="#3b82f6" strokeWidth="1.5" opacity="0.8" />
              <line x1={landmarks.N.x} y1={landmarks.N.y} x2={landmarks.A.x} y2={landmarks.A.y} stroke="#10b981" strokeWidth="1.5" opacity="0.8" />
              <line x1={landmarks.N.x} y1={landmarks.N.y} x2={landmarks.B.x} y2={landmarks.B.y} stroke="#f59e0b" strokeWidth="1.5" opacity="0.8" />
              <line x1={landmarks.Po.x} y1={landmarks.Po.y} x2={landmarks.Or.x} y2={landmarks.Or.y} stroke="#ec4899" strokeWidth="1.5" opacity="0.8" />
              <line x1={landmarks.Go.x} y1={landmarks.Go.y} x2={landmarks.Me.x} y2={landmarks.Me.y} stroke="#a855f7" strokeWidth="1.5" opacity="0.8" />
              
              {/* Steiner Incisors */}
              {landmarks.U1A && landmarks.U1C && (
                <line x1={landmarks.U1A.x} y1={landmarks.U1A.y} x2={landmarks.U1C.x} y2={landmarks.U1C.y} stroke="#ef4444" strokeWidth="1.5" opacity="0.9" />
              )}
              {landmarks.L1A && landmarks.L1C && (
                <line x1={landmarks.L1A.x} y1={landmarks.L1A.y} x2={landmarks.L1C.x} y2={landmarks.L1C.y} stroke="#eab308" strokeWidth="1.5" opacity="0.9" />
              )}

              {/* CUSTOM DRAWN BEZIER PROFILE */}
              {profileNodes.length > 0 && (
                <path d={getBezierPath()} fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              )}
              {isDrawMode && profileNodes.map(node => (
                <g key={node.id}>
                  {selectedNodeId === node.id && (
                    <>
                      <line x1={node.h1x} y1={node.h1y} x2={node.x} y2={node.y} stroke="#94a3b8" strokeDasharray="2,2" strokeWidth="1" />
                      <line x1={node.x} y1={node.y} x2={node.h2x} y2={node.h2y} stroke="#94a3b8" strokeDasharray="2,2" strokeWidth="1" />
                      <circle cx={node.h1x} cy={node.h1y} r="4" fill="#fbbf24" stroke="#fff" strokeWidth="1" className="cursor-pointer" />
                      <circle cx={node.h2x} cy={node.h2y} r="4" fill="#fbbf24" stroke="#fff" strokeWidth="1" className="cursor-pointer" />
                    </>
                  )}
                  <circle cx={node.x} cy={node.y} r={selectedNodeId === node.id ? "5" : "4"} fill={selectedNodeId === node.id ? "#f43f5e" : "#fff"} stroke="#f43f5e" strokeWidth="1.5" className="cursor-pointer" />
                </g>
              ))}

              {/* POINTS - Micro Crosshairs without text label or central circle for maximum visual precision */}
              {!isDrawMode && (Object.entries(landmarks) as [string, { x: number; y: number }][]).map(([key, pt]) => (
                <g key={key} className="cursor-pointer group">
                  <line x1={pt.x - 5} y1={pt.y} x2={pt.x + 5} y2={pt.y} stroke={selectedPoint === key ? '#22d3ee' : '#00ffff'} strokeWidth="1.2" />
                  <line x1={pt.x} y1={pt.y - 5} x2={pt.x} y2={pt.y + 5} stroke={selectedPoint === key ? '#22d3ee' : '#00ffff'} strokeWidth="1.2" />
                </g>
              ))}
            </svg>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-[460px] flex flex-col gap-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex-1 flex flex-col">
          <h4 className="text-slate-800 font-bold text-sm mb-3 flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="flex items-center gap-2">
              <Activity size={16} className="text-emerald-500" /> Tabla Comparativa Norma vs. Paciente
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Steiner / McNamara</span>
          </h4>
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[300px] lg:max-h-[500px]">
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-900 text-white text-[10px] uppercase font-bold tracking-wider">
                  <tr>
                    <th className="py-2.5 px-2.5">Medida</th>
                    <th className="py-2.5 px-2 text-center bg-blue-900/80">Norma</th>
                    <th className="py-2.5 px-2 text-center bg-emerald-900/80">Paciente</th>
                    <th className="py-2.5 px-2.5">Interpretación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-[11px] bg-white">
                  {getMeasurements().map((m) => (
                    <tr key={m.code} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2 px-2.5 font-bold text-slate-800">
                        <div className="flex flex-col">
                          <span>{m.name}</span>
                          <span className="font-mono text-[9px] text-slate-400 font-normal">{m.code}</span>
                        </div>
                      </td>
                      <td className="py-2 px-2 text-center font-mono font-bold text-blue-800 bg-blue-50/40">
                        {m.norm}
                      </td>
                      <td className="py-2 px-2 text-center bg-emerald-50/40">
                        <div className="flex items-center justify-center gap-0.5">
                          <input
                            type="number"
                            value={m.value}
                            onChange={(e) => handleMeasurementChange(m.code, parseFloat(e.target.value))}
                            className="w-14 bg-white border border-slate-300 rounded px-1 py-0.5 text-right font-mono text-xs font-bold text-emerald-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                          />
                          <span className="font-mono text-[10px] text-slate-500">{m.unit}</span>
                        </div>
                      </td>
                      <td className="py-2 px-2.5">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[10px] border border-slate-200">
                          {m.interpretation}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
