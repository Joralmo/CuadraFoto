export type BlurEngine = 'filter' | 'fallback';

export interface BlurSupportProfile {
  engine: BlurEngine;
  isSafariLike: boolean;
  prefersConservativeCanvas: boolean;
  supportsCanvasFilter: boolean;
}

let cachedFilterSupport: boolean | null = null;

function detectCanvasFilterSupport() {
  if (cachedFilterSupport !== null) {
    return cachedFilterSupport;
  }

  if (typeof document === 'undefined') {
    cachedFilterSupport = false;
    return cachedFilterSupport;
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx || typeof ctx.filter !== 'string') {
    cachedFilterSupport = false;
    return cachedFilterSupport;
  }

  const previousFilter = ctx.filter;
  ctx.filter = 'blur(1px)';
  cachedFilterSupport = ctx.filter === 'blur(1px)';
  ctx.filter = previousFilter;

  return cachedFilterSupport;
}

function detectSafariLikeBrowser() {
  if (typeof navigator === 'undefined') {
    return false;
  }

  const userAgent = navigator.userAgent.toLowerCase();
  const isAppleMobile = /iphone|ipad|ipod/.test(userAgent);
  const isWebKit =
    /applewebkit/.test(userAgent) &&
    !/crios|fxios|edgios|opr\//.test(userAgent);

  return isAppleMobile || isWebKit;
}

export function getBlurSupportProfile(): BlurSupportProfile {
  const supportsCanvasFilter = detectCanvasFilterSupport();
  const isSafariLike = detectSafariLikeBrowser();

  return {
    engine: supportsCanvasFilter ? 'filter' : 'fallback',
    isSafariLike,
    prefersConservativeCanvas: isSafariLike,
    supportsCanvasFilter
  };
}

