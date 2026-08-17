import React, { useState } from 'react';
import { Scale, Lock, LockOpen, CheckCircle2, AlertTriangle, RefreshCw, MoveHorizontal, Sliders } from 'lucide-react';

interface ImageCalibratorProps {
  isCalibrated: boolean;
  pixelsPerMm: number;
  onApplyCalibration: (targetMm: number, pxDistance?: number) => void;
  onResetCalibration?: () => void;
  onAutoAlignRuler?: () => void;
  onCloseModal?: () => void;
}

export default function ImageCalibrator({
  isCalibrated,
  pixelsPerMm,
  onApplyCalibration,
  onResetCalibration,
  onAutoAlignRuler,
  onCloseModal
}: ImageCalibratorProps) {
  const [targetMmInput, setTargetMmInput] = useState<number>(10);
  const [customPxDistance, setCustomPxDistance] = useState<number>(Math.round((pixelsPerMm || 2.5) * 10));
  const [point1, setPoint1] = useState<{ x: number; y: number }>({ x: 412, y: 15 });
  const [point2, setPoint2] = useState<{ x: number; y: number }>({ x: 412, y: 40 });

  const calculatedPxDistance = Math.hypot(point2.x - point1.x, point2.y - point1.y) || customPxDistance || 25;
  const currentPxPerMm = calculatedPxDistance / (targetMmInput || 10);

  const handleConfirm = () => {
    onApplyCalibration(targetMmInput, calculatedPxDistance);
    if (onCloseModal) onCloseModal();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-5 shadow-2xl max-w-lg w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border ${
            isCalibrated 
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
              : 'bg-amber-500/20 text-amber-400 border-amber-500/30 animate-pulse'
          }`}>
            <Scale size={20} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              Calibración de Escala de Imagen (ImageCalibrator)
              {isCalibrated ? (
                <span className="px-2 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full font-bold flex items-center gap-1">
                  <Lock size={10} /> Calibrado
                </span>
              ) : (
                <span className="px-2 py-0.5 text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full font-bold flex items-center gap-1">
                  <LockOpen size={10} /> Requerido
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">
              Establezca la escala real en milímetros (mm) para desbloquear el trazado cefalométrico.
            </p>
          </div>
        </div>
      </div>

      {/* Warning status box if uncalibrated */}
      {!isCalibrated && (
        <div className="bg-amber-950/80 border border-amber-500/40 rounded-xl p-3 flex items-start gap-2.5 text-amber-200 text-xs">
          <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <b>Acceso Bloqueado:</b> Las funciones de análisis y trazado cefalométrico están deshabilitadas hasta verificar la regla de referencia en la radiografía lateral.
          </p>
        </div>
      )}

      {/* Reference Ruler Controls */}
      <div className="space-y-3 bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-300 flex items-center gap-1.5">
            <MoveHorizontal size={14} className="text-cyan-400" />
            Distancia Real de Referencia
          </span>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="1"
              max="100"
              value={targetMmInput}
              onChange={(e) => setTargetMmInput(Math.max(1, parseFloat(e.target.value) || 10))}
              className="w-16 px-2.5 py-1 bg-slate-900 border border-slate-700 text-white font-mono text-center rounded-lg focus:outline-none focus:border-cyan-500 font-bold"
            />
            <span className="text-slate-400 font-bold">mm</span>
          </div>
        </div>

        {/* Visual Ruler Scale Bar Graphic */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2">
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
            <span>Punto 1 (x:{point1.x}, y:{point1.y})</span>
            <span className="font-bold text-amber-300">{Math.round(calculatedPxDistance)} px</span>
            <span>Punto 2 (x:{point2.x}, y:{point2.y})</span>
          </div>

          <div className="relative h-6 bg-slate-950 rounded-lg border border-slate-800 flex items-center px-4 overflow-hidden">
            <div className="w-full h-1 bg-amber-500 relative flex justify-between items-center">
              <div className="w-2 h-4 bg-amber-400 rounded-xs -mt-1.5" />
              <div className="h-2 w-px bg-amber-300" />
              <div className="h-3 w-px bg-amber-300" />
              <div className="h-2 w-px bg-amber-300" />
              <div className="w-2 h-4 bg-amber-400 rounded-xs -mt-1.5" />
            </div>
          </div>

          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-400">Escala Calculada:</span>
            <span className="font-mono font-bold text-emerald-400">
              1 mm = {currentPxPerMm.toFixed(2)} px ({ (1 / currentPxPerMm).toFixed(3) } mm/px)
            </span>
          </div>
        </div>

        {/* Preset forehead ruler button */}
        {onAutoAlignRuler && (
          <button
            type="button"
            onClick={onAutoAlignRuler}
            className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-cyan-300 font-bold rounded-xl transition-all border border-slate-700 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sliders size={14} />
            <span>Alinear Regla Automáticamente en Apoyafrente (10 mm)</span>
          </button>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-3 pt-1">
        {onResetCalibration && isCalibrated && (
          <button
            type="button"
            onClick={onResetCalibration}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-all border border-slate-700 text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw size={13} />
            <span>Reiniciar</span>
          </button>
        )}

        <div className="flex items-center gap-2 ml-auto">
          {onCloseModal && isCalibrated && (
            <button
              type="button"
              onClick={onCloseModal}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
            >
              Cerrar
            </button>
          )}

          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <CheckCircle2 size={16} />
            <span>Confirmar Calibración ({targetMmInput} mm)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
