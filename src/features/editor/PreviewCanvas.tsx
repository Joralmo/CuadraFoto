import { useId, type KeyboardEvent } from 'react';

import { useCanvasGestures } from '../../hooks/useCanvasGestures';
import { usePreviewCanvas } from '../../hooks/usePreviewCanvas';
import type { EditorState } from '../../types/editor';
import type { LoadedImageAsset } from '../../types/image';

type PreviewCanvasProps = {
  editorState: EditorState;
  image: LoadedImageAsset;
  onPan: (deltaX: number, deltaY: number) => void;
  onScaleChange: (value: number) => void;
};

export function PreviewCanvas({
  editorState,
  image,
  onPan,
  onScaleChange
}: PreviewCanvasProps) {
  const instructionsId = useId();
  const { canvasRef } = usePreviewCanvas({
    editorState,
    image
  });
  const gestureHandlers = useCanvasGestures({
    getScale: () => editorState.scale,
    onPan,
    onScaleChange
  });
  const handleKeyDown = (event: KeyboardEvent<HTMLCanvasElement>) => {
    const panStep = event.shiftKey ? 42 : 22;
    const scaleStep = event.shiftKey ? 0.12 : 0.06;

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        onPan(-panStep, 0);
        break;
      case 'ArrowRight':
        event.preventDefault();
        onPan(panStep, 0);
        break;
      case 'ArrowUp':
        event.preventDefault();
        onPan(0, -panStep);
        break;
      case 'ArrowDown':
        event.preventDefault();
        onPan(0, panStep);
        break;
      case '+':
      case '=':
        event.preventDefault();
        onScaleChange(editorState.scale + scaleStep);
        break;
      case '-':
      case '_':
        event.preventDefault();
        onScaleChange(editorState.scale - scaleStep);
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-[2.25rem] border border-black/10 bg-[linear-gradient(180deg,rgba(255,250,243,0.95),rgba(244,236,223,0.88))] shadow-soft">
        <div className="flex items-center justify-between border-b border-black/8 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-black/45">
          <span>Vista 1:1</span>
          <span>{editorState.backgroundMode === 'blur' ? 'Difuminado' : 'Color'}</span>
        </div>

        <canvas
          ref={canvasRef}
          className="aspect-square w-full touch-none select-none bg-mist cursor-grab active:cursor-grabbing"
          tabIndex={0}
          aria-label="Vista cuadrada editable"
          aria-describedby={instructionsId}
          onKeyDown={handleKeyDown}
          {...gestureHandlers}
        />
      </div>

      <div
        id={instructionsId}
        className="grid grid-cols-2 gap-2 text-xs text-black/55"
      >
        <div className="rounded-2xl border border-black/10 bg-white/65 px-3 py-3">
          Arrastra para reencuadrar
        </div>
        <div className="rounded-2xl border border-black/10 bg-white/65 px-3 py-3">
          Acerca o aleja con el control
        </div>
      </div>

      <div className="text-xs text-black/50">
        <p>Así se verá tu imagen al descargarla.</p>
      </div>
    </div>
  );
}
