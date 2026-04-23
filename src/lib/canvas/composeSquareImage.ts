import type { CanvasCompositionOptions } from '../../types/editor';
import { drawBlurBackground } from './drawBlurBackground';
import { drawColorBackground } from './drawColorBackground';
import { drawMainImage } from './drawMainImage';

function getCompositionSource(
  image: CanvasCompositionOptions['image'],
  qualityHint: NonNullable<CanvasCompositionOptions['qualityHint']>
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

export function composeExportImage({
  ctx,
  editorState,
  image,
  qualityHint = 'preview',
  targetWidth,
  targetHeight
}: CanvasCompositionOptions) {
  const compositionSource = getCompositionSource(image, qualityHint);

  ctx.clearRect(0, 0, targetWidth, targetHeight);

  if (editorState.backgroundMode === 'color') {
    drawColorBackground(
      ctx,
      targetWidth,
      targetHeight,
      editorState.backgroundColor
    );
  } else {
    drawBlurBackground({
      ctx,
      image: compositionSource.source,
      imageWidth: compositionSource.width,
      imageHeight: compositionSource.height,
      qualityHint,
      targetWidth,
      targetHeight,
      blurAmount: editorState.blurAmount
    });
  }

  drawMainImage({
    ctx,
    image: compositionSource.source,
    imageWidth: compositionSource.width,
    imageHeight: compositionSource.height,
    targetWidth,
    targetHeight,
    scale: editorState.scale,
    offsetX: editorState.offsetX,
    offsetY: editorState.offsetY
  });
}
