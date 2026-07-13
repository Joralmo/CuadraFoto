import type { CanvasCompositionOptions } from '../../types/editor';
import { drawBlurBackground } from './drawBlurBackground';
import { drawColorBackground } from './drawColorBackground';
import { drawCollageLayer } from './drawCollageLayer';

function getCompositionSource(
  image: CanvasCompositionOptions['images'][number],
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
  images,
  qualityHint = 'preview',
  targetWidth,
  targetHeight
}: CanvasCompositionOptions) {
  const backgroundImage = images[0];
  if (!backgroundImage) return;
  const compositionSource = getCompositionSource(backgroundImage, qualityHint);

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

  editorState.layers.forEach((layer) => {
    const asset = images[layer.sourceIndex];
    if (!asset) return;
    const source = getCompositionSource(asset, qualityHint);
    drawCollageLayer({
      ctx,
      layer,
      image: source.source,
      imageWidth: source.width,
      imageHeight: source.height,
      targetWidth,
      targetHeight,
      selected: qualityHint === 'preview' && layer.id === editorState.selectedLayerId
    });
  });
}
