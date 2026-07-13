import type { CollageLayer } from '../../types/editor';
import type { RenderableImageSource } from '../../types/image';

type Options = {
  ctx: CanvasRenderingContext2D;
  layer: CollageLayer;
  image: RenderableImageSource;
  imageWidth: number;
  imageHeight: number;
  targetWidth: number;
  targetHeight: number;
  selected?: boolean;
};

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
}

export function traceLayerShape(ctx: CanvasRenderingContext2D, layer: CollageLayer, width: number, height: number) {
  const x = -width / 2;
  const y = -height / 2;
  ctx.beginPath();
  if (layer.shape === 'circle') {
    const radius = Math.min(width, height) / 2;
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
  } else if (layer.shape === 'oval') {
    ctx.ellipse(0, 0, width / 2, height / 2, 0, 0, Math.PI * 2);
  } else if (layer.shape === 'heart') {
    ctx.moveTo(0, height * 0.42);
    ctx.bezierCurveTo(-width * 0.58, height * 0.08, -width * 0.52, -height * 0.38, -width * 0.24, -height * 0.38);
    ctx.bezierCurveTo(-width * 0.08, -height * 0.38, 0, -height * 0.24, 0, -height * 0.12);
    ctx.bezierCurveTo(0, -height * 0.24, width * 0.08, -height * 0.38, width * 0.24, -height * 0.38);
    ctx.bezierCurveTo(width * 0.52, -height * 0.38, width * 0.58, height * 0.08, 0, height * 0.42);
  } else if (layer.shape === 'star') {
    for (let index = 0; index < 10; index += 1) {
      const radius = index % 2 === 0 ? Math.min(width, height) * 0.5 : Math.min(width, height) * 0.22;
      const angle = -Math.PI / 2 + index * Math.PI / 5;
      const px = Math.cos(angle) * radius;
      const py = Math.sin(angle) * radius;
      if (index === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
  } else if (layer.shape === 'rounded') {
    roundedRect(ctx, x, y, width, height, Math.min(width, height) * layer.borderRadius);
  } else {
    ctx.rect(x, y, width, height);
  }
  ctx.closePath();
}

function getFilter(filter: CollageLayer['filter']) {
  switch (filter) {
    case 'vivid': return 'saturate(1.45) contrast(1.08)';
    case 'mono': return 'grayscale(1) contrast(1.08)';
    case 'warm': return 'sepia(.28) saturate(1.18)';
    case 'cool': return 'saturate(.9) hue-rotate(178deg) hue-rotate(-168deg)';
    default: return 'none';
  }
}

export function drawCollageLayer({ ctx, layer, image, imageWidth, imageHeight, targetWidth, targetHeight, selected = false }: Options) {
  const frameWidth = layer.width * targetWidth;
  const frameHeight = layer.height * targetHeight;
  const coverScale = Math.max(frameWidth / imageWidth, frameHeight / imageHeight) * layer.scale;
  const drawWidth = imageWidth * coverScale;
  const drawHeight = imageHeight * coverScale;

  ctx.save();
  ctx.translate(layer.x * targetWidth, layer.y * targetHeight);
  ctx.rotate(layer.rotation * Math.PI / 180);
  traceLayerShape(ctx, layer, frameWidth, frameHeight);
  ctx.clip();
  ctx.globalAlpha = layer.opacity;
  ctx.filter = getFilter(layer.filter);
  ctx.drawImage(image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
  ctx.filter = 'none';
  ctx.restore();

  if (selected) {
    ctx.save();
    ctx.translate(layer.x * targetWidth, layer.y * targetHeight);
    ctx.rotate(layer.rotation * Math.PI / 180);
    traceLayerShape(ctx, layer, frameWidth, frameHeight);
    ctx.strokeStyle = '#fffaf3';
    ctx.lineWidth = Math.max(2, targetWidth * 0.006);
    ctx.setLineDash([Math.max(5, targetWidth * 0.015), Math.max(4, targetWidth * 0.01)]);
    ctx.stroke();
    ctx.restore();
  }
}
