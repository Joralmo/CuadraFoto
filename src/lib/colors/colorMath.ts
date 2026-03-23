type RgbColor = {
  r: number;
  g: number;
  b: number;
};

type HslColor = {
  h: number;
  s: number;
  l: number;
};

function clampChannel(value: number) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

export function rgbToHex({ r, g, b }: RgbColor) {
  const channels = [clampChannel(r), clampChannel(g), clampChannel(b)];

  return `#${channels
    .map((channel) => channel.toString(16).padStart(2, '0'))
    .join('')}`;
}

export function hexToRgb(hex: string): RgbColor {
  const normalized = hex.replace('#', '');
  const raw =
    normalized.length === 3
      ? normalized
          .split('')
          .map((char) => `${char}${char}`)
          .join('')
      : normalized;

  const value = Number.parseInt(raw, 16);

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255
  };
}

export function rgbToHsl({ r, g, b }: RgbColor): HslColor {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  const lightness = (max + min) / 2;

  if (delta === 0) {
    return {
      h: 0,
      s: 0,
      l: lightness
    };
  }

  const saturation =
    lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);

  let hue = 0;

  switch (max) {
    case red:
      hue = (green - blue) / delta + (green < blue ? 6 : 0);
      break;
    case green:
      hue = (blue - red) / delta + 2;
      break;
    default:
      hue = (red - green) / delta + 4;
      break;
  }

  return {
    h: hue / 6,
    s: saturation,
    l: lightness
  };
}

export function rgbDistance(first: RgbColor, second: RgbColor) {
  const deltaR = first.r - second.r;
  const deltaG = first.g - second.g;
  const deltaB = first.b - second.b;

  return Math.sqrt(deltaR * deltaR + deltaG * deltaG + deltaB * deltaB);
}

export function isLightColor(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.7;
}

