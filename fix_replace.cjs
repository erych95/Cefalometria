const fs = require('fs');
let code = fs.readFileSync('src/components/XRayEditor.tsx', 'utf8');

// handleMouseDown: setCurrentLine
code = code.replace(
  /setCurrentLine\(\{\s*x1:\s*coords\.x,\s*y1:\s*coords\.y,\s*x2:\s*coords\.x,\s*y2:\s*coords\.y\s*\}\);/g,
  `setCurrentLine({ x1: tCoords.x, y1: tCoords.y, x2: tCoords.x, y2: tCoords.y });`
);

// handleMouseMove: setCurrentLine
code = code.replace(
  /setCurrentLine\(\{\s*\.\.\.currentLine,\s*x2:\s*coords\.x,\s*y2:\s*coords\.y\s*\}\);/g,
  `setCurrentLine({ ...currentLine, x2: tCoords.x, y2: tCoords.y });`
);

// handleMouseMove: setCurrentPencilPoints
code = code.replace(
  /setCurrentPencilPoints\(\[\.\.\.currentPencilPoints,\s*coords\]\);/g,
  `setCurrentPencilPoints([...currentPencilPoints, tCoords]);`
);

// handleMouseDown: text
code = code.replace(
  /x:\s*coords\.x,\n\s*y:\s*coords\.y/g,
  `x: tCoords.x,\n          y: tCoords.y`
);

fs.writeFileSync('src/components/XRayEditor.tsx', code, 'utf8');
console.log('Fixed XRayEditor coords replacement');
