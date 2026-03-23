import { composeSquareImage } from '../canvas/composeSquareImage';
import type { EditorState } from '../../types/editor';
import type {
  ExportDeliveryMethod,
  ExportFormat,
  ExportResult
} from '../../types/export';
import type { LoadedImageAsset } from '../../types/image';

type ExportSquareImageOptions = {
  format: ExportFormat;
  image: LoadedImageAsset;
  editorState: EditorState;
  jpgQuality: number;
  size: number;
};

type DeliverExportOptions = {
  helperWindow?: Window | null;
};

const CANVAS_TO_BLOB_TIMEOUT_MS = 2500;

function createCanvas(size: number) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  return canvas;
}

function releaseCanvas(canvas: HTMLCanvasElement) {
  canvas.width = 0;
  canvas.height = 0;
}

function sanitizeBaseName(fileName: string) {
  return fileName
    .replace(/\.[a-z0-9]+$/i, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '') || 'imagen';
}

function getExportMimeType(format: ExportFormat) {
  return format === 'png' ? 'image/png' : 'image/jpeg';
}

function buildExportFileName(
  sourceName: string,
  format: ExportFormat,
  size: number
) {
  const baseName = sanitizeBaseName(sourceName);
  const extension = format === 'png' ? 'png' : 'jpg';

  return `${baseName}-cuadrafoto-${size}.${extension}`;
}

async function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality?: number
) {
  const blob = await new Promise<Blob | null>((resolve) => {
    let isSettled = false;
    const timeoutId = window.setTimeout(() => {
      if (isSettled) {
        return;
      }

      isSettled = true;
      resolve(null);
    }, CANVAS_TO_BLOB_TIMEOUT_MS);

    try {
      canvas.toBlob((nextBlob) => {
        if (isSettled) {
          return;
        }

        isSettled = true;
        window.clearTimeout(timeoutId);
        resolve(nextBlob);
      }, mimeType, quality);
    } catch {
      if (isSettled) {
        return;
      }

      isSettled = true;
      window.clearTimeout(timeoutId);
      resolve(null);
    }
  });

  if (blob) {
    return blob;
  }

  const dataUrl = canvas.toDataURL(mimeType, quality);
  const [header, payload = ''] = dataUrl.split(',');
  const isBase64 = /;base64/i.test(header);
  const rawData = isBase64 ? atob(payload) : decodeURIComponent(payload);
  const byteArray = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    byteArray[index] = rawData.charCodeAt(index);
  }

  return new Blob([byteArray], { type: mimeType });
}

function isIosLike() {
  if (typeof navigator === 'undefined') {
    return false;
  }

  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandaloneMode() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  const navigatorWithStandalone = navigator as Navigator & {
    standalone?: boolean;
  };

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    navigatorWithStandalone.standalone === true
  );
}

export function shouldPrepareExportWindow() {
  return isIosLike();
}

async function tryShareExport(
  result: ExportResult
): Promise<ExportDeliveryMethod | null> {
  const navigatorWithShare = navigator as Navigator & {
    canShare?: (data: { files?: File[] }) => boolean;
  };

  if (typeof navigatorWithShare.share !== 'function') {
    return null;
  }

  const file = new File([result.blob], result.fileName, {
    type: result.mimeType
  });

  if (
    typeof navigatorWithShare.canShare === 'function' &&
    !navigatorWithShare.canShare({ files: [file] })
  ) {
    return null;
  }

  try {
    await navigatorWithShare.share({
      files: [file],
      title: 'CuadraFoto',
      text: 'Imagen exportada desde CuadraFoto'
    });

    return 'share';
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return 'cancelled';
    }

    return null;
  }
}

export async function exportSquareImage({
  format,
  image,
  editorState,
  jpgQuality,
  size
}: ExportSquareImageOptions): Promise<ExportResult> {
  if (typeof document === 'undefined') {
    throw new Error('La exportación solo está disponible en el navegador.');
  }

  const canvas = createCanvas(size);
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No se pudo inicializar el canvas de exportación.');
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  try {
    composeSquareImage({
      ctx,
      editorState,
      image,
      size,
      qualityHint: 'export'
    });

    const mimeType = getExportMimeType(format);
    const blob = await canvasToBlob(
      canvas,
      mimeType,
      format === 'jpg' ? jpgQuality : undefined
    );

    return {
      blob,
      fileName: buildExportFileName(image.fileName, format, size),
      format,
      mimeType,
      size
    };
  } finally {
    releaseCanvas(canvas);
  }
}

export async function deliverExportedImage(
  result: ExportResult,
  options: DeliverExportOptions = {}
): Promise<ExportDeliveryMethod> {
  const { helperWindow = null } = options;
  const shouldPreferShare = isIosLike() && !isStandaloneMode();

  if (shouldPreferShare) {
    const shared = await tryShareExport(result);

    if (shared) {
      helperWindow?.close();
      return shared;
    }
  }

  const objectUrl = URL.createObjectURL(result.blob);

  try {
    const link = document.createElement('a');
    const supportsDownloadAttribute = typeof link.download === 'string';

    if (supportsDownloadAttribute && !isIosLike()) {
      link.href = objectUrl;
      link.download = result.fileName;
      link.rel = 'noopener';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return 'download';
    }

    if (helperWindow) {
      helperWindow.location.href = objectUrl;
      helperWindow.focus();

      return 'open';
    }

    const openedWindow = window.open(objectUrl, '_blank', 'noopener,noreferrer');

    if (openedWindow) {
      return 'open';
    }

    link.href = objectUrl;
    link.download = result.fileName;
    link.rel = 'noopener';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return 'download';
  } finally {
    window.setTimeout(() => {
      URL.revokeObjectURL(objectUrl);
    }, 60_000);
  }
}
