const fs = require('fs');
let code = fs.readFileSync('src/components/XRayEditor.tsx', 'utf8');

// fix double div
code = code.replace(
  /          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">\n          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">/g,
  `          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">`
);

fs.writeFileSync('src/components/XRayEditor.tsx', code, 'utf8');
console.log('fixed double div');
