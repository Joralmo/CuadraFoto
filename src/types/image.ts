export type RenderableImageSource = HTMLCanvasElement | HTMLImageElement;

export interface LoadedImageAsset {
  element: HTMLImageElement;
  fileName: string;
  fileSize: number;
  isPreviewOptimized: boolean;
  mimeType: string;
  previewHeight: number;
  previewSource: RenderableImageSource;
  previewWidth: number;
  width: number;
  height: number;
}
