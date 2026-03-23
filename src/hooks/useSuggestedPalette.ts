import { useEffect, useState } from 'react';

import { extractSuggestedColors } from '../lib/colors/extractSuggestedColors';
import type { SuggestedColor } from '../types/colors';
import type { LoadedImageAsset } from '../types/image';

type SuggestedPaletteState = {
  colors: SuggestedColor[];
  error: string | null;
  isLoading: boolean;
};

const paletteCache = new WeakMap<object, SuggestedColor[]>();

const initialState: SuggestedPaletteState = {
  colors: [],
  error: null,
  isLoading: false
};

export function useSuggestedPalette(image: LoadedImageAsset | null) {
  const [state, setState] = useState<SuggestedPaletteState>(initialState);

  useEffect(() => {
    if (!image) {
      setState(initialState);
      return;
    }

    const cachedPalette = paletteCache.get(image.previewSource);

    if (cachedPalette) {
      setState({
        colors: cachedPalette,
        error: null,
        isLoading: false
      });
      return;
    }

    let isCancelled = false;

    setState({
      colors: [],
      error: null,
      isLoading: true
    });

    const runExtraction = () => {
      try {
        const nextPalette = extractSuggestedColors(image);

        if (isCancelled) {
          return;
        }

        paletteCache.set(image.previewSource, nextPalette);
        setState({
          colors: nextPalette,
          error: null,
          isLoading: false
        });
      } catch {
        if (isCancelled) {
          return;
        }

        setState({
          colors: [],
          error: 'No se pudieron generar colores sugeridos.',
          isLoading: false
        });
      }
    };

    const idleWindow = window as Window & {
      requestIdleCallback?: (
        callback: () => void,
        options?: { timeout: number }
      ) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    if (typeof idleWindow.requestIdleCallback === 'function') {
      const idleId = idleWindow.requestIdleCallback(runExtraction, {
        timeout: 180
      });

      return () => {
        isCancelled = true;
        idleWindow.cancelIdleCallback?.(idleId);
      };
    }

    const timeoutId = window.setTimeout(runExtraction, 0);

    return () => {
      isCancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [image]);

  return state;
}
