import type { SuggestedColor } from '../../types/colors';
import type { LoadedImageAsset } from '../../types/image';
import { rgbDistance, rgbToHex, rgbToHsl } from './colorMath';

type ColorBucket = {
  count: number;
  totalR: number;
  totalG: number;
  totalB: number;
};

const MAX_ANALYSIS_SIZE = 64;
const QUANTIZATION_STEP = 24;
const MIN_COLORS = 5;
const MAX_COLORS = 8;
const IDEAL_COLORS = 6;
const MIN_ALPHA = 160;
const SIMILARITY_THRESHOLD = 42;

function createAnalysisCanvas(width: number, height: number) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  return canvas;
}

function getAnalysisSize(width: number, height: number) {
  const scale = Math.min(1, MAX_ANALYSIS_SIZE / Math.max(width, height));

  return {
    width: Math.max(8, Math.round(width * scale)),
    height: Math.max(8, Math.round(height * scale))
  };
}

function createBucketKey(r: number, g: number, b: number) {
  const bucketR = Math.round(r / QUANTIZATION_STEP) * QUANTIZATION_STEP;
  const bucketG = Math.round(g / QUANTIZATION_STEP) * QUANTIZATION_STEP;
  const bucketB = Math.round(b / QUANTIZATION_STEP) * QUANTIZATION_STEP;

  return `${bucketR}:${bucketG}:${bucketB}`;
}

function scoreColor(
  population: number,
  saturation: number,
  lightness: number
) {
  const saturationWeight = 0.55 + saturation * 0.95;
  const lightnessCenter = 1 - Math.min(1, Math.abs(lightness - 0.56) * 1.7);
  const lightnessWeight = 0.42 + lightnessCenter * 0.88;
  const neutralBonus = saturation < 0.16 && lightness > 0.22 && lightness < 0.82 ? 0.14 : 0;

  return population * (saturationWeight + lightnessWeight + neutralBonus);
}

function buildCandidates(imageData: Uint8ClampedArray) {
  const buckets = new Map<string, ColorBucket>();

  for (let index = 0; index < imageData.length; index += 4) {
    const alpha = imageData[index + 3];

    if (alpha < MIN_ALPHA) {
      continue;
    }

    const red = imageData[index];
    const green = imageData[index + 1];
    const blue = imageData[index + 2];
    const key = createBucketKey(red, green, blue);
    const existingBucket = buckets.get(key);

    if (existingBucket) {
      existingBucket.count += 1;
      existingBucket.totalR += red;
      existingBucket.totalG += green;
      existingBucket.totalB += blue;
      continue;
    }

    buckets.set(key, {
      count: 1,
      totalR: red,
      totalG: green,
      totalB: blue
    });
  }

  return Array.from(buckets.values())
    .map<SuggestedColor>((bucket) => {
      const rgb = {
        r: bucket.totalR / bucket.count,
        g: bucket.totalG / bucket.count,
        b: bucket.totalB / bucket.count
      };
      const hsl = rgbToHsl(rgb);

      return {
        hex: rgbToHex(rgb),
        rgb,
        hsl,
        population: bucket.count,
        score: scoreColor(bucket.count, hsl.s, hsl.l)
      };
    })
    .sort((first, second) => second.score - first.score);
}

function dedupeCandidates(colors: SuggestedColor[]) {
  const selected: SuggestedColor[] = [];

  for (const color of colors) {
    const isTooSimilar = selected.some((existingColor) => {
      const closeInRgb = rgbDistance(existingColor.rgb, color.rgb) < SIMILARITY_THRESHOLD;
      const closeInLightness =
        Math.abs(existingColor.hsl.l - color.hsl.l) < 0.08;
      const closeInSaturation =
        Math.abs(existingColor.hsl.s - color.hsl.s) < 0.12;

      return closeInRgb || (closeInLightness && closeInSaturation);
    });

    if (isTooSimilar) {
      continue;
    }

    selected.push(color);

    if (selected.length === MAX_COLORS) {
      break;
    }
  }

  return selected;
}

function ensureMinimumPalette(
  primaryPalette: SuggestedColor[],
  fallbackCandidates: SuggestedColor[]
) {
  if (primaryPalette.length >= MIN_COLORS) {
    return primaryPalette.slice(0, MAX_COLORS);
  }

  const merged = [...primaryPalette];

  for (const candidate of fallbackCandidates) {
    if (merged.some((existingColor) => existingColor.hex === candidate.hex)) {
      continue;
    }

    merged.push(candidate);

    if (merged.length >= MIN_COLORS) {
      break;
    }
  }

  return merged.slice(0, MAX_COLORS);
}

function orderPalette(colors: SuggestedColor[]) {
  if (colors.length <= IDEAL_COLORS) {
    return colors;
  }

  return colors.slice(0, IDEAL_COLORS);
}

export function extractSuggestedColors(
  image: LoadedImageAsset
): SuggestedColor[] {
  if (typeof document === 'undefined') {
    return [];
  }

  const { width, height } = getAnalysisSize(
    image.previewWidth,
    image.previewHeight
  );
  const canvas = createAnalysisCanvas(width, height);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    return [];
  }

  ctx.clearRect(0, 0, width, height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(image.previewSource, 0, 0, width, height);

  const { data } = ctx.getImageData(0, 0, width, height);
  const candidates = buildCandidates(data);

  if (candidates.length === 0) {
    return [];
  }

  const visuallyUseful = candidates.filter((candidate) => {
    const isVeryDark = candidate.hsl.l < 0.08;
    const isVeryBright = candidate.hsl.l > 0.93;

    return !isVeryDark && !isVeryBright;
  });

  const dedupedUseful = dedupeCandidates(visuallyUseful);
  const ensuredPalette = ensureMinimumPalette(dedupedUseful, candidates);

  return orderPalette(ensuredPalette);
}
