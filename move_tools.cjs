const fs = require('fs');

let code = fs.readFileSync('src/components/XRayEditor.tsx', 'utf8');

const injectedTools = `        {activeAnalysisTab === 'cephalometric' && (
          <div className="flex flex-col gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
              <h4 className="text-slate-800 font-bold text-xs uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                <PenTool size={14} className="text-blue-500" />
                Herramientas de Trazado Libre
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setActiveTool('select')}
                  className={\`py-2 px-2 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 cursor-pointer transition-all \${
                    activeTool === 'select'
                      ? 'bg-blue-50 text-blue-600 border-blue-300 font-bold'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }\`}
                >
                  <Maximize2 size={15} />
                  <span>Navegar</span>
                </button>
                <button
                  onClick={() => setActiveTool('pan')}
                  className={\`py-2 px-2 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 cursor-pointer transition-all \${
                    activeTool === 'pan'
                      ? 'bg-blue-50 text-blue-600 border-blue-300 font-bold'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }\`}
                >
                  <Hand size={15} className="text-blue-500" />
                  <span>Mover</span>
                </button>
                <button
                  onClick={() => setActiveTool('line')}
                  className={\`py-2 px-2 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 cursor-pointer transition-all \${
                    activeTool === 'line'
                      ? 'bg-blue-50 text-blue-600 border-blue-300 font-bold'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }\`}
                >
                  <Scale size={15} />
                  <span>Regla</span>
                </button>
                <button
                  onClick={() => setActiveTool('pencil')}
                  className={\`py-2 px-2 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 cursor-pointer transition-all \${
                    activeTool === 'pencil'
                      ? 'bg-blue-50 text-blue-600 border-blue-300 font-bold'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }\`}
                >
                  <PenTool size={15} />
                  <span>Lápiz</span>
                </button>
              </div>
              
              <div className="space-y-1.5 mt-2">
                <span className="text-xs font-semibold text-slate-500">Color del Trazo Libre:</span>
                <div className="flex gap-2">
                  {['#00f0ff', '#ef4444', '#eab308', '#22c55e', '#ec4899'].map((col) => (
                    <button
                      key={col}
                      onClick={() => setActiveColor(col)}
                      className={\`w-7 h-7 rounded-full border-2 cursor-pointer transition-all flex items-center justify-center \${
                        activeColor === col ? 'scale-110 border-slate-600' : 'border-transparent'
                      }\`}
                      style={{ backgroundColor: col }}
                    >
                      {activeColor === col && <span className="w-1.5 h-1.5 bg-slate-950 rounded-full" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>`;

code = code.replace(
  /{activeAnalysisTab === 'cephalometric' && \(/g,
  (match, offset, str) => {
    // There are multiple matches. We want the one that is near the end (the UI panel, line 3197)
    // The first one is in SVG (around line 2102). We want the later one.
    if (offset > 2500) {
      return injectedTools + '\n          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">';
    }
    return match; // keep original for the SVG block
  }
);

code = code.replace(
  /{activeAnalysisTab === 'smile' && \(/,
  `}
        {activeAnalysisTab === 'smile' && (`
);

fs.writeFileSync('src/components/XRayEditor.tsx', code, 'utf8');
console.log('injected');
