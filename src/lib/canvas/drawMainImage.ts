import { getContainRect } from './geometry';
import type { RenderableImageSource } from '../../types/image';

type DrawMainImageOptions = {
  ctx: CanvasRenderingContext2D;
  image: RenderableImageSource;
  imageWidth: number;
  imageHeight: number;
  targetWidth: number;
  targetHeight: number;
  scale: number;
  offsetX: number;
  offsetY: number;
};

export function drawMainImage({
  ctx,
  image,
  imageWidth,
  imageHeight,
  targetWidth,
  targetHeight,
  scale,
  offsetX,
  offsetY
}: DrawMainImageOptions) {
  const containRect = getContainRect(
    imageWidth,
    imageHeight,
    targetWidth,
    targetHeight
  );
  const scaledWidth = containRect.width * scale;
  const scaledHeight = containRect.height * scale;
  const drawX = (targetWidth - scaledWidth) / 2 + offsetX * targetWidth;
  const drawY = (targetHeight - scaledHeight) / 2 + offsetY * targetHeight;

  ctx.save();
  ctx.drawImage(image, drawX, drawY, scaledWidth, scaledHeight);
  ctx.restore();
}
