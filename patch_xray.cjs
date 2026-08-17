const fs = require('fs');

let code = fs.readFileSync('src/components/XRayEditor.tsx', 'utf8');

// 1. Add getTracingsCoords helper
if (!code.includes('const getTracingsCoords =')) {
  code = code.replace(
    '  const getCoordinates = (e: React.MouseEvent<SVGSVGElement>) => {',
    `  const getTracingsCoords = (globalCoords: { x: number, y: number }) => {
    const rx = globalCoords.x - tracingsLayer.x;
    const ry = globalCoords.y - tracingsLayer.y;
    const a = -tracingsLayer.rotation * (Math.PI / 180);
    const cosA = Math.cos(a);
    const sinA = Math.sin(a);
    const sx = 400 + (rx - 400) * cosA - (ry - 250) * sinA;
    const sy = 250 + (rx - 400) * sinA + (ry - 250) * cosA;
    return { x: Math.round(sx / tracingsLayer.scale), y: Math.round(sy / tracingsLayer.scale) };
  };

  const getCoordinates = (e: React.MouseEvent<SVGSVGElement>) => {`
  );
}

// 2. Inject tCoords into handleMouseDown, handleMouseMove, handleMouseUp
code = code.replace(
  '    const coords = getCoordinates(e);',
  `    const coords = getCoordinates(e);\n    const tCoords = getTracingsCoords(coords);`
);
// replace multiple occurrences if they exist, but let's do it cleanly:
let occurrences = 0;
code = code.replace(/    const coords = getCoordinates\(e\);/g, match => {
  occurrences++;
  return `    const coords = getCoordinates(e);\n    const tCoords = getTracingsCoords(coords);`;
});

// 3. Fix handleMouseDown
// 3a. ceph hit-test 1
code = code.replace(
  `        clickedLandmark = Object.values(landmarks).some(pt => {
          const dx = pt.x - coords.x;
          const dy = pt.y - coords.y;`,
  `        clickedLandmark = Object.values(landmarks).some(pt => {
          const dx = pt.x - tCoords.x;
          const dy = pt.y - tCoords.y;`
);
// 3b. ceph hit-test 2
code = code.replace(
  `      (Object.entries(landmarks) as [string, { x: number; y: number }][]).forEach(([key, pt]) => {
        const dx = pt.x - coords.x;
        const dy = pt.y - coords.y;`,
  `      (Object.entries(landmarks) as [string, { x: number; y: number }][]).forEach(([key, pt]) => {
        const dx = pt.x - tCoords.x;
        const dy = pt.y - tCoords.y;`
);

// 3c. draw line start
code = code.replace(
  `      setCurrentLine({
        id: \`ann-\${Date.now()}\`,
        type: 'line',
        x1: coords.x,
        y1: coords.y,
        x2: coords.x,
        y2: coords.y,`,
  `      setCurrentLine({
        id: \`ann-\${Date.now()}\`,
        type: 'line',
        x1: tCoords.x,
        y1: tCoords.y,
        x2: tCoords.x,
        y2: tCoords.y,`
);

// 3d. pencil start
code = code.replace(
  `      setCurrentPencilPoints([coords]);`,
  `      setCurrentPencilPoints([tCoords]);`
);

// 3e. text start
code = code.replace(
  `        color: activeColor,
        text: 'Nueva Etiqueta',
        x1: coords.x,
        y1: coords.y,
        x2: coords.x,
        y2: coords.y`,
  `        color: activeColor,
        text: 'Nueva Etiqueta',
        x1: tCoords.x,
        y1: tCoords.y,
        x2: tCoords.x,
        y2: tCoords.y`
);


// 4. Fix handleMouseMove
// 4a. ceph drag
code = code.replace(
  `      setLandmarks((prev) => ({
        ...prev,
        [draggingLandmark]: {
          x: Math.round(Math.max(10, Math.min(790, coords.x))),
          y: Math.round(Math.max(10, Math.min(490, coords.y)))
        }
      }));`,
  `      setLandmarks((prev) => ({
        ...prev,
        [draggingLandmark]: {
          x: Math.round(Math.max(10, Math.min(790, tCoords.x))),
          y: Math.round(Math.max(10, Math.min(490, tCoords.y)))
        }
      }));`
);

// 4b. line draw
code = code.replace(
  `      setCurrentLine({
        ...currentLine,
        x2: coords.x,
        y2: coords.y
      });`,
  `      setCurrentLine({
        ...currentLine,
        x2: tCoords.x,
        y2: tCoords.y
      });`
);

// 4c. pencil draw
code = code.replace(
  `      setCurrentPencilPoints((prev) => [...prev, coords]);`,
  `      setCurrentPencilPoints((prev) => [...prev, tCoords]);`
);


// 5. Fix handleMouseUp
// 5a. line end
code = code.replace(
  `      const dx = coords.x - currentLine.x1;
      const dy = coords.y - currentLine.y1;`,
  `      const dx = tCoords.x - currentLine.x1;
      const dy = tCoords.y - currentLine.y1;`
);

// Note: x2 and y2 were already set to coords.x in handleMouseMove, wait... 
// in handleMouseUp:
// x2: currentLine.x2, y2: currentLine.y2. It doesn't read coords directly here!
// But just in case, let's check what handleMouseUp actually does.

fs.writeFileSync('src/components/XRayEditor.tsx', code, 'utf8');
console.log('Successfully patched XRayEditor.tsx');
