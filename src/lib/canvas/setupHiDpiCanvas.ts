type CanvasDisplaySize = {
  height: number;
  width: number;
};

const MAX_PREVIEW_DPR = 2;

export function setupHiDpiCanvas(
  canvas: HTMLCanvasElement,
  displaySize: CanvasDisplaySize
) {
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  const dpr = Math.min(window.devicePixelRatio || 1, MAX_PREVIEW_DPR);
  const scaledWidth = Math.max(1, Math.round(displaySize.width * dpr));
  const scaledHeight = Math.max(1, Math.round(displaySize.height * dpr));

  if (canvas.width !== scaledWidth || canvas.height !== scaledHeight) {
    canvas.width = scaledWidth;
    canvas.height = scaledHeight;
  }

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, displaySize.width, displaySize.height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  return ctx;
}
