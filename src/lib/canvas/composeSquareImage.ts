import type { SquareCompositionOptions } from '../../types/editor';
import { drawBlurBackground } from './drawBlurBackground';
import { drawColorBackground } from './drawColorBackground';
import { drawMainImage } from './drawMainImage';

function getCompositionSource(
  image: SquareCompositionOptions['image'],
  qualityHint: NonNullable<SquareCompositionOptions['qualityHint']>
) {
  if (qualityHint === 'export') {
    return {
      height: image.height,
      source: image.element,
      width: image.width
    };
  }

  return {
    height: image.previewHeight,
    source: image.previewSource,
    width: image.previewWidth
  };
}

export function composeSquareImage({
  ctx,
  editorState,
  image,
  qualityHint = 'preview',
  size
}: SquareCompositionOptions) {
  const compositionSource = getCompositionSource(image, qualityHint);

  ctx.clearRect(0, 0, size, size);

  if (editorState.backgroundMode === 'color') {
    drawColorBackground(ctx, size, editorState.backgroundColor);
  } else {
    drawBlurBackground({
      ctx,
      image: compositionSource.source,
      imageWidth: compositionSource.width,
      imageHeight: compositionSource.height,
      qualityHint,
      size,
      blurAmount: editorState.blurAmount
    });
  }

  drawMainImage({
    ctx,
    image: compositionSource.source,
    imageWidth: compositionSource.width,
    imageHeight: compositionSource.height,
    size,
    scale: editorState.scale,
    offsetX: editorState.offsetX,
    offsetY: editorState.offsetY
  });
}
