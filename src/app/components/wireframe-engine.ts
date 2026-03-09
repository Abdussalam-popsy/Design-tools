// Core 3D shape generation engine
// Uses revolution/lathe technique: rotate a 2D profile around the Y-axis

export type Point3D = [number, number, number];
export type Point2D = [number, number];

export type BaseShape =
  | "circle"
  | "square"
  | "triangle"
  | "star"
  | "semicircle"
  | "hexagon"
  | "wave"
  | "heart";

export type RenderStyle =
  | "wireframe"
  | "dots"
  | "dashed"
  | "glow"
  | "hiddenLine"
  | "solid";

export interface WireframeParams {
  baseShape: BaseShape;
  renderStyle: RenderStyle;
  meridians: number;
  parallels: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  scale: number;
  perspective: number;
  lineColor: string;
  backgroundColor: string;
  lineThickness: number;
  showMeridians: boolean;
  showParallels: boolean;
  opacity: number;
  glowIntensity: number;
  dotSize: number;
  dashLength: number;
}

export const defaultParams: WireframeParams = {
  baseShape: "circle",
  renderStyle: "wireframe",
  meridians: 24,
  parallels: 16,
  rotationX: -20,
  rotationY: 30,
  rotationZ: 0,
  scale: 150,
  perspective: 400,
  lineColor: "#ffffff",
  backgroundColor: "#e8622b",
  lineThickness: 1,
  showMeridians: true,
  showParallels: true,
  opacity: 1,
  glowIntensity: 8,
  dotSize: 2.5,
  dashLength: 4,
};

export const shapeLabels: Record<BaseShape, { name: string; result: string }> = {
  circle: { name: "Circle", result: "Sphere" },
  square: { name: "Square", result: "Cylinder" },
  triangle: { name: "Triangle", result: "Cone" },
  star: { name: "Star", result: "Star Sphere" },
  semicircle: { name: "Semicircle", result: "Torus" },
  hexagon: { name: "Hexagon", result: "Hex Barrel" },
  wave: { name: "Wave", result: "Vase" },
  heart: { name: "Heart", result: "Heart Solid" },
};

export const renderStyleLabels: Record<RenderStyle, { name: string; description: string }> = {
  wireframe: { name: "Wireframe", description: "Classic line wireframe" },
  dots: { name: "Dots", description: "Vertex points only" },
  dashed: { name: "Dashed", description: "Dashed line wireframe" },
  glow: { name: "Glow", description: "Neon glow effect" },
  hiddenLine: { name: "Hidden Line", description: "Back faces dimmed" },
  solid: { name: "Solid", description: "Filled faces with shading" },
};

/**
 * Generate the 2D profile points for each base shape.
 */
function getProfile(shape: BaseShape, numPoints: number): Point2D[] {
  const points: Point2D[] = [];

  switch (shape) {
    case "circle": {
      for (let i = 0; i <= numPoints; i++) {
        const t = (i / numPoints) * Math.PI;
        points.push([Math.sin(t), -Math.cos(t)]);
      }
      break;
    }
    case "square": {
      const capSteps = Math.max(2, Math.floor(numPoints / 6));
      const sideSteps = numPoints - 2 * capSteps;
      for (let i = 0; i <= capSteps; i++) {
        points.push([i / capSteps, -1]);
      }
      for (let i = 1; i <= sideSteps; i++) {
        points.push([1, -1 + (i / sideSteps) * 2]);
      }
      for (let i = 1; i <= capSteps; i++) {
        points.push([1 - i / capSteps, 1]);
      }
      break;
    }
    case "triangle": {
      const halfPoints = Math.floor(numPoints / 2);
      for (let i = 0; i <= halfPoints; i++) {
        const t = i / halfPoints;
        points.push([t, -1 + t * 2]);
      }
      for (let i = 1; i <= numPoints - halfPoints; i++) {
        const t = i / (numPoints - halfPoints);
        points.push([1 - t, 1]);
      }
      break;
    }
    case "star": {
      for (let i = 0; i <= numPoints; i++) {
        const t = (i / numPoints) * Math.PI;
        const r = 1 + 0.3 * Math.sin(5 * 2 * t);
        points.push([r * Math.sin(t), -r * Math.cos(t)]);
      }
      break;
    }
    case "semicircle": {
      const torusRadius = 0.35;
      const torusOffset = 0.65;
      for (let i = 0; i <= numPoints; i++) {
        const t = (i / numPoints) * Math.PI * 2;
        points.push([torusOffset + torusRadius * Math.cos(t), torusRadius * Math.sin(t)]);
      }
      break;
    }
    case "hexagon": {
      // Hexagonal profile → revolves into faceted barrel
      const sides = 6;
      const pointsPerSide = Math.max(1, Math.floor(numPoints / (sides + 2)));
      // Top cap
      for (let i = 0; i <= pointsPerSide; i++) {
        const t = i / pointsPerSide;
        points.push([t * 0.85, -1]);
      }
      // Hexagonal sides
      for (let s = 0; s < sides; s++) {
        const angle0 = (s / sides) * Math.PI;
        const angle1 = ((s + 1) / sides) * Math.PI;
        const r0 = 0.65 + 0.2 * Math.cos(angle0 * 3);
        const r1 = 0.65 + 0.2 * Math.cos(angle1 * 3);
        const y0 = -1 + (s / sides) * 2;
        const y1 = -1 + ((s + 1) / sides) * 2;
        for (let i = 1; i <= pointsPerSide; i++) {
          const t = i / pointsPerSide;
          points.push([r0 + (r1 - r0) * t, y0 + (y1 - y0) * t]);
        }
      }
      // Bottom cap
      for (let i = 1; i <= pointsPerSide; i++) {
        const t = i / pointsPerSide;
        points.push([0.85 * (1 - t), 1]);
      }
      break;
    }
    case "wave": {
      // Wavy profile → revolves into vase shape
      for (let i = 0; i <= numPoints; i++) {
        const t = (i / numPoints) * Math.PI;
        const base = Math.sin(t);
        const wave = 0.15 * Math.sin(t * 6);
        const r = base * 0.7 + wave + 0.3 * Math.sin(t);
        points.push([Math.max(0, r), -Math.cos(t)]);
      }
      break;
    }
    case "heart": {
      // Heart-shaped profile → revolves into heart solid
      for (let i = 0; i <= numPoints; i++) {
        const t = (i / numPoints) * Math.PI;
        // Heart curve parametric
        const angle = t;
        const r =
          0.5 * (1 - Math.sin(angle)) +
          0.15 * Math.sqrt(Math.abs(Math.cos(angle))) *
            Math.sin(angle) *
            (angle < Math.PI / 2 ? 1 : 0.6);
        const x = Math.max(0, 0.3 + r * Math.sin(angle) * 0.8);
        const y = -Math.cos(angle) * (0.8 + 0.2 * Math.sin(angle * 2));
        points.push([x, y]);
      }
      break;
    }
  }

  return points;
}

function rotatePoint(p: Point3D, rx: number, ry: number, rz: number): Point3D {
  let [x, y, z] = p;
  const cosX = Math.cos(rx), sinX = Math.sin(rx);
  const y1 = y * cosX - z * sinX;
  const z1 = y * sinX + z * cosX;
  y = y1; z = z1;

  const cosY = Math.cos(ry), sinY = Math.sin(ry);
  const x2 = x * cosY + z * sinY;
  const z2 = -x * sinY + z * cosY;
  x = x2; z = z2;

  const cosZ = Math.cos(rz), sinZ = Math.sin(rz);
  const x3 = x * cosZ - y * sinZ;
  const y3 = x * sinZ + y * cosZ;
  x = x3; y = y3;

  return [x, y, z];
}

function project(p: Point3D, perspective: number, scale: number, cx: number, cy: number): Point2D {
  const [x, y, z] = p;
  if (perspective > 0) {
    const d = perspective / (perspective + z);
    return [cx + x * scale * d, cy + y * scale * d];
  }
  return [cx + x * scale, cy + y * scale];
}

export interface WireframeLine {
  points: Point2D[];
  avgZ: number;
  pointDepths: number[]; // z-depth per point for hidden-line effect
}

export interface WireframeVertex {
  x: number;
  y: number;
  z: number; // depth for shading
}

export interface WireframeFace {
  points: Point2D[];
  normal: number; // z-component of face normal (for lighting)
  avgZ: number;
}

/**
 * Generate the complete wireframe geometry
 */
export function generateWireframe(params: WireframeParams): {
  meridianLines: WireframeLine[];
  parallelLines: WireframeLine[];
  vertices: WireframeVertex[];
  faces: WireframeFace[];
  viewBox: string;
} {
  const {
    baseShape, meridians, parallels,
    rotationX, rotationY, rotationZ,
    scale, perspective,
  } = params;

  const size = 400;
  const cx = size / 2;
  const cy = size / 2;

  const rx = (rotationX * Math.PI) / 180;
  const ry = (rotationY * Math.PI) / 180;
  const rz = (rotationZ * Math.PI) / 180;

  const profile = getProfile(baseShape, parallels);

  // Generate 3D grid by revolving profile around Y-axis
  const grid: Point3D[][] = [];
  const rotatedGrid: Point3D[][] = [];

  for (let m = 0; m < meridians; m++) {
    const theta = (m / meridians) * Math.PI * 2;
    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);

    const ring: Point3D[] = [];
    const rotatedRing: Point3D[] = [];
    for (const [r, h] of profile) {
      const point3D: Point3D = [r * cosT, h, r * sinT];
      ring.push(point3D);
      rotatedRing.push(rotatePoint(point3D, rx, ry, rz));
    }
    grid.push(ring);
    rotatedGrid.push(rotatedRing);
  }

  // Generate meridian lines
  const meridianLines: WireframeLine[] = [];
  if (params.showMeridians) {
    for (let m = 0; m < meridians; m++) {
      const projected: Point2D[] = [];
      const depths: number[] = [];
      let totalZ = 0;
      for (let p = 0; p < rotatedGrid[m].length; p++) {
        const rotated = rotatedGrid[m][p];
        totalZ += rotated[2];
        depths.push(rotated[2]);
        projected.push(project(rotated, perspective, scale, cx, cy));
      }
      meridianLines.push({
        points: projected,
        avgZ: totalZ / rotatedGrid[m].length,
        pointDepths: depths,
      });
    }
  }

  // Generate parallel lines
  const parallelLines: WireframeLine[] = [];
  if (params.showParallels) {
    for (let p = 0; p < profile.length; p++) {
      const projected: Point2D[] = [];
      const depths: number[] = [];
      let totalZ = 0;
      for (let m = 0; m <= meridians; m++) {
        const mIdx = m % meridians;
        const rotated = rotatedGrid[mIdx][p];
        totalZ += rotated[2];
        depths.push(rotated[2]);
        projected.push(project(rotated, perspective, scale, cx, cy));
      }
      parallelLines.push({
        points: projected,
        avgZ: totalZ / (meridians + 1),
        pointDepths: depths,
      });
    }
  }

  // Generate vertices (for dot mode)
  const vertices: WireframeVertex[] = [];
  const seenVertices = new Set<string>();
  for (let m = 0; m < meridians; m++) {
    for (let p = 0; p < rotatedGrid[m].length; p++) {
      const rotated = rotatedGrid[m][p];
      const proj = project(rotated, perspective, scale, cx, cy);
      const key = `${proj[0].toFixed(1)},${proj[1].toFixed(1)}`;
      if (!seenVertices.has(key)) {
        seenVertices.add(key);
        vertices.push({ x: proj[0], y: proj[1], z: rotated[2] });
      }
    }
  }

  // Generate faces (for solid mode)
  const faces: WireframeFace[] = [];
  for (let m = 0; m < meridians; m++) {
    const nextM = (m + 1) % meridians;
    for (let p = 0; p < profile.length - 1; p++) {
      const r00 = rotatedGrid[m][p];
      const r10 = rotatedGrid[nextM][p];
      const r01 = rotatedGrid[m][p + 1];
      const r11 = rotatedGrid[nextM][p + 1];

      const p00 = project(r00, perspective, scale, cx, cy);
      const p10 = project(r10, perspective, scale, cx, cy);
      const p01 = project(r01, perspective, scale, cx, cy);
      const p11 = project(r11, perspective, scale, cx, cy);

      // Compute face normal (z-component for lighting)
      const edge1: Point3D = [r10[0] - r00[0], r10[1] - r00[1], r10[2] - r00[2]];
      const edge2: Point3D = [r01[0] - r00[0], r01[1] - r00[1], r01[2] - r00[2]];
      const normalZ = edge1[0] * edge2[1] - edge1[1] * edge2[0];

      const avgZ = (r00[2] + r10[2] + r01[2] + r11[2]) / 4;

      faces.push({
        points: [p00, p10, p11, p01],
        normal: normalZ,
        avgZ,
      });
    }
  }

  return { meridianLines, parallelLines, vertices, faces, viewBox: `0 0 ${size} ${size}` };
}

/**
 * Convert wireframe data to SVG string
 */
export function wireframeToSVG(params: WireframeParams): string {
  const { meridianLines, parallelLines, vertices, faces, viewBox } = generateWireframe(params);
  const { lineColor, backgroundColor, lineThickness, opacity, renderStyle, glowIntensity, dotSize, dashLength } = params;

  let defs = "";
  let content = "";

  // SVG filter for glow
  if (renderStyle === "glow") {
    defs = `  <defs>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="${glowIntensity}" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>\n`;
  }

  if (renderStyle === "solid") {
    // Sort faces back to front
    const sortedFaces = [...faces].sort((a, b) => a.avgZ - b.avgZ);
    for (const face of sortedFaces) {
      const d = `M ${face.points.map((p) => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(" L ")} Z`;
      // Shade based on normal direction
      const shade = Math.max(0.1, Math.min(1, 0.3 + 0.7 * (face.normal > 0 ? 1 : 0.2)));
      content += `  <path d="${d}" fill="${lineColor}" fill-opacity="${(shade * opacity).toFixed(2)}" stroke="${lineColor}" stroke-width="${lineThickness * 0.3}" stroke-opacity="${opacity * 0.3}" />\n`;
    }
  } else if (renderStyle === "dots") {
    for (const v of vertices) {
      const depthFade = params.perspective > 0 ? Math.max(0.2, 1 - v.z / (params.scale * 2)) : 1;
      content += `  <circle cx="${v.x.toFixed(2)}" cy="${v.y.toFixed(2)}" r="${dotSize * depthFade}" fill="${lineColor}" opacity="${(opacity * depthFade).toFixed(2)}" />\n`;
    }
  } else {
    // Line-based styles: wireframe, dashed, glow, hiddenLine
    const allLines = [...meridianLines, ...parallelLines];
    allLines.sort((a, b) => a.avgZ - b.avgZ);

    const filterAttr = renderStyle === "glow" ? ' filter="url(#glow)"' : "";
    const dashAttr = renderStyle === "dashed" ? ` stroke-dasharray="${dashLength} ${dashLength}"` : "";

    for (const line of allLines) {
      if (line.points.length < 2) continue;

      if (renderStyle === "hiddenLine") {
        // Draw segments with opacity based on depth
        for (let i = 0; i < line.points.length - 1; i++) {
          const z0 = line.pointDepths[i];
          const z1 = line.pointDepths[i + 1];
          const avgSegZ = (z0 + z1) / 2;
          // Normalize depth: front = full opacity, back = very dim
          const maxDepth = params.scale / 100;
          const depthFactor = Math.max(0.06, Math.min(1, 0.5 - avgSegZ / (maxDepth * 3)));
          const d = `M ${line.points[i][0].toFixed(2)} ${line.points[i][1].toFixed(2)} L ${line.points[i + 1][0].toFixed(2)} ${line.points[i + 1][1].toFixed(2)}`;
          content += `  <path d="${d}" fill="none" stroke="${lineColor}" stroke-width="${lineThickness}" opacity="${(opacity * depthFactor).toFixed(3)}" />\n`;
        }
      } else {
        let d = `M ${line.points[0][0].toFixed(2)} ${line.points[0][1].toFixed(2)}`;
        for (let i = 1; i < line.points.length; i++) {
          d += ` L ${line.points[i][0].toFixed(2)} ${line.points[i][1].toFixed(2)}`;
        }
        content += `  <path d="${d}" fill="none" stroke="${lineColor}" stroke-width="${lineThickness}" opacity="${opacity}"${dashAttr}${filterAttr} />\n`;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="400" height="400">
  <rect width="100%" height="100%" fill="${backgroundColor}" />
${defs}${content}</svg>`;
}
