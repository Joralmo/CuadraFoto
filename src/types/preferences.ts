import type { BackgroundMode } from './editor';
import type { ExportFormat } from './export';

export interface EditorPreferences {
  backgroundMode: BackgroundMode;
  blurAmount: number;
}

export interface ExportPreferences {
  format: ExportFormat;
  jpgQuality: number;
}

