const fs = require('fs');

let code = fs.readFileSync('src/components/XRayEditor.tsx', 'utf8');

// 1. Fix getCoordinates
const getCoordinatesOld = `  const getCoordinates = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const xUnscaled = ((e.clientX - rect.left) / rect.width) * 800;
    const yUnscaled = ((e.clientY - rect.top) / rect.height) * 500;
    
    // Reverse the translate and scale transforms
    const x = (xUnscaled - panOffset.x - 400) / zoomScale + 400;
    const y = (yUnscaled - panOffset.y - 250) / zoomScale + 250;
    
    return { x: Math.round(x), y: Math.round(y) };
  };`;

const getCoordinatesNew = `  const getCoordinates = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    
    const inverse = ctm.inverse();
    const cursorPt = pt.matrixTransform(inverse);
    
    const xUnscaled = cursorPt.x;
    const yUnscaled = cursorPt.y;
    
    // Reverse the translate and scale transforms
    const x = (xUnscaled - panOffset.x - 400) / zoomScale + 400;
    const y = (yUnscaled - panOffset.y - 250) / zoomScale + 250;
    
    return { x: Math.round(x), y: Math.round(y) };
  };`;

code = code.replace(getCoordinatesOld, getCoordinatesNew);

// 2. Remove maxWidth: '800px'
code = code.replace(/maxWidth: '800px',?\s*/g, '');

fs.writeFileSync('src/components/XRayEditor.tsx', code, 'utf8');
console.log('Fixed XRayEditor');
