import { useState, useCallback } from "react";
import { ShapePreview } from "./components/shape-preview";
import { ControlsPanel } from "./components/controls-panel";
import { defaultParams, type WireframeParams } from "./components/wireframe-engine";
import { PanelLeftClose, PanelLeft } from "lucide-react";

export default function App() {
  const [params, setParams] = useState<WireframeParams>({ ...defaultParams });
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleReset = useCallback(() => {
    setParams({ ...defaultParams });
  }, []);

  return (
    <div className="size-full flex bg-[var(--background)]">
      {/* Sidebar */}
      <div
        className={`flex-shrink-0 border-r border-[var(--border)] bg-[var(--card)] transition-all duration-300 overflow-hidden ${
          sidebarOpen ? "w-[340px]" : "w-0"
        }`}
      >
        <div className="w-[340px] h-full">
          <ControlsPanel
            params={params}
            onChange={setParams}
            onReset={handleReset}
          />
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)]">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-[var(--accent)] transition-colors cursor-pointer"
            title={sidebarOpen ? "Hide controls" : "Show controls"}
          >
            {sidebarOpen ? (
              <PanelLeftClose className="w-4 h-4" />
            ) : (
              <PanelLeft className="w-4 h-4" />
            )}
          </button>
          <div className="flex items-center gap-2 text-[13px] text-[var(--muted-foreground)]">
            <span>3D Shape Studio</span>
            <span className="text-[var(--border)]">|</span>
            <span className="text-[var(--foreground)]">
              {params.baseShape.charAt(0).toUpperCase() +
                params.baseShape.slice(1)}{" "}
              → {params.renderStyle.charAt(0).toUpperCase() +
                params.renderStyle.slice(1)}
            </span>
          </div>
        </div>

        {/* Preview Canvas */}
        <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
          <ShapePreview params={params} />
        </div>
      </div>
    </div>
  );
}