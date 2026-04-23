import { useEffect, useReducer } from 'react';

import { SectionCard } from '../../components/SectionCard';
import { usePersistentState } from '../../hooks/usePersistentState';
import { ExportPanel } from '../export/ExportPanel';
import { useExportController } from '../../hooks/useExportController';
import { useSuggestedPalette } from '../../hooks/useSuggestedPalette';
import type { LoadedImageAsset } from '../../types/image';
import { BackgroundControls } from './BackgroundControls';
import {
  createInitialEditorState,
  DEFAULT_BLUR,
  editorReducer
} from './editor.reducer';
import { FormatPresetSelector } from './FormatPresetSelector';
import { PreviewCanvas } from './PreviewCanvas';
import { TransformControls } from './TransformControls';
import type { BackgroundMode } from '../../types/editor';
import type { EditorPreferences } from '../../types/preferences';

type EditorScreenProps = {
  image: LoadedImageAsset;
};

const BACKGROUND_MODE_STORAGE_KEY = 'cuadrafoto:background-mode';
const BLUR_AMOUNT_STORAGE_KEY = 'cuadrafoto:blur-amount';

function isBackgroundMode(value: string): value is BackgroundMode {
  return value === 'blur' || value === 'color';
}

function formatFileSize(fileSize: number) {
  if (fileSize < 1024 * 1024) {
    return `${Math.max(1, Math.round(fileSize / 1024))} KB`;
  }

  return `${(fileSize / (1024 * 1024)).toFixed(1)} MB`;
}

export function EditorScreen({ image }: EditorScreenProps) {
  const [persistedBackgroundMode, setPersistedBackgroundMode] =
    usePersistentState<BackgroundMode>(
      BACKGROUND_MODE_STORAGE_KEY,
      'blur',
      {
        validate: isBackgroundMode
      }
    );
  const [persistedBlurAmount, setPersistedBlurAmount] = usePersistentState<number>(
    BLUR_AMOUNT_STORAGE_KEY,
    DEFAULT_BLUR,
    {
      validate: (value) =>
        typeof value === 'number' && value >= 0 && value <= 36
    }
  );
  const persistedEditorPreferences: Partial<EditorPreferences> = {
    backgroundMode: persistedBackgroundMode,
    blurAmount: persistedBlurAmount
  };
  const [editorState, dispatch] = useReducer(
    editorReducer,
    persistedEditorPreferences,
    createInitialEditorState
  );
  const {
    colors: paletteColors,
    error: paletteError,
    isLoading: isPaletteLoading
  } = useSuggestedPalette(image);
  const exportController = useExportController(image, editorState);
  const selectedPreset = exportController.selectedPreset;

  useEffect(() => {
    dispatch({
      type: 'reset-all',
      preferences: persistedEditorPreferences
    });
  }, [image]);

  useEffect(() => {
    if (paletteColors.length === 0) {
      return;
    }

    dispatch({
      type: 'set-background-color',
      value: paletteColors[0].hex
    });
  }, [paletteColors, image]);

  useEffect(() => {
    setPersistedBackgroundMode(editorState.backgroundMode);
  }, [editorState.backgroundMode, setPersistedBackgroundMode]);

  useEffect(() => {
    setPersistedBlurAmount(editorState.blurAmount);
  }, [editorState.blurAmount, setPersistedBlurAmount]);

  return (
    <div className="space-y-6">
      <SectionCard
        className="overflow-hidden p-0"
        eyebrow="Editor"
        title={`Vista ${selectedPreset.ratioLabel}`}
        description="Elige el tamaño tipo Instagram, mueve la foto y comprueba cómo quedará antes de descargarla."
        bodyClassName="space-y-0"
      >
        <div className="space-y-4 px-4 pb-4 sm:px-5 sm:pb-5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-black/55">
            <span className="rounded-full border border-black/10 bg-mist px-3 py-1">
              {image.fileName}
            </span>
            <span className="rounded-full border border-black/10 bg-mist px-3 py-1">
              {image.width} x {image.height}
            </span>
            <span className="rounded-full border border-black/10 bg-mist px-3 py-1">
              {formatFileSize(image.fileSize)}
            </span>
            <span className="rounded-full border border-black/10 bg-mist px-3 py-1">
              {selectedPreset.label} · {selectedPreset.width} x {selectedPreset.height}
            </span>
          </div>

          <FormatPresetSelector
            options={exportController.presetOptions}
            selectedId={exportController.settings.presetId}
            onChange={exportController.setPresetId}
          />

          <PreviewCanvas
            editorState={editorState}
            image={image}
            preset={selectedPreset}
            onPan={(deltaX, deltaY) => {
              dispatch({
                type: 'pan',
                deltaX,
                deltaY
              });
            }}
            onScaleChange={(value) => {
              dispatch({ type: 'set-scale', value });
            }}
          />
        </div>
      </SectionCard>

      <TransformControls
        scale={editorState.scale}
        onReset={() => {
          dispatch({ type: 'reset-transform' });
        }}
        onScaleChange={(value) => {
          dispatch({ type: 'set-scale', value });
        }}
      />

      <BackgroundControls
        backgroundColor={editorState.backgroundColor}
        backgroundMode={editorState.backgroundMode}
        blurAmount={editorState.blurAmount}
        paletteColors={paletteColors}
        paletteError={paletteError}
        paletteLoading={isPaletteLoading}
        onBackgroundColorChange={(value) => {
          dispatch({ type: 'set-background-color', value });
        }}
        onBackgroundModeChange={(value) => {
          dispatch({ type: 'set-background-mode', value });
        }}
        onBlurAmountChange={(value) => {
          dispatch({ type: 'set-blur-amount', value });
        }}
      />

      <ExportPanel
        error={exportController.status.error}
        isExporting={exportController.status.isExporting}
        lastMessage={exportController.status.lastMessage}
        preparedImageName={exportController.preparedResult?.fileName ?? null}
        selectedPreset={selectedPreset}
        settings={exportController.settings}
        onClearPrepared={exportController.clearPreparedResult}
        onExport={() => {
          void exportController.exportImage();
        }}
        onFormatChange={exportController.setFormat}
        onJpgQualityChange={exportController.setJpgQuality}
        onOpenPrepared={() => {
          void exportController.openPreparedImage();
        }}
        onSharePrepared={() => {
          void exportController.sharePreparedImage();
        }}
      />
    </div>
  );
}
