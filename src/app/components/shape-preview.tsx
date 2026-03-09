import { useMemo, useRef } from "react";
import {
  generateWireframe,
  wireframeToSVG,
  type WireframeParams,
} from "./wireframe-engine";
import { Copy, Download, Check } from "lucide-react";
import { useState } from "react";

interface ShapePreviewProps {
  params: WireframeParams;
}

export function ShapePreview({ params }: ShapePreviewProps) {
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const wireframeData = useMemo(() => generateWireframe(params), [params]);
  const svgString = useMemo(() => wireframeToSVG(params), [params]);

  const { meridianLines, parallelLines, vertices, faces, viewBox } = wireframeData;

  const sortedLines = useMemo(() => {
    const lines = [...meridianLines, ...parallelLines];
    lines.sort((a, b) => a.avgZ - b.avgZ);
    return lines;
  }, [meridianLines, parallelLines]);

  const sortedFaces = useMemo(() => {
    return [...faces].sort((a, b) => a.avgZ - b.avgZ);
  }, [faces]);

  const handleCopySVG = async () => {
    try {
      await navigator.clipboard.writeText(svgString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = svgString;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadSVG = () => {
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wireframe-${params.baseShape}-${params.renderStyle}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPNG = () => {
    const canvas = document.createElement("canvas");
    const size = 800;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    const svgBlob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.drawImage(img, 0, 0, size, size);
      const pngUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = pngUrl;
      a.download = `wireframe-${params.baseShape}-${params.renderStyle}.png`;
      a.click();
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const renderContent = () => {
    const { renderStyle, lineColor, lineThickness, opacity, glowIntensity, dotSize, dashLength } = params;

    if (renderStyle === "solid") {
      return sortedFaces.map((face, i) => {
        const d = `M ${face.points.map((p) => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(" L ")} Z`;
        const shade = Math.max(0.1, Math.min(1, 0.3 + 0.7 * (face.normal > 0 ? 1 : 0.2)));
        return (
          <path
            key={i}
            d={d}
            fill={lineColor}
            fillOpacity={shade * opacity}
            stroke={lineColor}
            strokeWidth={lineThickness * 0.3}
            strokeOpacity={opacity * 0.3}
          />
        );
      });
    }

    if (renderStyle === "dots") {
      return vertices.map((v, i) => {
        const depthFade = params.perspective > 0 ? Math.max(0.2, 1 - v.z / (params.scale * 2)) : 1;
        return (
          <circle
            key={i}
            cx={v.x.toFixed(2)}
            cy={v.y.toFixed(2)}
            r={dotSize * depthFade}
            fill={lineColor}
            opacity={opacity * depthFade}
          />
        );
      });
    }

    // Line-based modes
    return sortedLines.map((line, i) => {
      if (line.points.length < 2) return null;

      if (renderStyle === "hiddenLine") {
        return (
          <g key={i}>
            {line.points.slice(0, -1).map((pt, j) => {
              const z0 = line.pointDepths[j];
              const z1 = line.pointDepths[j + 1];
              const avgSegZ = (z0 + z1) / 2;
              const maxDepth = params.scale / 100;
              const depthFactor = Math.max(0.06, Math.min(1, 0.5 - avgSegZ / (maxDepth * 3)));
              return (
                <line
                  key={j}
                  x1={pt[0].toFixed(2)}
                  y1={pt[1].toFixed(2)}
                  x2={line.points[j + 1][0].toFixed(2)}
                  y2={line.points[j + 1][1].toFixed(2)}
                  stroke={lineColor}
                  strokeWidth={lineThickness}
                  opacity={opacity * depthFactor}
                />
              );
            })}
          </g>
        );
      }

      const d =
        `M ${line.points[0][0].toFixed(2)} ${line.points[0][1].toFixed(2)}` +
        line.points.slice(1).map((p) => ` L ${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join("");

      return (
        <path
          key={i}
          d={d}
          fill="none"
          stroke={lineColor}
          strokeWidth={lineThickness}
          opacity={opacity}
          strokeDasharray={renderStyle === "dashed" ? `${dashLength} ${dashLength}` : undefined}
          filter={renderStyle === "glow" ? "url(#glow-filter)" : undefined}
        />
      );
    });
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* Preview */}
      <div
        ref={svgContainerRef}
        className="w-full max-w-[560px] aspect-square rounded-2xl overflow-hidden shadow-lg"
        style={{ backgroundColor: params.backgroundColor }}
      >
        <svg
          viewBox={viewBox}
          width="100%"
          height="100%"
          xmlns="http://www.w3.org/2000/svg"
        >
          {params.renderStyle === "glow" && (
            <defs>
              <filter id="glow-filter" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation={params.glowIntensity} result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
          )}
          {renderContent()}
        </svg>
      </div>

      {/* Export Buttons */}
      <div className="flex gap-3 flex-wrap justify-center">
        <button
          onClick={handleCopySVG}
          className="flex items-center gap-2 px-4 py-2.5 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied!" : "Copy SVG"}
        </button>
        <button
          onClick={handleDownloadSVG}
          className="flex items-center gap-2 px-4 py-2.5 border border-[var(--border)] rounded-lg hover:bg-[var(--accent)] transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Download SVG
        </button>
        <button
          onClick={handleDownloadPNG}
          className="flex items-center gap-2 px-4 py-2.5 border border-[var(--border)] rounded-lg hover:bg-[var(--accent)] transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Download PNG
        </button>
      </div>
    </div>
  );
}
