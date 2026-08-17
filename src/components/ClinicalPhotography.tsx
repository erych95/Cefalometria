/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Camera, Eye, EyeOff, Grid, Sliders, Image as ImageIcon, Upload, Info, Heart, Check, Plus } from 'lucide-react';

interface ClinicalPhotographyProps {
  patientName: string;
  patientId: string;
}

interface ClinicalPhoto {
  id: string;
  type: 'extraoral' | 'intraoral';
  label: string;
  description: string;
  svgPreset: string;
}

export default function ClinicalPhotography({ patientName, patientId }: ClinicalPhotographyProps) {
  const [activePhotoId, setActivePhotoId] = useState<string>('pho-extra-1');
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showGoldenRatio, setShowGoldenRatio] = useState<boolean>(false);
  const [showSmileCurve, setShowSmileCurve] = useState<boolean>(false);
  const [midlineDeviation, setMidlineDeviation] = useState<number>(0); // in mm
  const [annotationsList, setAnnotationsList] = useState<string[]>([
    'Ligero apiñamiento antero-inferior.',
    'Línea media dental superior coincidente con línea media facial.',
    'Línea media dental inferior desviada hacia la derecha 2mm.'
  ]);
  const [newAnnotationText, setNewAnnotationText] = useState<string>('');

  const clinicalPhotos: ClinicalPhoto[] = [
    {
      id: 'pho-extra-1',
      type: 'extraoral',
      label: 'Extraoral: Frente Reposo',
      description: 'Evaluación de simetría facial de tres tercios, línea interpupilar y comisura labial en posición de reposo.',
      svgPreset: 'extraoral-front'
    },
    {
      id: 'pho-extra-2',
      type: 'extraoral',
      label: 'Extraoral: Sonrisa Frente',
      description: 'Análisis estético de la sonrisa: corredor bucal, arco de la sonrisa coincidente con borde del labio inferior.',
      svgPreset: 'extraoral-smile'
    },
    {
      id: 'pho-extra-3',
      type: 'extraoral',
      label: 'Extraoral: Perfil Estricto',
      description: 'Análisis del perfil sagital (recto, cóncavo, convexo) mediante el ángulo nasolabial y plano estético de Ricketts.',
      svgPreset: 'extraoral-profile'
    },
    {
      id: 'pho-intra-1',
      type: 'intraoral',
      label: 'Intraoral: Oclusión Frente',
      description: 'Fotografía clínica del sector anterior en máxima intercuspidación. Evaluación de sobremordida vertical y horizontal.',
      svgPreset: 'intraoral-front'
    },
    {
      id: 'pho-intra-2',
      type: 'intraoral',
      label: 'Intraoral: Oclusal Superior',
      description: 'Vista de espejo del arco dental superior. Análisis de forma de arco (ovoide, triangular, cuadrado) y rotaciones dentales.',
      svgPreset: 'intraoral-upper'
    }
  ];

  const handleAddAnnotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAnnotationText.trim()) {
      setAnnotationsList([...annotationsList, newAnnotationText.trim()]);
      setNewAnnotationText('');
    }
  };

  const handleRemoveAnnotation = (index: number) => {
    setAnnotationsList(annotationsList.filter((_, idx) => idx !== index));
  };

  const activePhoto = clinicalPhotos.find(p => p.id === activePhotoId) || clinicalPhotos[0];

  const renderPhotoPreset = (preset: string) => {
    switch (preset) {
      case 'extraoral-front':
        return (
          <g transform="translate(150, 40)">
            {/* Outline of human face frontal */}
            <path d="M 50 40 C 0 40, -40 80, -40 180 C -40 260, 0 320, 50 320 C 100 320, 140 260, 140 180 C 140 80, 100 40, 50 40 Z" fill="none" stroke="#64748b" strokeWidth="2.5" opacity="0.4" />
            {/* Eyes */}
            <ellipse cx="20" cy="140" rx="18" ry="10" fill="none" stroke="#475569" strokeWidth="2" />
            <circle cx="20" cy="140" r="4" fill="#334155" />
            <ellipse cx="80" cy="140" rx="18" ry="10" fill="none" stroke="#475569" strokeWidth="2" />
            <circle cx="80" cy="140" r="4" fill="#334155" />
            {/* Nose contour */}
            <path d="M 50 140 L 45 210 L 55 210" fill="none" stroke="#475569" strokeWidth="2" />
            {/* Repose Mouth lips contour */}
            <path d="M 25 250 Q 50 245, 75 250" fill="none" stroke="#94a3b8" strokeWidth="3" />
            <path d="M 25 250 Q 50 258, 75 250" fill="none" stroke="#64748b" strokeWidth="2" />
          </g>
        );
      case 'extraoral-smile':
        return (
          <g transform="translate(150, 40)">
            <path d="M 50 40 C 0 40, -40 80, -40 180 C -40 260, 0 320, 50 320 C 100 320, 140 260, 140 180 C 140 80, 100 40, 50 40 Z" fill="none" stroke="#64748b" strokeWidth="2" opacity="0.3" />
            {/* Smiling lips wide contour */}
            <path d="M 15 245 Q 50 270, 85 245 C 80 230, 20 230, 15 245 Z" fill="#991b1b" opacity="0.8" stroke="#ef4444" strokeWidth="1.5" />
            {/* Inner smile containing beautiful teeth arches */}
            <g transform="translate(10, 222)">
              {/* Upper row of white teeth */}
              {Array.from({ length: 8 }).map((_, i) => (
                <rect key={i} x={18 + i * 5.5} y={20} width="5" height="7" rx="1" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.5" />
              ))}
            </g>
            {/* Eyes squinting in smile */}
            <path d="M 10 140 Q 20 133, 30 140" fill="none" stroke="#475569" strokeWidth="2" />
            <path d="M 70 140 Q 80 133, 90 140" fill="none" stroke="#475569" strokeWidth="2" />
          </g>
        );
      case 'extraoral-profile':
        return (
          <g transform="translate(140, 40)">
            {/* Silhouette of human profile */}
            <path d="M -10 40 C 50 40, 70 80, 60 110 C 55 120, 75 140, 80 160 C 85 180, 70 190, 75 200 C 80 210, 100 220, 100 240 L 90 248 C 85 248, 88 258, 80 260 C 70 262, 85 285, 75 295 C 65 305, 50 300, 30 320 C 10 330, -10 330, -10 330" fill="none" stroke="#64748b" strokeWidth="3" strokeLinecap="round" />
            <circle cx="25" cy="130" r="6" fill="none" stroke="#475569" strokeWidth="2" />
          </g>
        );
      case 'intraoral-front':
        return (
          <g transform="translate(80, 80)">
            {/* Retractor borders */}
            <path d="M 0 100 C 0 30, 120 10, 220 10 Q 300 10, 340 100 C 300 190, 220 190, 220 190" fill="none" stroke="#475569" strokeWidth="4" opacity="0.3" />
            {/* Beautiful central incisors and molar occlusions */}
            <g transform="translate(40, 30)">
              {/* Upper Arch */}
              {Array.from({ length: 12 }).map((_, i) => {
                const w = i === 5 || i === 6 ? 24 : 18;
                const h = i === 5 || i === 6 ? 28 : 22;
                return (
                  <rect key={`u-${i}`} x={i * 20} y={40 - h} width={w - 2} height={h} rx="2" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
                );
              })}
              {/* Lower Arch */}
              {Array.from({ length: 12 }).map((_, i) => {
                const w = 17;
                const h = 20;
                // Add dental midline displacement offset
                const offset = i >= 6 ? midlineDeviation * 2 : 0;
                return (
                  <rect key={`l-${i}`} x={i * 20 + 4 + offset} y={42} width={w - 2} height={h} rx="2" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" />
                );
              })}
              {/* Healthy Gums color block top and bottom */}
              <path d="M -10 10 H 260 V 20 H -10 Z" fill="#fda4af" opacity="0.6" />
              <path d="M -10 63 H 260 V 73 H -10 Z" fill="#fda4af" opacity="0.6" />
            </g>
          </g>
        );
      case 'intraoral-upper':
        return (
          <g transform="translate(100, 50)">
            {/* U-Shaped Dental Arch layout (Top-down view) */}
            <path d="M 50 260 C 40 100, 250 100, 250 260" fill="none" stroke="#fda4af" strokeWidth="35" opacity="0.4" strokeLinecap="round" />
            {Array.from({ length: 14 }).map((_, i) => {
              const angle = Math.PI * (0.08 + (i * 0.84) / 13);
              const x = 150 - Math.cos(angle) * 95;
              const y = 200 - Math.sin(angle) * 115;
              return (
                <ellipse key={i} cx={x} cy={y} rx="11" ry="8" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" />
              );
            })}
            <line x1="150" y1="50" x2="150" y2="280" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.5" />
          </g>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-full text-slate-800" id="clinical-photography-workspace">
      
      {/* Photo viewport board */}
      <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-sm relative flex flex-col">
        
        {/* Header toolbar */}
        <div className="px-4 py-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 bg-rose-50 text-rose-600 rounded-lg border border-rose-100">
              <Camera size={18} />
            </span>
            <div>
              <h3 className="font-bold text-sm text-slate-800">Fotografía Clínica de Diagnóstico</h3>
              <p className="text-xs text-slate-550 font-mono">Vista activa: <span className="text-rose-600 font-semibold">{activePhoto.label}</span></p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Alignment togglers */}
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                showGrid ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
              }`}
              title="Cuadrícula facial simétrica"
            >
              <Grid size={14} />
              Rejilla
            </button>
            <button
              onClick={() => setShowGoldenRatio(!showGoldenRatio)}
              className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                showGoldenRatio ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
              }`}
              title="Proporción Áurea estética"
            >
              <Sliders size={14} />
              Prop. Áurea
            </button>
          </div>
        </div>

        {/* Viewport Box */}
        <div className="flex-1 min-h-[400px] bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
          
          {/* Main Photo Canvas */}
          <div className="w-full max-w-[500px] aspect-[5/4] bg-slate-950 border border-slate-950 rounded-xl relative overflow-hidden shadow-inner flex items-center justify-center">
            
            {/* Simulated Clinical Photo using SVG */}
            <svg viewBox="0 0 500 400" className="w-full h-full">
              <rect width="500" height="400" fill="#0b0f19" />
              
              {/* Studio soft shadows */}
              <radialGradient id="studio-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#1e294b" />
                <stop offset="100%" stopColor="#0b0f19" />
              </radialGradient>
              <rect width="500" height="400" fill="url(#studio-glow)" opacity="0.9" />

              {/* Patient Photo content presets */}
              {renderPhotoPreset(activePhoto.svgPreset)}

              {/* OVERLAY 1: SIMMETRY FACIAL GRID */}
              {showGrid && (
                <g stroke="#22d3ee" strokeWidth="1" opacity="0.35" strokeDasharray="2,2">
                  {/* Vertical Facial Midline */}
                  <line x1="250" y1="0" x2="250" y2="400" strokeWidth="1.5" stroke="#f43f5e" />
                  {/* Interpupillary horizontal line */}
                  <line x1="0" y1="180" x2="500" y2="180" />
                  {/* Subnasal plane */}
                  <line x1="0" y1="240" x2="500" y2="240" />
                  {/* Oral fissure line */}
                  <line x1="0" y1="285" x2="500" y2="285" />
                  {/* Parallel verification rails */}
                  <line x1="100" y1="0" x2="100" y2="400" />
                  <line x1="400" y1="0" x2="400" y2="400" />
                </g>
              )}

              {/* OVERLAY 2: GOLDEN PROPORTIONS SHIELDS */}
              {showGoldenRatio && (
                <g stroke="#fbbf24" strokeWidth="1" opacity="0.45">
                  {/* Concentric Golden rectangles for central incisor aesthetics */}
                  <rect x="210" y="145" width="80" height="110" fill="none" strokeWidth="1.5" />
                  <rect x="235" y="170" width="30" height="60" fill="none" />
                  <circle cx="250" cy="200" r="50" fill="none" strokeDasharray="3,3" />
                  <text x="250" y="90" fill="#fbbf24" fontSize="10" fontFamily="sans-serif" textAnchor="middle">Φ 1.618 : 1</text>
                </g>
              )}
            </svg>

            {/* Simulated Watermark info */}
            <div className="absolute bottom-3 left-3 text-[10px] font-mono text-slate-400 bg-slate-950/80 px-2 py-1 rounded">
              STUDIO PHOTO | {patientName.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Quick parameters controller */}
        {activePhoto.svgPreset === 'intraoral-front' && (
          <div className="px-4 py-2.5 bg-white border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border-b rounded-b-2xl">
            <span className="font-semibold text-slate-700">Desviación Línea Media Inferior:</span>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setMidlineDeviation(prev => Math.max(-4, prev - 1))}
                className="w-6 h-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded cursor-pointer border border-slate-250 flex items-center justify-center transition-all"
              >
                -
              </button>
              <span className="font-mono text-rose-600 font-bold bg-rose-50 px-2.5 py-1 rounded border border-rose-100">
                {midlineDeviation === 0 ? 'COINCIDENTE' : `${midlineDeviation > 0 ? '+' : ''}${midlineDeviation} mm (Der)`}
              </span>
              <button 
                onClick={() => setMidlineDeviation(prev => Math.min(4, prev + 1))}
                className="w-6 h-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded cursor-pointer border border-slate-250 flex items-center justify-center transition-all"
              >
                +
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Right panel: Selector list and aesthetic annotations */}
      <div className="w-full xl:w-80 flex flex-col gap-5">
        
        {/* Photo type selection index */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <h4 className="text-slate-800 font-bold text-sm mb-3 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Camera size={16} className="text-rose-500" />
            Galería del Estudio
          </h4>

          <div className="space-y-2">
            {clinicalPhotos.map((photo) => (
              <button
                key={photo.id}
                onClick={() => setActivePhotoId(photo.id)}
                className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all cursor-pointer flex items-center gap-3 ${
                  activePhotoId === photo.id
                    ? 'bg-rose-50 border-rose-200 text-rose-700 shadow-sm font-semibold'
                    : 'bg-slate-55 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <ImageIcon size={16} className={activePhotoId === photo.id ? 'text-rose-500' : 'text-slate-400'} />
                <span>{photo.label}</span>
              </button>
            ))}
          </div>

          <p className="text-[11px] text-slate-500 mt-3 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            {activePhoto.description}
          </p>
        </div>

        {/* Aesthetic diagnostic logger checklist */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex-1 flex flex-col">
          <h4 className="text-slate-800 font-bold text-sm mb-3 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Check size={16} className="text-rose-500" />
            Hallazgos Estéticos Faciales
          </h4>

          {/* List layout */}
          <div className="flex-1 overflow-y-auto space-y-2 max-h-[220px]">
            {annotationsList.map((ann, idx) => (
              <div key={idx} className="flex items-start justify-between gap-2 bg-slate-55 p-2 rounded-xl border border-slate-200 text-xs text-slate-700">
                <span>{ann}</span>
                <button 
                  onClick={() => handleRemoveAnnotation(idx)}
                  className="text-slate-400 hover:text-red-500 text-[10px] px-1 font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Add form */}
          <form onSubmit={handleAddAnnotation} className="mt-3 pt-3 border-t border-slate-100 flex gap-2">
            <input
              type="text"
              placeholder="Nueva nota de sonrisa..."
              value={newAnnotationText}
              onChange={(e) => setNewAnnotationText(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-250 placeholder-slate-400 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-all"
            />
            <button
              type="submit"
              className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold cursor-pointer shrink-0 transition-all shadow-sm"
            >
              <Plus size={14} />
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}
