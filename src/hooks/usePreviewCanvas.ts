import { useEffect, useRef, useState } from 'react';

import { composeSquareImage } from '../lib/canvas/composeSquareImage';
import { setupHiDpiCanvas } from '../lib/canvas/setupHiDpiCanvas';
import type { EditorState } from '../types/editor';
import type { LoadedImageAsset } from '../types/image';

type UsePreviewCanvasOptions = {
  editorState: EditorState;
  image: LoadedImageAsset;
};

export function usePreviewCanvas({
  editorState,
  image
}: UsePreviewCanvasOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [displaySize, setDisplaySize] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const updateSize = () => {
      const nextSize = Math.round(canvas.getBoundingClientRect().width);

      setDisplaySize((currentSize) =>
        currentSize === nextSize ? currentSize : nextSize
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

    if (!canvas || displaySize === 0) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      const ctx = setupHiDpiCanvas(canvas, displaySize);

      if (!ctx) {
        return;
      }

      composeSquareImage({
        ctx,
        editorState,
        image,
        size: displaySize
      });
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [displaySize, editorState, image]);

  return {
    canvasRef,
    displaySize
  };
}

