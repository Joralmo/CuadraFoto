export type ExportFormat = 'png' | 'jpg';

export type ExportQualityHint = 'preview' | 'export';

export interface ExportResolutionOption {
  description: string;
  id: string;
  isRecommended?: boolean;
  label: string;
  size: number;
}

export interface ExportSettings {
  format: ExportFormat;
  jpgQuality: number;
  resolutionId: string;
  size: number;
}

export interface ExportResult {
  blob: Blob;
  fileName: string;
  format: ExportFormat;
  mimeType: string;
  size: number;
}

export type ExportDeliveryMethod = 'download' | 'open' | 'share' | 'cancelled';

