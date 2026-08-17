import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import {
  Sparkles,
  TrendingUp,
  Award,
  CheckCircle2,
  FileText,
  Printer,
  Download,
  Filter,
  ArrowRight,
  Info,
  Loader2,
  BarChart3 as BarChartIcon,
  X
} from 'lucide-react';
import Markdown from 'react-markdown';

export interface CephMeasurement {
  code: string;
  name: string;
  norm: string;
  val: number | string;
  unit: string;
  interpretation?: string;
  category?: 'Esquelético' | 'Dentoalveolar' | 'Tejidos Blandos' | string;
}

interface ResultadoComparativoProps {
  patientName: string;
  patientGender: 'F' | 'M';
  patientAgeFormatted: string;
  analysisModel: string;
  initialMeasurements: CephMeasurement[];
  finalMeasurements: CephMeasurement[];
  aiReportText?: string | null;
  isGeneratingAI?: boolean;
  onRunAIComparison?: () => void;
  onClose?: () => void;
}

export default function ResultadoComparativo({
  patientName,
  patientGender,
  patientAgeFormatted,
  analysisModel,
  initialMeasurements,
  finalMeasurements,
  aiReportText,
  isGeneratingAI,
  onRunAIComparison,
  onClose
}: ResultadoComparativoProps) {
  const [selectedCategory, setSelectedCategory] = useState<'Todos' | 'Esquelético' | 'Dentoalveolar' | 'Tejidos Blandos'>('Todos');

  // Map measurements to chart data format
  const chartData = initialMeasurements.map((mInit) => {
    const mFinal = finalMeasurements.find((f) => f.code === mInit.code) || mInit;
    const initVal = typeof mInit.val === 'number' ? mInit.val : parseFloat(mInit.val as string) || 0;
    const finalVal = typeof mFinal.val === 'number' ? mFinal.val : parseFloat(mFinal.val as string) || 0;
    const delta = parseFloat((finalVal - initVal).toFixed(1));

    // Parse norm number for visual comparison baseline
    const normNum = parseFloat(mInit.norm.replace(/[^0-9.-]/g, '')) || 0;

    return {
      code: mInit.code,
      name: mInit.name,
      Inicial: initVal,
      Final: finalVal,
      Norma: normNum,
      Delta: delta,
      unit: mInit.unit,
      category: mInit.category || (['SNA', 'SNB', 'ANB', 'GoGn-SN', 'SL', 'SE'].includes(mInit.code) ? 'Esquelético' : ['1-NA deg', '1-NA mm', '1-NB deg', '1-NB mm'].includes(mInit.code) ? 'Dentoalveolar' : 'Tejidos Blandos')
    };
  });

  const filteredData = chartData.filter((d) => selectedCategory === 'Todos' || d.category === selectedCategory);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden space-y-0 my-4 max-w-6xl w-full mx-auto">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-2xl text-white shadow-md">
            <Award size={22} className="text-amber-300" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              Resultado Comparativo Cefalométrico Evolutivo
              <span className="px-2.5 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 rounded-full font-mono uppercase font-bold">
                {analysisModel}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Evaluación Pre-Tratamiento (Inicial) vs Post-Tratamiento (Final)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onRunAIComparison && (
            <button
              onClick={onRunAIComparison}
              disabled={isGeneratingAI}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isGeneratingAI ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} className="text-amber-300 animate-pulse" />}
              <span>Generar Informe IA</span>
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-all border border-slate-700 flex items-center gap-1.5 cursor-pointer"
          >
            <Printer size={14} />
            <span>Imprimir</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6 text-slate-800">
        {/* Patient Demographics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 border border-slate-200 p-4 rounded-2xl">
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase">Paciente:</span>
            <span className="font-bold text-slate-900 text-xs">{patientName}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase">Género / Edad:</span>
            <span className="font-bold text-slate-900 text-xs">
              {patientGender === 'M' ? 'Masculino' : 'Femenino'} ({patientAgeFormatted})
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase">Análisis Ortodóntico:</span>
            <span className="font-bold text-indigo-600 text-xs">{analysisModel}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase">Etapa Comparada:</span>
            <span className="font-mono font-bold text-emerald-700 text-xs">Inicial vs Final ($\Delta$)</span>
          </div>
        </div>

        {/* COMPARATIVE RECHARTS BAR CHART */}
        <div className="space-y-3 bg-slate-50 border border-slate-200 p-5 rounded-3xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide flex items-center gap-2">
                <BarChartIcon size={16} className="text-blue-600" />
                Gráfico Comparativo de Barras (Valores Iniciales vs Finales)
              </h4>
              <p className="text-[11px] text-slate-500">
                Visualización gráfica de la evolución angular y lineal de Steiner.
              </p>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
              {(['Todos', 'Esquelético', 'Dentoalveolar', 'Tejidos Blandos'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={filteredData}
                margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="code"
                  tick={{ fontSize: 11, fontWeight: 'bold', fill: '#475569' }}
                  interval={0}
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 font-sans border border-slate-700">
                          <p className="font-bold text-amber-300">{item.name} ({item.code})</p>
                          <p className="text-blue-300">Inicial: <b>{item.Inicial}{item.unit}</b></p>
                          <p className="text-emerald-300">Final: <b>{item.Final}{item.unit}</b></p>
                          <p className="text-slate-400">Norma: {item.Norma}{item.unit}</p>
                          <p className="text-amber-400 font-mono font-bold pt-1 border-t border-slate-800">
                            Variación ($\Delta$): {item.Delta > 0 ? `+${item.Delta}` : item.Delta}{item.unit}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                <Bar dataKey="Inicial" name="Pre-Tratamiento (Inicial)" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Final" name="Post-Tratamiento (Final)" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* DETAILED PARAMETER DIFFERENCES ($\Delta$) TABLE */}
        <div className="space-y-3">
          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide flex items-center justify-between">
            <span>2. Tabla de Variaciones Cefalométricas ($\Delta$)</span>
            <span className="text-[10px] text-slate-500 font-normal">
              Δ = Final - Inicial
            </span>
          </h4>

          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-[10px] font-bold text-slate-600 uppercase">
                  <th className="py-2.5 px-3">Parámetro Cefalométrico</th>
                  <th className="py-2.5 px-3 text-center">Norma Clínica</th>
                  <th className="py-2.5 px-3 text-center bg-blue-50 text-blue-900">Inicial (Pre)</th>
                  <th className="py-2.5 px-3 text-center bg-emerald-50 text-emerald-900">Final (Post)</th>
                  <th className="py-2.5 px-3 text-center bg-amber-50 text-amber-900">Variación ($\Delta$)</th>
                  <th className="py-2.5 px-3">Interpretación Evolutiva</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                {filteredData.map((item) => (
                  <tr key={item.code} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-sans font-bold text-slate-900">
                      {item.name} <span className="text-slate-400 font-mono">({item.code})</span>
                    </td>
                    <td className="py-2.5 px-3 text-center text-slate-500">{item.Norma}{item.unit}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-blue-700 bg-blue-50/40">
                      {item.Inicial}{item.unit}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-emerald-700 bg-emerald-50/40">
                      {item.Final}{item.unit}
                    </td>
                    <td className={`py-2.5 px-3 text-center font-bold bg-amber-50/40 ${
                      Math.abs(item.Delta) < 0.1 ? 'text-slate-500' : item.Delta > 0 ? 'text-emerald-600' : 'text-blue-600'
                    }`}>
                      {item.Delta > 0 ? `+${item.Delta}` : item.Delta}{item.unit}
                    </td>
                    <td className="py-2.5 px-3 font-sans text-[10px]">
                      {Math.abs(item.Delta) < 0.5 ? (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">Estable / Mantenido</span>
                      ) : item.Delta > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">Aumento / Protrusión (+)</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">Reducción / Corrección (-)</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI EVOLUTIONARY DIAGNOSTIC SUMMARY REPORT */}
        <div className="space-y-3 pt-2">
          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide flex items-center gap-2">
            <Sparkles size={16} className="text-emerald-600" />
            3. Informe Cefalométrico Evolutivo (AI NemoStudio Engine)
          </h4>

          {isGeneratingAI ? (
            <div className="p-8 bg-slate-900 text-white rounded-3xl flex flex-col items-center justify-center space-y-3">
              <Loader2 size={32} className="animate-spin text-cyan-400" />
              <p className="font-bold text-sm text-cyan-200">Generando informe comparativo con IA Gemini 2.5...</p>
              <p className="text-xs text-slate-400">Analizando variaciones esqueléticas, dentoalveolares y estéticas de tejidos blandos.</p>
            </div>
          ) : aiReportText ? (
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl text-slate-900 leading-relaxed font-sans text-xs space-y-3">
              <Markdown>{aiReportText}</Markdown>
            </div>
          ) : (
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl text-center text-slate-500 space-y-2">
              <p className="font-bold text-xs">Haga clic en el botón de arriba para que la IA genere el informe diagnóstico evolutivo.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
