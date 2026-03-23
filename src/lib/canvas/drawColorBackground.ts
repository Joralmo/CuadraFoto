export function drawColorBackground(
  ctx: CanvasRenderingContext2D,
  size: number,
  color: string
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, size, size);
  ctx.restore();
}

