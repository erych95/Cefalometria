const fs = require('fs');
let code = fs.readFileSync('src/components/XRayEditor.tsx', 'utf8');

code = code.replace(/    const coords = getCoordinates\(e\);\n    const tCoords = getTracingsCoords\(coords\);\n    const tCoords = getTracingsCoords\(coords\);/g, '    const coords = getCoordinates(e);\n    const tCoords = getTracingsCoords(coords);');

fs.writeFileSync('src/components/XRayEditor.tsx', code, 'utf8');
console.log('Fixed XRayEditor.tsx duplicate tCoords');
