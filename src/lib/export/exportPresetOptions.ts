import type {
  ExportPresetId,
  ExportPresetOption,
  ExportSettings
} from '../../types/export';
import type { ExportPreferences } from '../../types/preferences';

export const DEFAULT_JPG_QUALITY = 0.92;
export const DEFAULT_EXPORT_PRESET_ID: ExportPresetId = 'square';

const EXPORT_PRESET_OPTIONS: ExportPresetOption[] = [
  {
    id: 'story',
    label: 'Historias',
    ratioLabel: '9:16',
    width: 1080,
    height: 1920,
    description: '1080 x 1920. Ideal para historias y piezas verticales.'
  },
  {
    id: 'portrait',
    label: 'Vertical',
    ratioLabel: '4:5',
    width: 1080,
    height: 1350,
    description: '1080 x 1350. El formato recomendado para feed vertical.'
  },
  {
    id: 'square',
    label: 'Cuadrado',
    ratioLabel: '1:1',
    width: 1080,
    height: 1080,
    description: '1080 x 1080. Mantiene el formato clásico de la app.',
    isRecommended: true
  },
  {
    id: 'landscape',
    label: 'Horizontal',
    ratioLabel: '1.91:1',
    width: 1080,
    height: 566,
    description: '1080 x 566. Útil para publicaciones horizontales tipo Instagram.'
  }
];

export function getExportPresetOptions() {
  return EXPORT_PRESET_OPTIONS;
}

export function getExportPresetById(id: ExportPresetId | string) {
  return (
    EXPORT_PRESET_OPTIONS.find((option) => option.id === id) ??
    EXPORT_PRESET_OPTIONS.find((option) => option.id === DEFAULT_EXPORT_PRESET_ID)!
  );
}

export function createInitialExportSettings(
  preferences: Partial<ExportPreferences> = {}
): ExportSettings {
  const preset = getExportPresetById(
    preferences.presetId ?? DEFAULT_EXPORT_PRESET_ID
  );

  return {
    format: preferences.format ?? 'jpg',
    jpgQuality: preferences.jpgQuality ?? DEFAULT_JPG_QUALITY,
    presetId: preset.id,
    width: preset.width,
    height: preset.height
  };
}
