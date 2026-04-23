import { getCoverRect } from './geometry';
import { getBlurSupportProfile } from './blurSupport';
import type { ExportQualityHint } from '../../types/export';
import type { RenderableImageSource } from '../../types/image';

type DrawBlurBackgroundOptions = {
  ctx: CanvasRenderingContext2D;
  image: RenderableImageSource;
  imageWidth: number;
  imageHeight: number;
  targetWidth: number;
  targetHeight: number;
  blurAmount: number;
  qualityHint?: ExportQualityHint;
};

type BlurCacheBucket = {
  entries: Map<string, HTMLCanvasElement>;
  order: string[];
};

const MAX_CACHE_ENTRIES_PER_SOURCE = 6;
const blurBackgroundCache = new WeakMap<RenderableImageSource, BlurCacheBucket>();

function createCanvasElement(width: number, height: number) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function releaseCanvas(canvas: HTMLCanvasElement) {
  canvas.width = 0;
  canvas.height = 0;
}

function getImageCache(image: RenderableImageSource) {
  const existingCache = blurBackgroundCache.get(image);

  if (existingCache) {
    return existingCache;
  }

  const nextCache: BlurCacheBucket = {
    entries: new Map<string, HTMLCanvasElement>(),
    order: []
  };
  blurBackgroundCache.set(image, nextCache);

  return nextCache;
}

function setCachedCanvas(
  cache: BlurCacheBucket,
  key: string,
  canvas: HTMLCanvasElement
) {
  if (!cache.entries.has(key)) {
    cache.order.push(key);
  }

  cache.entries.set(key, canvas);

  while (cache.order.length > MAX_CACHE_ENTRIES_PER_SOURCE) {
    const evictedKey = cache.order.shift();

    if (!evictedKey) {
      return;
    }

    const evictedCanvas = cache.entries.get(evictedKey);

    if (evictedCanvas) {
      releaseCanvas(evictedCanvas);
    }

    cache.entries.delete(evictedKey);
  }
}

function getWorkingCanvasSize(
  targetWidth: number,
  targetHeight: number,
  blurAmount: number,
  qualityHint: ExportQualityHint
) {
  const blurProfile = getBlurSupportProfile();
  const targetMaxSide =
    qualityHint === 'export'
      ? blurProfile.prefersConservativeCanvas
        ? Math.min(Math.max(targetWidth, targetHeight), 420)
        : Math.min(Math.max(targetWidth, targetHeight), 560)
      : blurProfile.prefersConservativeCanvas
        ? Math.min(Math.max(targetWidth, targetHeight), 220)
        : Math.min(Math.max(targetWidth, targetHeight), 300);

  const adjustedMaxSide =
    blurAmount >= 28
      ? Math.max(140, Math.round(targetMaxSide * 0.72))
      : blurAmount >= 18
        ? Math.max(160, Math.round(targetMaxSide * 0.84))
        : targetMaxSide;
  const scale = Math.min(1, adjustedMaxSide / Math.max(targetWidth, targetHeight));

  return {
    height: Math.max(12, Math.round(targetHeight * scale)),
    width: Math.max(12, Math.round(targetWidth * scale))
  };
}

function getEffectiveBlurRadius(
  blurAmount: number,
  sourceMaxSide: number,
  outputMaxSide: number
) {
  if (blurAmount === 0) {
    return 0;
  }

  const blurProfile = getBlurSupportProfile();
  const sizeRatio = sourceMaxSide / outputMaxSide;
  const baseRadius = Math.max(1, blurAmount * sizeRatio);

  return blurProfile.isSafariLike
    ? Math.min(16, baseRadius * 0.8)
    : Math.min(22, baseRadius);
}

function drawBaseCoverImage(
  canvas: HTMLCanvasElement,
  image: RenderableImageSource,
  imageWidth: number,
  imageHeight: number,
  blurAmount: number
) {
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return;
  }

  const coverRect = getCoverRect(
    imageWidth,
    imageHeight,
    canvas.width,
    canvas.height
  );
  const bleed = 1.14 + blurAmount / 170;
  const width = coverRect.width * bleed;
  const height = coverRect.height * bleed;
  const x = (canvas.width - width) / 2;
  const y = (canvas.height - height) / 2;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(image, x, y, width, height);
}

function renderWithFilter(
  sourceCanvas: HTMLCanvasElement,
  radius: number
) {
  const outputCanvas = createCanvasElement(sourceCanvas.width, sourceCanvas.height);
  const ctx = outputCanvas.getContext('2d');

  if (!ctx) {
    return sourceCanvas;
  }

  ctx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.filter = radius > 0 ? `blur(${radius}px)` : 'none';
  ctx.drawImage(sourceCanvas, 0, 0);
  ctx.filter = 'none';

  return outputCanvas;
}

function renderWithFallbackBlur(
  sourceCanvas: HTMLCanvasElement,
  blurAmount: number
) {
  const passCount = blurAmount > 22 ? 3 : blurAmount > 10 ? 2 : 1;
  const passCanvasA = createCanvasElement(sourceCanvas.width, sourceCanvas.height);
  const passCanvasB = createCanvasElement(sourceCanvas.width, sourceCanvas.height);
  const passCtxA = passCanvasA.getContext('2d');
  const passCtxB = passCanvasB.getContext('2d');
  const downscaleCanvas = createCanvasElement(sourceCanvas.width, sourceCanvas.height);
  const downscaleCtx = downscaleCanvas.getContext('2d');

  if (!passCtxA || !passCtxB || !downscaleCtx) {
    return sourceCanvas;
  }

  let currentSource: CanvasImageSource = sourceCanvas;

  for (let passIndex = 0; passIndex < passCount; passIndex += 1) {
    const currentTarget = passIndex % 2 === 0 ? passCanvasA : passCanvasB;
    const currentTargetCtx = passIndex % 2 === 0 ? passCtxA : passCtxB;
    const scaleFactor = Math.max(0.12, 1 / (1 + blurAmount / (9 + passIndex * 4)));
    const reducedWidth = Math.max(12, Math.round(sourceCanvas.width * scaleFactor));
    const reducedHeight = Math.max(12, Math.round(sourceCanvas.height * scaleFactor));
    const offset = Math.max(1, Math.round((blurAmount / 10) * (passIndex + 1)));

    downscaleCanvas.width = reducedWidth;
    downscaleCanvas.height = reducedHeight;
    downscaleCtx.clearRect(0, 0, reducedWidth, reducedHeight);
    downscaleCtx.imageSmoothingEnabled = true;
    downscaleCtx.imageSmoothingQuality = 'high';
    downscaleCtx.drawImage(currentSource, 0, 0, reducedWidth, reducedHeight);

    currentTarget.width = sourceCanvas.width;
    currentTarget.height = sourceCanvas.height;
    currentTargetCtx.clearRect(0, 0, currentTarget.width, currentTarget.height);
    currentTargetCtx.imageSmoothingEnabled = true;
    currentTargetCtx.imageSmoothingQuality = 'high';
    currentTargetCtx.globalAlpha = 1;
    currentTargetCtx.drawImage(
      downscaleCanvas,
      0,
      0,
      currentTarget.width,
      currentTarget.height
    );
    currentTargetCtx.globalAlpha = 0.16;
    currentTargetCtx.drawImage(
      downscaleCanvas,
      -offset,
      0,
      currentTarget.width,
      currentTarget.height
    );
    currentTargetCtx.drawImage(
      downscaleCanvas,
      offset,
      0,
      currentTarget.width,
      currentTarget.height
    );
    currentTargetCtx.drawImage(
      downscaleCanvas,
      0,
      -offset,
      currentTarget.width,
      currentTarget.height
    );
    currentTargetCtx.drawImage(
      downscaleCanvas,
      0,
      offset,
      currentTarget.width,
      currentTarget.height
    );
    currentTargetCtx.globalAlpha = 1;

    currentSource = currentTarget;
  }

  const outputCanvas = createCanvasElement(sourceCanvas.width, sourceCanvas.height);
  const outputCtx = outputCanvas.getContext('2d');

  if (!outputCtx) {
    releaseCanvas(downscaleCanvas);

    if (currentSource !== passCanvasA) {
      releaseCanvas(passCanvasA);
    }

    if (currentSource !== passCanvasB) {
      releaseCanvas(passCanvasB);
    }

    return currentSource as HTMLCanvasElement;
  }

  outputCtx.drawImage(currentSource, 0, 0);
  releaseCanvas(passCanvasA);
  releaseCanvas(passCanvasB);
  releaseCanvas(downscaleCanvas);

  return outputCanvas;
}

function getCachedBlurBackground({
  image,
  imageWidth,
  imageHeight,
  targetWidth,
  targetHeight,
  blurAmount,
  qualityHint = 'preview'
}: Omit<DrawBlurBackgroundOptions, 'ctx'>) {
  const blurProfile = getBlurSupportProfile();
  const workingSize = getWorkingCanvasSize(
    targetWidth,
    targetHeight,
    blurAmount,
    qualityHint
  );
  const effectiveRadius = getEffectiveBlurRadius(
    blurAmount,
    Math.max(workingSize.width, workingSize.height),
    Math.max(targetWidth, targetHeight)
  );
  const cacheKey = [
    blurProfile.engine,
    qualityHint,
    blurProfile.prefersConservativeCanvas ? 'conservative' : 'default',
    `${workingSize.width}x${workingSize.height}`,
    blurAmount,
    effectiveRadius.toFixed(2)
  ].join(':');
  const imageCache = getImageCache(image);
  const cachedCanvas = imageCache.entries.get(cacheKey);

  if (cachedCanvas) {
    return cachedCanvas;
  }

  const baseCanvas = createCanvasElement(workingSize.width, workingSize.height);
  drawBaseCoverImage(baseCanvas, image, imageWidth, imageHeight, blurAmount);

  const renderedCanvas =
    blurProfile.supportsCanvasFilter && effectiveRadius > 0
      ? renderWithFilter(baseCanvas, effectiveRadius)
      : renderWithFallbackBlur(baseCanvas, blurAmount);

  if (renderedCanvas !== baseCanvas) {
    releaseCanvas(baseCanvas);
  }

  setCachedCanvas(imageCache, cacheKey, renderedCanvas);

  return renderedCanvas;
}

export function drawBlurBackground({
  ctx,
  image,
  imageWidth,
  imageHeight,
  targetWidth,
  targetHeight,
  blurAmount,
  qualityHint = 'preview'
}: DrawBlurBackgroundOptions) {
  const coverRect = getCoverRect(
    imageWidth,
    imageHeight,
    targetWidth,
    targetHeight
  );

  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  if (blurAmount <= 0) {
    ctx.drawImage(image, coverRect.x, coverRect.y, coverRect.width, coverRect.height);
  } else {
    const cachedBlurCanvas = getCachedBlurBackground({
      image,
      imageWidth,
      imageHeight,
      targetWidth,
      targetHeight,
      blurAmount,
      qualityHint
    });

    ctx.drawImage(cachedBlurCanvas, 0, 0, targetWidth, targetHeight);
  }

  ctx.restore();

  ctx.save();
  ctx.fillStyle = 'rgba(255, 250, 243, 0.12)';
  ctx.fillRect(0, 0, targetWidth, targetHeight);
  ctx.restore();
}
