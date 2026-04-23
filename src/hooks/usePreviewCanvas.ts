import { useEffect, useRef, useState } from 'react';

import { composeExportImage } from '../lib/canvas/composeSquareImage';
import { setupHiDpiCanvas } from '../lib/canvas/setupHiDpiCanvas';
import type { EditorState } from '../types/editor';
import type { LoadedImageAsset } from '../types/image';

type UsePreviewCanvasOptions = {
  editorState: EditorState;
  image: LoadedImageAsset;
  targetHeight: number;
  targetWidth: number;
};

type PreviewDisplaySize = {
  height: number;
  width: number;
};

export function usePreviewCanvas({
  editorState,
  image,
  targetHeight,
  targetWidth
}: UsePreviewCanvasOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [displaySize, setDisplaySize] = useState<PreviewDisplaySize>({
    width: 0,
    height: 0
  });

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const updateSize = () => {
      const bounds = canvas.getBoundingClientRect();
      const nextSize = {
        width: Math.round(bounds.width),
        height: Math.round(bounds.height)
      };

      setDisplaySize((currentSize) =>
        currentSize.width === nextSize.width &&
        currentSize.height === nextSize.height
          ? currentSize
          : nextSize
      );
    };

    updateSize();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateSize);

      return () => {
        window.removeEventListener('resize', updateSize);
      };
    }

    const observer = new ResizeObserver(() => {
      updateSize();
    });

    observer.observe(canvas);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas || displaySize.width === 0 || displaySize.height === 0) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      const ctx = setupHiDpiCanvas(canvas, displaySize);

      if (!ctx) {
        return;
      }

      composeExportImage({
        ctx,
        editorState,
        image,
        targetWidth: displaySize.width,
        targetHeight: displaySize.height
      });
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [displaySize, editorState, image, targetHeight, targetWidth]);

  return {
    canvasRef,
    displaySize
  };
}
