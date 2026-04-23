export type ExportFormat = 'png' | 'jpg';

export type ExportQualityHint = 'preview' | 'export';

export type ExportPresetId = 'story' | 'portrait' | 'square' | 'landscape';

export interface ExportPresetOption {
  description: string;
  height: number;
  id: ExportPresetId;
  isRecommended?: boolean;
  label: string;
  ratioLabel: string;
  width: number;
}

export interface ExportSettings {
  format: ExportFormat;
  height: number;
  jpgQuality: number;
  presetId: ExportPresetId;
  width: number;
}

export interface ExportResult {
  blob: Blob;
  fileName: string;
  format: ExportFormat;
  height: number;
  mimeType: string;
  width: number;
}

export type ExportDeliveryMethod = 'download' | 'open' | 'share' | 'cancelled';
