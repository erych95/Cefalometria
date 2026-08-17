import React, { useState } from 'react';
import { Compass, MapPin, Search, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Eye, Edit3, Sparkles, Check, X } from 'lucide-react';

export interface LandmarkGuideInfo {
  code: string;
  name: string;
  category: 'Esquelético Maxilar' | 'Esquelético Mandibular' | 'Base de Cráneo' | 'Dentoalveolar' | 'Tejidos Blandos';
  anatomicalGuide: string;
  tip: string;
  illustrationUrl?: string;
}

export const CEPHALOMETRIC_GUIDES: Record<string, LandmarkGuideInfo> = {
  S: {
    code: 'S',
    name: 'Silla Turca (S)',
    category: 'Base de Cráneo',
    anatomicalGuide: 'Centro geométrico de la fosa hipofisaria (silla turca) en el cuerpo del hueso esfenoides.',
    tip: 'Ubique la cavidad cóncava de la base del cráneo en la radiografía lateral y posicione el punto justo en el centro.'
  },
  N: {
    code: 'N',
    name: 'Nasion (N)',
    category: 'Base de Cráneo',
    anatomicalGuide: 'Punto más anterior de la sutura frontonasal en el plano sagital medio.',
    tip: 'Localice la intersección sutural entre el hueso frontal y los huesos propios de la nariz.'
  },
  A: {
    code: 'A',
    name: 'Punto A / Subspinale (A)',
    category: 'Esquelético Maxilar',
    anatomicalGuide: 'Punto más profundo en la concavidad del perfil anterior del maxilar superior.',
    tip: 'Se ubica en la concavidad alveolar entre la Espina Nasal Anterior (ENA) y la cresta del incisivo superior.'
  },
  B: {
    code: 'B',
    name: 'Punto B / Supramentale (B)',
    category: 'Esquelético Mandibular',
    anatomicalGuide: 'Punto más profundo en la concavidad del perfil anterior del hueso alveolar mandibular.',
    tip: 'Ubicado en la cintura alveolar entre el borde incisivo inferior y la eminencia mentoniana.'
  },
  D: {
    code: 'D',
    name: 'Punto D (D)',
    category: 'Esquelético Mandibular',
    anatomicalGuide: 'Centro geométrico de la sínfisis mentoniana mandibular.',
    tip: 'Ubique el contorno cortical de la barbilla en la sínfisis y determine su centro.'
  },
  Po: {
    code: 'Po',
    name: 'Porion (Po)',
    category: 'Base de Cráneo',
    anatomicalGuide: 'Punto más superior del meato auditivo externo óseo (o del orificio metálico del cefalostato).',
    tip: 'El margen anatómico superior del conducto auditivo externo.'
  },
  Or: {
    code: 'Or',
    name: 'Orbitale (Or)',
    category: 'Base de Cráneo',
    anatomicalGuide: 'Punto más inferior en el reborde infraorbitario óseo.',
    tip: 'Punto más declive de la fosa orbitaria en el perfil lateral.'
  },
  Go: {
    code: 'Go',
    name: 'Gonion (Go)',
    category: 'Esquelético Mandibular',
    anatomicalGuide: 'Punto más posteroinferior en el ángulo de la mandíbula.',
    tip: 'Bisectriz del ángulo formado por la tangente al borde posterior de la rama y al borde inferior del cuerpo mandibular.'
  },
  Me: {
    code: 'Me',
    name: 'Menton (Me)',
    category: 'Esquelético Mandibular',
    anatomicalGuide: 'Punto más inferior del contorno cortical de la sínfisis mentoniana.',
    tip: 'El punto de menor altura en la base de la barbilla.'
  },
  Gn: {
    code: 'Gn',
    name: 'Gnathion (Gn)',
    category: 'Esquelético Mandibular',
    anatomicalGuide: 'Punto más anteroinferior en el contorno del mentón.',
    tip: 'Punto medio entre Pogonion y Menton en la curvatura de la sínfisis.'
  },
  Pog: {
    code: 'Pog',
    name: 'Pogonion Óseo (Pog)',
    category: 'Esquelético Mandibular',
    anatomicalGuide: 'Punto más anterior del contorno de la sínfisis mentoniana.',
    tip: 'La máxima prominencia anterior de la barbilla ósea.'
  },
  ANS: {
    code: 'ANS',
    name: 'Espina Nasal Anterior (ANS)',
    category: 'Esquelético Maxilar',
    anatomicalGuide: 'Vértice óseo más anterior del proceso palatino del maxilar superior.',
    tip: 'Extremo anterior prominente del suelo de las fosas nasales.'
  },
  PNS: {
    code: 'PNS',
    name: 'Espina Nasal Posterior (PNS)',
    category: 'Esquelético Maxilar',
    anatomicalGuide: 'Extremo posterior óseo de la apófisis palatina.',
    tip: 'Punto posterior del paladar duro, en la intersección con la fosa pterigomaxilar.'
  },
  L: {
    code: 'L',
    name: 'Punto L (L)',
    category: 'Base de Cráneo',
    anatomicalGuide: 'Proyección perpendicular de Pogonion sobre la línea S-N.',
    tip: 'Utilizado en Steiner para medir la distancia efectiva S-L.'
  },
  E: {
    code: 'E',
    name: 'Punto E (E)',
    category: 'Base de Cráneo',
    anatomicalGuide: 'Proyección perpendicular de la pared posterior del cóndilo mandibular sobre S-N.',
    tip: 'Utilizado en Steiner para determinar la posición del cóndilo S-E.'
  },
  U1t: {
    code: 'U1t',
    name: '1 Sup Borde Incisal (U1t)',
    category: 'Dentoalveolar',
    anatomicalGuide: 'Extremo incisal del incisivo central superior más vestibularizado.',
    tip: 'Coloque el punto exactamente en el borde cortante incisal del diente.'
  },
  U1r: {
    code: 'U1r',
    name: '1 Sup Ápice Radicular (U1r)',
    category: 'Dentoalveolar',
    anatomicalGuide: 'Ápice radicular del incisivo central superior.',
    tip: 'En la punta del ápice radicular alojado en el hueso alveolar maxilar.'
  },
  L1t: {
    code: 'L1t',
    name: '1 Inf Borde Incisal (L1t)',
    category: 'Dentoalveolar',
    anatomicalGuide: 'Extremo incisal del incisivo central inferior.',
    tip: 'En la punta del borde incisal del incisivo inferior.'
  },
  L1r: {
    code: 'L1r',
    name: '1 Inf Ápice Radicular (L1r)',
    category: 'Dentoalveolar',
    anatomicalGuide: 'Ápice radicular del incisivo central inferior.',
    tip: 'En la punta del ápice radicular en el hueso mandibular.'
  },
  OcA: {
    code: 'OcA',
    name: 'Plano Oclusal Anterior (OcA)',
    category: 'Dentoalveolar',
    anatomicalGuide: 'Punto medio del entrecruzamiento oclusal anterior en incisivos/premolares.',
    tip: 'Punto de contacto anterior para trazar el plano oclusal.'
  },
  OcP: {
    code: 'OcP',
    name: 'Plano Oclusal Posterior (OcP)',
    category: 'Dentoalveolar',
    anatomicalGuide: 'Punto de intercuspidación molar entre primeros molares permanentes.',
    tip: 'Punto de contacto posterior del plano oclusal.'
  },
  Ns: {
    code: 'Ns',
    name: 'Nasal Blando (Ns)',
    category: 'Tejidos Blandos',
    anatomicalGuide: 'Punto más prominente de la punta de la nariz en perfil blando.',
    tip: 'Punta anterior de la nariz en el perfil suave.'
  },
  Ls: {
    code: 'Ls',
    name: 'Labio Superior (Ls)',
    category: 'Tejidos Blandos',
    anatomicalGuide: 'Punto más anterior del bermellón del labio superior.',
    tip: 'La prominencia máxima del labio superior.'
  },
  Li: {
    code: 'Li',
    name: 'Labio Inferior (Li)',
    category: 'Tejidos Blandos',
    anatomicalGuide: 'Punto más anterior del bermellón del labio inferior.',
    tip: 'La prominencia máxima del labio inferior.'
  },
  Pogs: {
    code: 'Pogs',
    name: 'Pogonion Blando (Pogs)',
    category: 'Tejidos Blandos',
    anatomicalGuide: 'Punto más anterior del perfil blando del mentón.',
    tip: 'Prominencia máxima del perfil de tejido blando en la barbilla.'
  }
};

interface GuideOverlayProps {
  activeLandmarkKey: string;
  landmarks: Record<string, { x: number; y: number }>;
  activeAnalysisModel: string;
  onSelectLandmarkKey: (key: string) => void;
  onUpdateCoordinates: (key: string, newX: number, newY: number) => void;
  onClose: () => void;
}

export default function GuideOverlay({
  activeLandmarkKey,
  landmarks,
  activeAnalysisModel,
  onSelectLandmarkKey,
  onUpdateCoordinates,
  onClose
}: GuideOverlayProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [stepPx, setStepPx] = useState<number>(1);
  const [overlayViewMode, setOverlayViewMode] = useState<'card' | 'table'>('card');

  const guide = CEPHALOMETRIC_GUIDES[activeLandmarkKey] || {
    code: activeLandmarkKey,
    name: `Punto ${activeLandmarkKey}`,
    category: 'Esquelético',
    anatomicalGuide: 'Ubicación anatómica en radiografía lateral de cráneo.',
    tip: 'Ajuste la posición directamente en la imagen.'
  };

  const currentCoords = landmarks[activeLandmarkKey] || { x: 0, y: 0 };

  const landmarkKeys = Object.keys(CEPHALOMETRIC_GUIDES);
  const filteredKeys = landmarkKeys.filter((k) =>
    k.toLowerCase().includes(searchQuery.toLowerCase()) ||
    CEPHALOMETRIC_GUIDES[k].name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNudge = (dx: number, dy: number) => {
    onUpdateCoordinates(
      activeLandmarkKey,
      Math.round(currentCoords.x + dx * stepPx),
      Math.round(currentCoords.y + dy * stepPx)
    );
  };

  return (
    <div className={`bg-slate-900/95 border-2 border-cyan-500/60 backdrop-blur-md rounded-2xl p-4 text-white shadow-2xl transition-all ${
      overlayViewMode === 'table' ? 'max-w-xl w-full' : 'max-w-sm w-full'
    } space-y-3`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-cyan-500/20 text-cyan-300 rounded-lg border border-cyan-500/40">
            <Compass size={16} />
          </div>
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
              <span>Guía Anatómica de Colocación</span>
            </h4>
            <p className="text-[10px] text-slate-400">
              Modelo Activo: <b className="text-white">{activeAnalysisModel}</b>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Toggle Card vs Table View */}
          <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 mr-1 text-[10px]">
            <button
              onClick={() => setOverlayViewMode('card')}
              className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                overlayViewMode === 'card' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              🎯 Ficha
            </button>
            <button
              onClick={() => setOverlayViewMode('table')}
              className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                overlayViewMode === 'table' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              📋 Tabla Guía
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* VIEW MODE A: SINGLE LANDMARK CARD */}
      {overlayViewMode === 'card' && (
        <>
          {/* Landmark Search & Select Dropdown */}
          <div className="space-y-1.5">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar punto cefalométrico..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950 text-white rounded-xl border border-slate-700 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <select
              value={activeLandmarkKey}
              onChange={(e) => onSelectLandmarkKey(e.target.value)}
              className="w-full bg-slate-950 text-cyan-300 font-bold text-xs px-3 py-2 rounded-xl border border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-400"
            >
              {filteredKeys.map((key) => (
                <option key={key} value={key}>
                  [{key}] - {CEPHALOMETRIC_GUIDES[key].name}
                </option>
              ))}
            </select>
          </div>

          {/* Anatomical Card Details */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div className="flex items-center gap-1.5">
                <MapPin size={14} className="text-amber-400" />
                <h5 className="font-bold text-xs text-amber-300">{guide.name}</h5>
              </div>
              <span className="text-[9px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-bold">
                {guide.category}
              </span>
            </div>

            <p className="text-[11px] text-slate-200 leading-relaxed">
              <b>Referencia Anatómica:</b> {guide.anatomicalGuide}
            </p>

            <p className="text-[10px] text-amber-200/90 italic bg-amber-950/40 border border-amber-500/20 p-2 rounded-xl">
              💡 <b>Tip de Referencia:</b> {guide.tip}
            </p>

            {/* Coords */}
            <div className="pt-1 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Coordenadas Actuales:</span>
              <span className="font-mono font-bold text-cyan-400">
                X: {Math.round(currentCoords.x)} px | Y: {Math.round(currentCoords.y)} px
              </span>
            </div>
          </div>

          {/* Manual Fine-Tune Adjustment Controls */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                <Edit3 size={12} className="text-cyan-400" />
                Ajuste Milimétrico (Nudge)
              </span>

              <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                {[1, 5, 10].map((step) => (
                  <button
                    key={step}
                    onClick={() => setStepPx(step)}
                    className={`px-1.5 py-0.5 text-[9px] font-bold rounded-md transition-all cursor-pointer ${
                      stepPx === step ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {step}px
                  </button>
                ))}
              </div>
            </div>

            {/* Directional Pad */}
            <div className="flex flex-col items-center gap-1 py-1">
              <button
                onClick={() => handleNudge(0, -1)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 active:bg-cyan-600 text-white rounded-lg transition-all cursor-pointer"
                title="Mover arriba"
              >
                <ArrowUp size={14} />
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleNudge(-1, 0)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 active:bg-cyan-600 text-white rounded-lg transition-all cursor-pointer"
                  title="Mover izquierda"
                >
                  <ArrowLeft size={14} />
                </button>

                <span className="text-[10px] text-slate-400 font-mono font-bold w-12 text-center">
                  Δ {stepPx}px
                </span>

                <button
                  onClick={() => handleNudge(1, 0)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 active:bg-cyan-600 text-white rounded-lg transition-all cursor-pointer"
                  title="Mover derecha"
                >
                  <ArrowRight size={14} />
                </button>
              </div>

              <button
                onClick={() => handleNudge(0, 1)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 active:bg-cyan-600 text-white rounded-lg transition-all cursor-pointer"
                title="Mover abajo"
              >
                <ArrowDown size={14} />
              </button>
            </div>

            {/* Direct X / Y Inputs */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[9px] text-slate-400 block mb-0.5">Posición X (px):</label>
                <input
                  type="number"
                  value={Math.round(currentCoords.x)}
                  onChange={(e) => onUpdateCoordinates(activeLandmarkKey, parseInt(e.target.value) || 0, currentCoords.y)}
                  className="w-full bg-slate-900 border border-slate-700 text-cyan-300 font-mono text-center rounded-lg py-1 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[9px] text-slate-400 block mb-0.5">Posición Y (px):</label>
                <input
                  type="number"
                  value={Math.round(currentCoords.y)}
                  onChange={(e) => onUpdateCoordinates(activeLandmarkKey, currentCoords.x, parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 text-cyan-300 font-mono text-center rounded-lg py-1 text-xs focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Previous / Next Landmark Navigation Footer */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => {
                const idx = landmarkKeys.indexOf(activeLandmarkKey);
                const prev = landmarkKeys[(idx - 1 + landmarkKeys.length) % landmarkKeys.length];
                onSelectLandmarkKey(prev);
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              ◄ Anterior
            </button>

            <button
              onClick={() => {
                const idx = landmarkKeys.indexOf(activeLandmarkKey);
                const next = landmarkKeys[(idx + 1) % landmarkKeys.length];
                onSelectLandmarkKey(next);
              }}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
            >
              Siguiente ►
            </button>
          </div>
        </>
      )}

      {/* VIEW MODE B: COMPACT LANDMARK GUIDE TABLE */}
      {overlayViewMode === 'table' && (
        <div className="space-y-2">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filtrar por nombre o código..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 text-white rounded-xl border border-slate-700 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="border border-slate-800 rounded-xl overflow-hidden max-h-[320px] overflow-y-auto">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead className="sticky top-0 bg-slate-950 text-cyan-300 uppercase text-[9px] font-bold border-b border-slate-800 z-10">
                <tr>
                  <th className="py-2 px-2.5">Punto</th>
                  <th className="py-2 px-2">Referencia Anatómica en Radiografía</th>
                  <th className="py-2 px-2 text-center">Coord (X,Y)</th>
                  <th className="py-2 px-2 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/80 text-slate-200">
                {filteredKeys.map((key) => {
                  const item = CEPHALOMETRIC_GUIDES[key];
                  const coords = landmarks[key] || { x: 0, y: 0 };
                  const isActive = activeLandmarkKey === key;

                  return (
                    <tr
                      key={key}
                      onClick={() => onSelectLandmarkKey(key)}
                      className={`hover:bg-slate-800/80 transition-colors cursor-pointer ${
                        isActive ? 'bg-cyan-950/60 text-cyan-200 border-l-2 border-cyan-400' : ''
                      }`}
                    >
                      <td className="py-2 px-2.5 font-mono font-bold whitespace-nowrap">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] ${
                          isActive ? 'bg-cyan-500 text-slate-950 font-black' : 'bg-slate-800 text-cyan-300 border border-slate-700'
                        }`}>
                          {key}
                        </span>
                      </td>
                      <td className="py-2 px-2">
                        <div className="font-bold text-white text-[10px]">{item.name}</div>
                        <div className="text-[9.5px] text-slate-300 leading-tight">{item.anatomicalGuide}</div>
                        <div className="text-[8.5px] text-amber-300/90 italic mt-0.5">💡 {item.tip}</div>
                      </td>
                      <td className="py-2 px-2 font-mono text-[10px] text-center text-cyan-300 whitespace-nowrap">
                        {Math.round(coords.x)}, {Math.round(coords.y)}
                      </td>
                      <td className="py-2 px-2 text-center whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectLandmarkKey(key);
                            setOverlayViewMode('card');
                          }}
                          className={`px-2 py-1 rounded text-[9px] font-bold transition-all cursor-pointer ${
                            isActive ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {isActive ? '🎯 Activo' : 'Ubicar'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
