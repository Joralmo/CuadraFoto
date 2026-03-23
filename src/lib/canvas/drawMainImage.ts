import { getContainRect } from './geometry';
import type { RenderableImageSource } from '../../types/image';

type DrawMainImageOptions = {
  ctx: CanvasRenderingContext2D;
  image: RenderableImageSource;
  imageWidth: number;
  imageHeight: number;
  size: number;
  scale: number;
  offsetX: number;
  offsetY: number;
};

export function drawMainImage({
  ctx,
  image,
  imageWidth,
  imageHeight,
  size,
  scale,
  offsetX,
  offsetY
}: DrawMainImageOptions) {
  const containRect = getContainRect(imageWidth, imageHeight, size, size);
  const scaledWidth = containRect.width * scale;
  const scaledHeight = containRect.height * scale;
  const drawX = (size - scaledWidth) / 2 + offsetX;
  const drawY = (size - scaledHeight) / 2 + offsetY;

  ctx.save();
  ctx.drawImage(image, drawX, drawY, scaledWidth, scaledHeight);
  ctx.restore();
}
