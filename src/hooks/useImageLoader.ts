import { useEffect, useState } from 'react';

import type { LoadedImageAsset } from '../types/image';

const ACCEPTED_TYPES = new Set(['image/jpeg', 'image/png']);
const ACCEPTED_EXTENSIONS = ['.jpg', '.jpeg', '.png'];
const MAX_EDITOR_SOURCE_SIZE = 2048;

type ImageLoaderState = {
  image: LoadedImageAsset | null;
  error: string | null;
  isLoading: boolean;
};

const initialState: ImageLoaderState = {
  image: null,
  error: null,
  isLoading: false
};

function isSupportedImageFile(file: File) {
  const lowerName = file.name.toLowerCase();

  return (
    ACCEPTED_TYPES.has(file.type) ||
    ACCEPTED_EXTENSIONS.some((extension) => lowerName.endsWith(extension))
  );
}

function getPreviewSize(width: number, height: number) {
  const maxSide = Math.max(width, height);

  if (maxSide <= MAX_EDITOR_SOURCE_SIZE) {
    return {
      height,
      isPreviewOptimized: false,
      width
    };
  }

  const scale = MAX_EDITOR_SOURCE_SIZE / maxSide;

  return {
    height: Math.max(1, Math.round(height * scale)),
    isPreviewOptimized: true,
    width: Math.max(1, Math.round(width * scale))
  };
}

async function createPreviewSource(
  imageElement: HTMLImageElement
) {
  const { naturalHeight, naturalWidth } = imageElement;
  const previewSize = getPreviewSize(naturalWidth, naturalHeight);

  if (!previewSize.isPreviewOptimized || typeof document === 'undefined') {
    return {
      isPreviewOptimized: false,
      previewHeight: naturalHeight,
      previewSource: imageElement,
      previewWidth: naturalWidth
    };
  }

  const previewCanvas = document.createElement('canvas');
  previewCanvas.width = previewSize.width;
  previewCanvas.height = previewSize.height;
  const ctx = previewCanvas.getContext('2d');

  if (!ctx) {
    return {
      isPreviewOptimized: false,
      previewHeight: naturalHeight,
      previewSource: imageElement,
      previewWidth: naturalWidth
    };
  }

  ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(imageElement, {
        resizeHeight: previewSize.height,
        resizeQuality: 'high',
        resizeWidth: previewSize.width
      });

      ctx.drawImage(bitmap, 0, 0, previewSize.width, previewSize.height);
      bitmap.close();

      return {
        isPreviewOptimized: true,
        previewHeight: previewSize.height,
        previewSource: previewCanvas,
        previewWidth: previewSize.width
      };
    } catch {
      // Safari y algunos WebViews pueden rechazar resize options; seguimos con drawImage.
    }
  }

  try {
    ctx.drawImage(imageElement, 0, 0, previewSize.width, previewSize.height);
  } catch {
    previewCanvas.width = 0;
    previewCanvas.height = 0;

    return {
      isPreviewOptimized: false,
      previewHeight: naturalHeight,
      previewSource: imageElement,
      previewWidth: naturalWidth
    };
  }

  return {
    isPreviewOptimized: true,
    previewHeight: previewSize.height,
    previewSource: previewCanvas,
    previewWidth: previewSize.width
  };
}

export function useImageLoader(file: File | null) {
  const [state, setState] = useState<ImageLoaderState>(initialState);

  useEffect(() => {
    if (!file) {
      setState(initialState);
      return;
    }

    if (!isSupportedImageFile(file)) {
      setState({
        image: null,
        error: 'Formato no compatible. Usa JPG, JPEG o PNG.',
        isLoading: false
      });
      return;
    }

    let isCancelled = false;
    const objectUrl = URL.createObjectURL(file);
    const imageElement = new Image();
    imageElement.decoding = 'async';

    setState({
      image: null,
      error: null,
      isLoading: true
    });

    const handleLoad = async () => {
      try {
        if (typeof imageElement.decode === 'function') {
          await imageElement.decode();
        }
      } catch {
        // Safari puede disparar decode de forma inconsistente; el onload ya es suficiente.
      }

      if (isCancelled) {
        return;
      }

      const previewAsset = await createPreviewSource(imageElement);

      if (isCancelled) {
        if (previewAsset.previewSource instanceof HTMLCanvasElement) {
          previewAsset.previewSource.width = 0;
          previewAsset.previewSource.height = 0;
        }

        return;
      }

      setState({
        image: {
          element: imageElement,
          fileName: file.name,
          fileSize: file.size,
          isPreviewOptimized: previewAsset.isPreviewOptimized,
          mimeType: file.type || 'image/jpeg',
          previewHeight: previewAsset.previewHeight,
          previewSource: previewAsset.previewSource,
          previewWidth: previewAsset.previewWidth,
          width: imageElement.naturalWidth,
          height: imageElement.naturalHeight
        },
        error: null,
        isLoading: false
      });
    };

    const handleError = () => {
      if (isCancelled) {
        return;
      }

      setState({
        image: null,
        error: 'No se pudo leer la imagen. Intenta con otro archivo.',
        isLoading: false
      });
    };

    imageElement.onload = () => {
      void handleLoad();
    };
    imageElement.onerror = handleError;
    imageElement.src = objectUrl;

    return () => {
      isCancelled = true;
      imageElement.onload = null;
      imageElement.onerror = null;
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  return state;
}
