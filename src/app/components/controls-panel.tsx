import {
  type WireframeParams,
  type BaseShape,
  type RenderStyle,
  shapeLabels,
  renderStyleLabels,
} from "./wireframe-engine";
import {
  Circle,
  Square,
  Triangle,
  Star,
  CircleDot,
  Hexagon,
  Waves,
  Heart,
  RotateCcw,
  Grid3x3,
  CircleDashed,
  Sparkles,
  EyeOff,
  Box,
  Dot,
} from "lucide-react";
import type { ReactNode } from "react";

interface ControlsPanelProps {
  params: WireframeParams;
  onChange: (params: WireframeParams) => void;
  onReset: () => void;
}

const shapeIcons: Record<BaseShape, ReactNode> = {
  circle: <Circle className="w-5 h-5" />,
  square: <Square className="w-5 h-5" />,
  triangle: <Triangle className="w-5 h-5" />,
  star: <Star className="w-5 h-5" />,
  semicircle: <CircleDot className="w-5 h-5" />,
  hexagon: <Hexagon className="w-5 h-5" />,
  wave: <Waves className="w-5 h-5" />,
  heart: <Heart className="w-5 h-5" />,
};

const styleIcons: Record<RenderStyle, ReactNode> = {
  wireframe: <Grid3x3 className="w-4 h-4" />,
  dots: <Dot className="w-4 h-4" />,
  dashed: <CircleDashed className="w-4 h-4" />,
  glow: <Sparkles className="w-4 h-4" />,
  hiddenLine: <EyeOff className="w-4 h-4" />,
  solid: <Box className="w-4 h-4" />,
};

function SliderControl({
  label,
  value,
  min,
  max,
  step,
  onChange,
  unit,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  unit?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <span className="text-[13px] text-[var(--muted-foreground)]">{label}</span>
        <span className="text-[13px] tabular-nums text-[var(--foreground)]">
          {value}{unit || ""}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-[var(--muted)]
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--primary)]
          [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-sm"
      />
    </div>
  );
}

function ColorControl({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[13px] text-[var(--muted-foreground)]">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-[90px] px-2 py-1 text-[13px] bg-[var(--input-background)] border border-[var(--border)] rounded-md text-center"
        />
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded-md border border-[var(--border)] cursor-pointer p-0.5"
        />
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[11px] uppercase tracking-wider text-[var(--muted-foreground)] border-b border-[var(--border)] pb-2">
        {title}
      </h3>
      {children}
    </div>
  );
}

export function ControlsPanel({ params, onChange, onReset }: ControlsPanelProps) {
  const update = (partial: Partial<WireframeParams>) => {
    onChange({ ...params, ...partial });
  };

  return (
    <div className="flex flex-col gap-6 p-5 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[18px]">Shape Studio</h2>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] border border-[var(--border)] rounded-lg hover:bg-[var(--accent)] transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>

      {/* Shape Selection */}
      <Section title="Base Shape">
        <div className="grid grid-cols-4 gap-2">
          {(Object.keys(shapeLabels) as BaseShape[]).map((shape) => (
            <button
              key={shape}
              onClick={() => update({ baseShape: shape })}
              className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                params.baseShape === shape
                  ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm"
                  : "border-[var(--border)] hover:border-[var(--foreground)] hover:bg-[var(--accent)]"
              }`}
              title={`${shapeLabels[shape].name} → ${shapeLabels[shape].result}`}
            >
              {shapeIcons[shape]}
              <span className="text-[10px]">{shapeLabels[shape].name}</span>
            </button>
          ))}
        </div>
        <p className="text-[12px] text-[var(--muted-foreground)] text-center">
          {shapeLabels[params.baseShape].name} →{" "}
          <span className="text-[var(--foreground)]">
            {shapeLabels[params.baseShape].result}
          </span>
        </p>
      </Section>

      {/* Render Style */}
      <Section title="Render Style">
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(renderStyleLabels) as RenderStyle[]).map((style) => (
            <button
              key={style}
              onClick={() => update({ renderStyle: style })}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all cursor-pointer ${
                params.renderStyle === style
                  ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm"
                  : "border-[var(--border)] hover:border-[var(--foreground)] hover:bg-[var(--accent)]"
              }`}
              title={renderStyleLabels[style].description}
            >
              {styleIcons[style]}
              <span className="text-[10px]">{renderStyleLabels[style].name}</span>
            </button>
          ))}
        </div>
        <p className="text-[11px] text-[var(--muted-foreground)] text-center italic">
          {renderStyleLabels[params.renderStyle].description}
        </p>
      </Section>

      {/* Geometry */}
      <Section title="Geometry">
        <SliderControl
          label="Meridians"
          value={params.meridians}
          min={3}
          max={64}
          step={1}
          onChange={(v) => update({ meridians: v })}
        />
        <SliderControl
          label="Parallels"
          value={params.parallels}
          min={3}
          max={64}
          step={1}
          onChange={(v) => update({ parallels: v })}
        />
        <div className="flex gap-3 mt-1">
          <label className="flex items-center gap-2 cursor-pointer text-[13px] text-[var(--muted-foreground)]">
            <input
              type="checkbox"
              checked={params.showMeridians}
              onChange={(e) => update({ showMeridians: e.target.checked })}
              className="accent-[var(--primary)] cursor-pointer"
            />
            Meridians
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-[13px] text-[var(--muted-foreground)]">
            <input
              type="checkbox"
              checked={params.showParallels}
              onChange={(e) => update({ showParallels: e.target.checked })}
              className="accent-[var(--primary)] cursor-pointer"
            />
            Parallels
          </label>
        </div>
      </Section>

      {/* Rotation */}
      <Section title="Rotation">
        <SliderControl label="Rotate X" value={params.rotationX} min={-180} max={180} step={1} onChange={(v) => update({ rotationX: v })} unit="°" />
        <SliderControl label="Rotate Y" value={params.rotationY} min={-180} max={180} step={1} onChange={(v) => update({ rotationY: v })} unit="°" />
        <SliderControl label="Rotate Z" value={params.rotationZ} min={-180} max={180} step={1} onChange={(v) => update({ rotationZ: v })} unit="°" />
      </Section>

      {/* View */}
      <Section title="View">
        <SliderControl label="Scale" value={params.scale} min={50} max={300} step={5} onChange={(v) => update({ scale: v })} />
        <SliderControl label="Perspective" value={params.perspective} min={0} max={1000} step={10} onChange={(v) => update({ perspective: v })} />
      </Section>

      {/* Style */}
      <Section title="Style">
        <SliderControl label="Line Thickness" value={params.lineThickness} min={0.1} max={5} step={0.1} onChange={(v) => update({ lineThickness: v })} unit="px" />
        <SliderControl label="Opacity" value={params.opacity} min={0.05} max={1} step={0.05} onChange={(v) => update({ opacity: v })} />

        {/* Conditional style controls */}
        {params.renderStyle === "glow" && (
          <SliderControl label="Glow Intensity" value={params.glowIntensity} min={1} max={20} step={1} onChange={(v) => update({ glowIntensity: v })} />
        )}
        {params.renderStyle === "dots" && (
          <SliderControl label="Dot Size" value={params.dotSize} min={0.5} max={8} step={0.5} onChange={(v) => update({ dotSize: v })} unit="px" />
        )}
        {params.renderStyle === "dashed" && (
          <SliderControl label="Dash Length" value={params.dashLength} min={1} max={20} step={1} onChange={(v) => update({ dashLength: v })} />
        )}

        <ColorControl label="Line Color" value={params.lineColor} onChange={(v) => update({ lineColor: v })} />
        <ColorControl label="Background" value={params.backgroundColor} onChange={(v) => update({ backgroundColor: v })} />
      </Section>

      {/* Presets */}
      <Section title="Quick Presets">
        <div className="grid grid-cols-2 gap-2">
          {[
            { name: "Classic Orange", preset: { lineColor: "#ffffff", backgroundColor: "#e8622b", renderStyle: "wireframe" as RenderStyle } },
            { name: "Neon Glow", preset: { lineColor: "#00ff88", backgroundColor: "#0a0a0a", renderStyle: "glow" as RenderStyle, glowIntensity: 8 } },
            { name: "Blueprint", preset: { lineColor: "#ffffff", backgroundColor: "#1a3a5c", renderStyle: "wireframe" as RenderStyle } },
            { name: "Cyber Dots", preset: { lineColor: "#ff00ff", backgroundColor: "#1a0a2e", renderStyle: "dots" as RenderStyle, dotSize: 3 } },
            { name: "Minimal", preset: { lineColor: "#333333", backgroundColor: "#f5f5f5", renderStyle: "wireframe" as RenderStyle } },
            { name: "Ghost", preset: { lineColor: "#ffffff", backgroundColor: "#0f0f23", renderStyle: "hiddenLine" as RenderStyle } },
            { name: "Sunset Solid", preset: { lineColor: "#ffd700", backgroundColor: "#c0392b", renderStyle: "solid" as RenderStyle } },
            { name: "Matrix", preset: { lineColor: "#00ff41", backgroundColor: "#000000", renderStyle: "dashed" as RenderStyle, dashLength: 3 } },
          ].map((p) => (
            <button
              key={p.name}
              onClick={() => update(p.preset)}
              className="flex items-center gap-2 px-3 py-2 text-[12px] border border-[var(--border)] rounded-lg hover:bg-[var(--accent)] transition-colors cursor-pointer"
            >
              <div
                className="w-4 h-4 rounded-full border border-[var(--border)] flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${p.preset.backgroundColor} 50%, ${p.preset.lineColor} 50%)`,
                }}
              />
              {p.name}
            </button>
          ))}
        </div>
      </Section>
    </div>
  );
}
