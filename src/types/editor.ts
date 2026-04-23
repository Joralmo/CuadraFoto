import type { LoadedImageAsset } from './image';
import type { ExportQualityHint } from './export';
import type { EditorPreferences } from './preferences';

export type BackgroundMode = 'blur' | 'color';

export interface EditorState {
  backgroundMode: BackgroundMode;
  backgroundColor: string;
  blurAmount: number;
  scale: number;
  offsetX: number;
  offsetY: number;
}

export type EditorAction =
  | { type: 'reset-all'; preferences?: Partial<EditorPreferences> }
  | { type: 'reset-transform' }
  | { type: 'pan'; deltaX: number; deltaY: number }
  | { type: 'set-scale'; value: number }
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
  image: LoadedImageAsset;
  editorState: EditorState;
  qualityHint?: ExportQualityHint;
  targetHeight: number;
  targetWidth: number;
}
