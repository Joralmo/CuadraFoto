import { useId, type KeyboardEvent } from 'react';

import { useCanvasGestures } from '../../hooks/useCanvasGestures';
import { usePreviewCanvas } from '../../hooks/usePreviewCanvas';
import type { EditorState } from '../../types/editor';
import type { ExportPresetOption } from '../../types/export';
import type { LoadedImageAsset } from '../../types/image';

type PreviewCanvasProps = {
  editorState: EditorState;
  images: LoadedImageAsset[];
  preset: ExportPresetOption;
  onPan: (deltaX: number, deltaY: number) => void;
  onScaleChange: (value: number) => void;
  onSelectLayer: (id: string) => void;
};

export function PreviewCanvas({
  editorState,
  images,
  preset,
  onPan,
  onScaleChange,
  onSelectLayer
}: PreviewCanvasProps) {
  const instructionsId = useId();
  const { canvasRef, displaySize } = usePreviewCanvas({
    editorState,
    images,
    targetWidth: preset.width,
    targetHeight: preset.height
  });
  const normalizedPan = (deltaX: number, deltaY: number) => {
    if (displaySize.width === 0 || displaySize.height === 0) {
      return;
    }

    onPan(deltaX / displaySize.width, deltaY / displaySize.height);
  };
  const selectedScale = editorState.layers.find((layer) => layer.id === editorState.selectedLayerId)?.scale ?? 1;
  const gestureHandlers = useCanvasGestures({
    getScale: () => selectedScale,
    onPan: normalizedPan,
    onScaleChange
  });
  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;
    const matched = [...editorState.layers].reverse().find((layer) =>
      Math.abs(x - layer.x) <= layer.width / 2 && Math.abs(y - layer.y) <= layer.height / 2
    );
    if (matched) onSelectLayer(matched.id);
    gestureHandlers.onPointerDown(event);
  };
  const previewMaxWidth = Math.max(
    220,
    Math.round(520 * (preset.width / preset.height))
  );
  const handleKeyDown = (event: KeyboardEvent<HTMLCanvasElement>) => {
    const panStep = event.shiftKey ? 42 : 22;
    const scaleStep = event.shiftKey ? 0.12 : 0.06;

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        normalizedPan(-panStep, 0);
        break;
      case 'ArrowRight':
        event.preventDefault();
        normalizedPan(panStep, 0);
        break;
      case 'ArrowUp':
        event.preventDefault();
        normalizedPan(0, -panStep);
        break;
      case 'ArrowDown':
        event.preventDefault();
        normalizedPan(0, panStep);
        break;
      case '+':
      case '=':
        event.preventDefault();
        onScaleChange(selectedScale + scaleStep);
        break;
      case '-':
      case '_':
        event.preventDefault();
        onScaleChange(selectedScale - scaleStep);
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-[2.25rem] border border-black/10 bg-[linear-gradient(180deg,rgba(255,250,243,0.95),rgba(244,236,223,0.88))] shadow-soft">
        <div className="flex items-center justify-between border-b border-black/8 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-black/45">
          <span>
            Vista {preset.ratioLabel}
          </span>
          <span>{editorState.backgroundMode === 'blur' ? 'Difuminado' : 'Color'}</span>
        </div>

        <div className="flex justify-center px-4 py-4">
          <canvas
            ref={canvasRef}
            className="block w-full touch-none select-none rounded-[1.75rem] bg-mist cursor-grab active:cursor-grabbing"
            style={{
              aspectRatio: `${preset.width} / ${preset.height}`,
              maxWidth: `${previewMaxWidth}px`
            }}
            tabIndex={0}
            aria-label={`Vista editable ${preset.label.toLowerCase()}`}
            aria-describedby={instructionsId}
            onKeyDown={handleKeyDown}
            {...gestureHandlers}
            onPointerDown={handlePointerDown}
          />
        </div>
      </div>

      <div
        id={instructionsId}
        className="grid grid-cols-2 gap-2 text-xs text-black/55"
      >
        <div className="rounded-2xl border border-black/10 bg-white/65 px-3 py-3">
          Toca una foto y arrástrala
        </div>
        <div className="rounded-2xl border border-black/10 bg-white/65 px-3 py-3">
          Pellizca para hacer zoom
        </div>
      </div>

      <div className="text-xs text-black/50">
        <p>
          Así se verá tu imagen al descargarla en {preset.width} x {preset.height}.
        </p>
      </div>
    </div>
  );
}
