import { useEffect, useMemo, useState } from 'react';

import { usePersistentState } from './usePersistentState';
import {
  createInitialExportSettings,
  DEFAULT_JPG_QUALITY,
  getExportResolutionOptions,
  syncExportSettingsWithOptions
} from '../lib/export/exportResolutionOptions';
import {
  deliverExportedImage,
  exportSquareImage,
  shareExportedImage,
  shouldPrepareExportWindow,
  shouldUseStagedExportFlow
} from '../lib/export/exportSquareImage';
import type { EditorState } from '../types/editor';
import type {
  ExportDeliveryMethod,
  ExportFormat,
  ExportResolutionOption,
  ExportResult,
  ExportSettings
} from '../types/export';
import type { LoadedImageAsset } from '../types/image';

type ExportStatus = {
  error: string | null;
  isExporting: boolean;
  lastMessage: string | null;
  lastMethod: ExportDeliveryMethod | null;
};

const initialStatus: ExportStatus = {
  error: null,
  isExporting: false,
  lastMessage: null,
  lastMethod: null
};
const EXPORT_FORMAT_STORAGE_KEY = 'cuadrafoto:export-format';
const JPG_QUALITY_STORAGE_KEY = 'cuadrafoto:jpg-quality';

function isExportFormat(value: string): value is ExportFormat {
  return value === 'jpg' || value === 'png';
}

function getSuccessMessage(method: ExportDeliveryMethod) {
  switch (method) {
    case 'share':
      return 'La imagen se abrió en la hoja de compartir de tu dispositivo.';
    case 'open':
      return 'La imagen se abrió para que puedas guardarla o compartirla.';
    case 'download':
      return 'La imagen se descargó correctamente.';
    case 'cancelled':
      return 'La exportación se canceló antes de guardar la imagen.';
    default:
      return null;
  }
}

export function useExportController(
  image: LoadedImageAsset,
  editorState: EditorState
) {
  const [persistedFormat, setPersistedFormat] = usePersistentState<ExportFormat>(
    EXPORT_FORMAT_STORAGE_KEY,
    'jpg',
    {
      validate: isExportFormat
    }
  );
  const [persistedJpgQuality, setPersistedJpgQuality] = usePersistentState<number>(
    JPG_QUALITY_STORAGE_KEY,
    DEFAULT_JPG_QUALITY,
    {
      validate: (value) =>
        typeof value === 'number' && value >= 0.7 && value <= 1
    }
  );
  const resolutionOptions = useMemo<ExportResolutionOption[]>(
    () => getExportResolutionOptions(image),
    [image]
  );
  const [settings, setSettings] = useState<ExportSettings>(() =>
    createInitialExportSettings(image, {
      format: persistedFormat,
      jpgQuality: persistedJpgQuality
    })
  );
  const [preparedResult, setPreparedResult] = useState<ExportResult | null>(null);
  const [status, setStatus] = useState<ExportStatus>(initialStatus);

  useEffect(() => {
    setSettings(
      createInitialExportSettings(image, {
        format: persistedFormat,
        jpgQuality: persistedJpgQuality
      })
    );
    setPreparedResult(null);
    setStatus(initialStatus);
  }, [image]);

  useEffect(() => {
    setSettings((currentSettings) =>
      syncExportSettingsWithOptions(currentSettings, resolutionOptions)
    );
  }, [resolutionOptions]);

  useEffect(() => {
    setPersistedFormat(settings.format);
  }, [setPersistedFormat, settings.format]);

  useEffect(() => {
    setPersistedJpgQuality(settings.jpgQuality);
  }, [setPersistedJpgQuality, settings.jpgQuality]);

  return {
    resolutionOptions,
    preparedResult,
    settings,
    status,
    clearPreparedResult: () => {
      setPreparedResult(null);
    },
    setFormat: (format: ExportFormat) => {
      setSettings((currentSettings) => ({
        ...currentSettings,
        format
      }));
    },
    setJpgQuality: (jpgQuality: number) => {
      setSettings((currentSettings) => ({
        ...currentSettings,
        jpgQuality
      }));
    },
    setResolutionId: (resolutionId: string) => {
      setSettings((currentSettings) => {
        const matchedOption = resolutionOptions.find(
          (option) => option.id === resolutionId
        );

        if (!matchedOption) {
          return currentSettings;
        }

        return {
          ...currentSettings,
          resolutionId,
          size: matchedOption.size
        };
      });
    },
    exportImage: async () => {
      const helperWindow =
        shouldPrepareExportWindow() ? window.open('', '_blank') : null;

      setPreparedResult(null);

      if (helperWindow) {
        helperWindow.document.title = 'CuadraFoto';
        helperWindow.document.body.style.margin = '0';
        helperWindow.document.body.style.fontFamily =
          '"SF Pro Text", "Avenir Next", "Segoe UI", sans-serif';
        helperWindow.document.body.style.background = '#f4ecdf';
        helperWindow.document.body.style.color = '#171717';
        helperWindow.document.body.style.display = 'grid';
        helperWindow.document.body.style.placeItems = 'center';
        helperWindow.document.body.innerHTML =
          '<p style="padding:24px;text-align:center;font-size:15px;line-height:1.6;">Preparando exportación…</p>';
      }

      setStatus({
        error: null,
        isExporting: true,
        lastMessage: null,
        lastMethod: null
      });

      try {
        const result = await exportSquareImage({
          format: settings.format,
          image,
          editorState,
          jpgQuality: settings.jpgQuality,
          size: settings.size
        });

        if (shouldUseStagedExportFlow()) {
          setPreparedResult(result);
          setStatus({
            error: null,
            isExporting: false,
            lastMessage: 'La imagen está lista. Elige si quieres compartirla o abrirla.',
            lastMethod: null
          });
          return;
        }

        const method = await deliverExportedImage(result, {
          helperWindow
        });

        setStatus({
          error: null,
          isExporting: false,
          lastMessage: getSuccessMessage(method),
          lastMethod: method
        });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'No se pudo exportar la imagen.';

        helperWindow?.close();

        setStatus({
          error: message,
          isExporting: false,
          lastMessage: null,
          lastMethod: null
        });
      }
    },
    openPreparedImage: async () => {
      if (!preparedResult) {
        return;
      }

      setStatus({
        error: null,
        isExporting: false,
        lastMessage: null,
        lastMethod: null
      });

      try {
        const method = await deliverExportedImage(preparedResult, {
          openInSameWindow: shouldUseStagedExportFlow(),
          preferShare: false
        });

        setPreparedResult(null);
        setStatus({
          error: null,
          isExporting: false,
          lastMessage: getSuccessMessage(method),
          lastMethod: method
        });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'No se pudo abrir la imagen.';

        setStatus({
          error: message,
          isExporting: false,
          lastMessage: null,
          lastMethod: null
        });
      }
    },
    sharePreparedImage: async () => {
      if (!preparedResult) {
        return;
      }

      setStatus({
        error: null,
        isExporting: false,
        lastMessage: null,
        lastMethod: null
      });

      try {
        const method = await shareExportedImage(preparedResult);

        if (!method) {
          throw new Error('No se pudo abrir la opción de compartir en este dispositivo.');
        }

        if (method !== 'cancelled') {
          setPreparedResult(null);
        }

        setStatus({
          error: null,
          isExporting: false,
          lastMessage: getSuccessMessage(method),
          lastMethod: method
        });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'No se pudo compartir la imagen.';

        setStatus({
          error: message,
          isExporting: false,
          lastMessage: null,
          lastMethod: null
        });
      }
    }
  };
}
