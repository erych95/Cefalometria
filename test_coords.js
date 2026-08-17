function getLocalCoords(gx, gy, Tx, Ty, A, S) {
  // 1. untranslate
  const rx = gx - Tx;
  const ry = gy - Ty;
  
  // 2. unrotate
  const a = -A * (Math.PI / 180);
  const cosA = Math.cos(a);
  const sinA = Math.sin(a);
  const sx = 400 + (rx - 400) * cosA - (ry - 250) * sinA;
  const sy = 250 + (rx - 400) * sinA + (ry - 250) * cosA;
  
  // 3. unscale
  const px = sx / S;
  const py = sy / S;
  
  return { x: px, y: py };
}

function getGlobal(px, py, Tx, Ty, A, S) {
  const sx = px * S;
  const sy = py * S;
  
  const a = A * (Math.PI / 180);
  const cosA = Math.cos(a);
  const sinA = Math.sin(a);
  const rx = 400 + (sx - 400) * cosA - (sy - 250) * sinA;
  const ry = 250 + (sx - 400) * sinA + (sy - 250) * cosA;
  
  const gx = rx + Tx;
  const gy = ry + Ty;
  return { x: gx, y: gy };
}

const g = getGlobal(100, 100, 50, 60, 45, 1.5);
console.log(getLocalCoords(g.x, g.y, 50, 60, 45, 1.5));
