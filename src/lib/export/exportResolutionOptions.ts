import type { ExportResolutionOption, ExportSettings } from '../../types/export';
import type { LoadedImageAsset } from '../../types/image';
import type { ExportPreferences } from '../../types/preferences';

export const DEFAULT_EXPORT_SIZE = 1080;
export const DEFAULT_JPG_QUALITY = 0.92;
const MAX_SAFE_EXPORT_SIZE = 2160;

function roundResolution(value: number) {
  if (value <= 1440) {
    return Math.round(value / 10) * 10;
  }

  return Math.round(value / 20) * 20;
}

export function getExportResolutionOptions(
  image: LoadedImageAsset
): ExportResolutionOption[] {
  const options: ExportResolutionOption[] = [
    {
      id: 'standard',
      label: 'Estándar',
      description: '1080 x 1080. Ideal para publicar y el valor por defecto.',
      size: DEFAULT_EXPORT_SIZE,
      isRecommended: true
    }
  ];
  const originalMaxSide = Math.max(image.width, image.height);
  const maxUsefulSize = roundResolution(
    Math.min(MAX_SAFE_EXPORT_SIZE, originalMaxSide)
  );

  if (maxUsefulSize > DEFAULT_EXPORT_SIZE) {
    options.push({
      id: 'high',
      label: 'Alta',
      description: `${maxUsefulSize} x ${maxUsefulSize}. Usa más resolución si la imagen original lo permite.`,
      size: maxUsefulSize
    });
  }

  return options;
}

export function createInitialExportSettings(
  image: LoadedImageAsset,
  preferences: Partial<ExportPreferences> = {}
): ExportSettings {
  const [defaultOption] = getExportResolutionOptions(image);

  return {
    format: preferences.format ?? 'jpg',
    jpgQuality: preferences.jpgQuality ?? DEFAULT_JPG_QUALITY,
    resolutionId: defaultOption.id,
    size: defaultOption.size
  };
}

export function syncExportSettingsWithOptions(
  settings: ExportSettings,
  options: ExportResolutionOption[]
): ExportSettings {
  const matchedOption = options.find((option) => option.id === settings.resolutionId);

  if (matchedOption) {
    return {
      ...settings,
      size: matchedOption.size
    };
  }

  const [defaultOption] = options;

  return {
    ...settings,
    resolutionId: defaultOption.id,
    size: defaultOption.size
  };
}
