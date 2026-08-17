/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import PatientFolder from './components/PatientFolder';
import { 
  Activity, 
  ShieldCheck, 
  Dna, 
  User, 
  Globe, 
  Clock, 
  FileText,
  Mail,
  Sun,
  Moon
} from 'lucide-react';

export default function App() {
  const [timeStr, setTimeStr] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true); // Default to Dark Photopea Studio Mode

  useEffect(() => {
    // Live update dynamic clinical clock
    const updateClock = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`h-screen max-h-screen overflow-hidden flex flex-col font-sans transition-colors duration-200 selection:bg-blue-600/20 selection:text-blue-400 ${
      isDarkMode ? 'bg-[#141414] text-slate-200' : 'bg-slate-100 text-slate-900'
    }`}>
      
      {/* GLOBAL CLINIC HEADER BAR */}
      <header className={`flex items-center justify-between px-3 shrink-0 h-11 z-40 shadow-md border-b transition-colors ${
        isDarkMode ? 'bg-[#1f1f1f] border-[#2b2b2b] text-white' : 'bg-slate-900 border-slate-800 text-white'
      }`}>
        
        {/* Brand & Clinic name */}
        <div className="flex items-center gap-2.5">
          <div className="p-1 bg-blue-600 text-white rounded-md flex items-center justify-center shadow-xs">
            <Dna size={16} />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-xs tracking-tight text-white flex items-center gap-1.5">
              DentoScan <span className="text-blue-400 font-extrabold">Pro</span>
              <span className="text-[8px] bg-blue-500/20 text-blue-400 border border-blue-500/30 font-mono px-1.5 py-0.2 rounded uppercase font-bold tracking-wider">
                Photopea Studio
              </span>
            </h1>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <p className="text-[9px] text-slate-400 font-mono uppercase tracking-wide hidden md:block">
              Estación Digital Unificada Cefalométrica y Diagnóstica
            </p>
          </div>
        </div>

        {/* Real-time Diagnostics telemetry & Theme Toggle */}
        <div className="flex items-center gap-2.5 text-xs">
          
          {/* DAY / NIGHT THEME TOGGLE BUTTON */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all border cursor-pointer shadow-xs ${
              isDarkMode 
                ? 'bg-[#2b2b2b] hover:bg-[#383838] text-amber-300 border-[#3d3d3d]' 
                : 'bg-slate-800 hover:bg-slate-700 text-amber-400 border-slate-700'
            }`}
            title={isDarkMode ? "Cambiar a Modo Día (Claro)" : "Cambiar a Modo Noche (Oscuro)"}
          >
            {isDarkMode ? (
              <>
                <Sun size={13} className="text-amber-400 animate-spin-slow" />
                <span>Modo Día</span>
              </>
            ) : (
              <>
                <Moon size={13} className="text-cyan-300" />
                <span>Modo Noche</span>
              </>
            )}
          </button>

          {/* Active Services pills */}
          <div className="hidden lg:flex items-center gap-2.5 border-l border-slate-800/80 pl-2.5">
            <div className="flex items-center gap-1 text-slate-400 text-[10px]">
              <ShieldCheck size={12} className="text-emerald-400" />
              <span>COP SSL</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400 text-[10px]">
              <Globe size={12} className="text-blue-400 animate-spin" style={{ animationDuration: '10s' }} />
              <span>PACS V3</span>
            </div>
          </div>

          {/* Clinician Profile badge */}
          <div className="flex items-center gap-1 bg-[#282828] border border-[#383838] px-2 py-0.5 rounded-md">
            <div className="w-3.5 h-3.5 rounded-full bg-blue-500 flex items-center justify-center text-slate-950 text-[8px] font-extrabold uppercase">
              ER
            </div>
            <p className="text-[10px] font-bold text-slate-200">Dr. Ortega</p>
          </div>

          {/* Dynamic Diagnostic Clinical clock */}
          <div className="font-mono text-cyan-400 text-[10px] bg-slate-950 border border-slate-800 px-2 py-0.5 rounded flex items-center gap-1">
            <Clock size={11} className="text-slate-500" />
            <span>{timeStr || '13:20:28'}</span>
          </div>

        </div>

      </header>

      {/* CORE CLINICAL DASHBOARD BODY */}
      <main className="flex-1 h-0 p-1.5 md:p-2 w-full max-w-full overflow-hidden flex flex-col">
        <PatientFolder isDarkMode={isDarkMode} onToggleTheme={() => setIsDarkMode(!isDarkMode)} />
      </main>

      {/* FOOTER METADATA BAR */}
      <footer className={`h-6 shrink-0 px-3 text-[9.5px] font-mono flex justify-between items-center transition-colors border-t ${
        isDarkMode ? 'bg-[#1c1c1c] border-[#2b2b2b] text-slate-400' : 'bg-white border-slate-200 text-slate-500'
      }`}>
        <div>
          <span>© 2026 DentoScan Pro. Estación Digital Estática Estilo Photopea.</span>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-[9.5px]">
          <span>Tema: <b className={isDarkMode ? 'text-blue-400' : 'text-blue-600'}>{isDarkMode ? 'Modo Noche' : 'Modo Día'}</b></span>
          <span>Vóxel: <b>0.125mm</b></span>
          <span>PACS: <b>Conectado</b></span>
        </div>
      </footer>

    </div>
  );
}
