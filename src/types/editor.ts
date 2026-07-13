import type { LoadedImageAsset } from './image';
import type { ExportQualityHint } from './export';
import type { EditorPreferences } from './preferences';

export type BackgroundMode = 'blur' | 'color';
export type CollageShape = 'square' | 'rounded' | 'circle' | 'oval' | 'heart' | 'star';
export type PhotoFilter = 'none' | 'vivid' | 'mono' | 'warm' | 'cool';
export type CollageTemplateId = 'free' | 'split' | 'sidebar' | 'feature-grid';

export interface CollageLayer {
  id: string;
  sourceIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
  rotation: number;
  shape: CollageShape;
  borderRadius: number;
  opacity: number;
  filter: PhotoFilter;
}

export interface EditorState {
  backgroundMode: BackgroundMode;
  backgroundColor: string;
  blurAmount: number;
  layers: CollageLayer[];
  selectedLayerId: string | null;
  templateId: CollageTemplateId;
}

export type EditorAction =
  | { type: 'reset-all'; preferences?: Partial<EditorPreferences> }
  | { type: 'sync-images'; count: number }
  | { type: 'select-layer'; id: string }
  | { type: 'apply-template'; value: CollageTemplateId }
  | { type: 'reset-transform' }
  | { type: 'pan'; deltaX: number; deltaY: number }
  | { type: 'set-scale'; value: number }
  | { type: 'set-layer-size'; value: number }
  | { type: 'set-layer-rotation'; value: number }
  | { type: 'set-layer-opacity'; value: number }
  | { type: 'set-layer-shape'; value: CollageShape }
  | { type: 'set-layer-filter'; value: PhotoFilter }
  | { type: 'bring-layer-forward' }
  | { type: 'set-background-mode'; value: BackgroundMode }
  | { type: 'set-background-color'; value: string }
  | { type: 'set-blur-amount'; value: number };

export interface CanvasDrawRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CanvasCompositionOptions {
  ctx: CanvasRenderingContext2D;
  images: LoadedImageAsset[];
  editorState: EditorState;
  qualityHint?: ExportQualityHint;
  targetHeight: number;
  targetWidth: number;
}
