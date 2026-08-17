const fs = require('fs');
let code = fs.readFileSync('src/components/XRayEditor.tsx', 'utf8');

// The messed up part starts with:
// {activeAnalysisTab === 'cephalometric' && (
//          <div className="flex flex-col gap-4">
// ...
//           <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
//                        <g id="cephalometric-overlay-layer">

const regex = /\{activeAnalysisTab === 'cephalometric' && \(\s*<div className="flex flex-col gap-4">[\s\S]*?<div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">\s*<g id="cephalometric-overlay-layer">/;

code = code.replace(regex, `{activeAnalysisTab === 'cephalometric' && (\n                        <g id="cephalometric-overlay-layer">`);

fs.writeFileSync('src/components/XRayEditor.tsx', code, 'utf8');
console.log('Fixed SVG block');
