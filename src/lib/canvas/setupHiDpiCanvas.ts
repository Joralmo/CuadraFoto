const MAX_PREVIEW_DPR = 2;

export function setupHiDpiCanvas(
  canvas: HTMLCanvasElement,
  displaySize: number
) {
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  const dpr = Math.min(window.devicePixelRatio || 1, MAX_PREVIEW_DPR);
  const scaledSize = Math.max(1, Math.round(displaySize * dpr));

  if (canvas.width !== scaledSize || canvas.height !== scaledSize) {
    canvas.width = scaledSize;
    canvas.height = scaledSize;
  }

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, displaySize, displaySize);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  return ctx;
}
