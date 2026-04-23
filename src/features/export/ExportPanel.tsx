import { ActionButton } from '../../components/ActionButton';
import { SectionCard } from '../../components/SectionCard';
import type {
  ExportFormat,
  ExportPresetOption,
  ExportSettings
} from '../../types/export';

type ExportPanelProps = {
  error: string | null;
  isExporting: boolean;
  lastMessage: string | null;
  preparedImageName?: string | null;
  selectedPreset: ExportPresetOption;
  settings: ExportSettings;
  onClearPrepared: () => void;
  onExport: () => void;
  onFormatChange: (format: ExportFormat) => void;
  onJpgQualityChange: (value: number) => void;
  onOpenPrepared: () => void;
  onSharePrepared: () => void;
};

function optionButtonClass(isActive: boolean) {
  return [
    'min-h-16 rounded-[1.35rem] border px-4 py-3 text-left transition active:scale-[0.99]',
    isActive
      ? 'border-ink bg-ink text-white ring-2 ring-ink/15 shadow-[0_14px_28px_rgba(23,23,23,0.14)]'
      : 'border-black/10 bg-mist text-black/70 hover:bg-white'
  ].join(' ');
}

export function ExportPanel({
  error,
  isExporting,
  lastMessage,
  preparedImageName = null,
  selectedPreset,
  settings,
  onClearPrepared,
  onExport,
  onFormatChange,
  onJpgQualityChange,
  onOpenPrepared,
  onSharePrepared
}: ExportPanelProps) {
  return (
    <SectionCard
      className="border-clay/20 bg-[linear-gradient(180deg,rgba(255,250,243,0.98),rgba(244,236,223,0.98))]"
      eyebrow="Exportación"
      title="Descargar imagen final"
      description="Elige el formato que prefieras y guarda tu imagen en un toque."
    >
      <div className="space-y-5">
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-2xl border border-black/10 bg-white/80 px-2 py-3 text-black/60">
            Formato
            <div className="mt-1 font-semibold text-ink">
              {settings.format.toUpperCase()}
            </div>
          </div>
          <div className="rounded-2xl border border-black/10 bg-white/80 px-2 py-3 text-black/60">
            Lienzo
            <div className="mt-1 font-semibold text-ink">
              {selectedPreset.ratioLabel}
            </div>
          </div>
          <div className="rounded-2xl border border-black/10 bg-white/80 px-2 py-3 text-black/60">
            Calidad
            <div className="mt-1 font-semibold text-ink">
              {settings.format === 'jpg'
                ? `${Math.round(settings.jpgQuality * 100)}%`
                : 'Máxima'}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm font-medium text-ink">
            <span>Formato de archivo</span>
            <span className="text-xs text-black/50">PNG o JPG</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className={optionButtonClass(settings.format === 'jpg')}
              aria-pressed={settings.format === 'jpg'}
              onClick={() => {
                onFormatChange('jpg');
              }}
            >
              <p className="text-sm font-semibold">JPG</p>
              <p className="mt-1 text-xs opacity-80">Más liviano y recomendado</p>
            </button>

            <button
              type="button"
              className={optionButtonClass(settings.format === 'png')}
              aria-pressed={settings.format === 'png'}
              onClick={() => {
                onFormatChange('png');
              }}
            >
              <p className="text-sm font-semibold">PNG</p>
              <p className="mt-1 text-xs opacity-80">Sin pérdida, archivo más pesado</p>
            </button>
          </div>
        </div>

        <div className="rounded-[1.6rem] border border-black/10 bg-mist/70 px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-ink">
                {selectedPreset.label}
              </p>
              <p className="mt-1 text-xs leading-5 text-black/55">
                {selectedPreset.description}
              </p>
            </div>
            <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/40">
                Ratio
              </p>
              <p className="mt-1 text-lg font-semibold text-ink">
                {selectedPreset.ratioLabel}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-center text-xs">
            <div className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-black/60">
              Ancho
              <div className="mt-1 font-semibold text-ink">{settings.width}px</div>
            </div>
            <div className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-black/60">
              Alto
              <div className="mt-1 font-semibold text-ink">{settings.height}px</div>
            </div>
          </div>
        </div>

        {settings.format === 'jpg' ? (
          <label className="block space-y-2">
            <div className="flex items-center justify-between text-sm font-medium text-ink">
              <span>Calidad JPG</span>
              <span>{Math.round(settings.jpgQuality * 100)}%</span>
            </div>

            <input
              type="range"
              min="0.7"
              max="1"
              step="0.01"
              value={settings.jpgQuality}
              onChange={(event) => {
                onJpgQualityChange(Number(event.target.value));
              }}
              className="touch-slider"
            />

            <p className="text-xs leading-5 text-black/55">
              El valor por defecto es 92%, un buen equilibrio entre peso y calidad.
            </p>
          </label>
        ) : null}

        <div className="rounded-[1.5rem] border border-black/10 bg-mist px-4 py-3 text-xs leading-5 text-black/55">
          Si la descarga no empieza al instante, abriremos la imagen para que puedas guardarla.
        </div>

        {preparedImageName ? (
          <div className="space-y-3 rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-4 py-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-emerald-900">
                Tu imagen ya está lista
              </p>
              <p className="text-xs leading-5 text-emerald-900/75">
                Elige si quieres compartirla o abrirla para guardarla.
              </p>
              <p className="text-xs leading-5 text-emerald-900/60">
                {preparedImageName}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <ActionButton size="default" onClick={onSharePrepared}>
                Compartir
              </ActionButton>
              <ActionButton size="default" variant="secondary" onClick={onOpenPrepared}>
                Abrir imagen
              </ActionButton>
            </div>

            <button
              type="button"
              className="w-full text-center text-xs font-medium text-emerald-900/75"
              onClick={onClearPrepared}
            >
              Cerrar
            </button>
          </div>
        ) : null}

        {error ? (
          <div
            role="alert"
            className="rounded-[1.5rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        ) : null}

        {lastMessage ? (
          <div
            role="status"
            aria-live="polite"
            className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
          >
            {lastMessage}
          </div>
        ) : null}

        <ActionButton
          className="shadow-[0_18px_36px_rgba(23,23,23,0.18)]"
          disabled={isExporting}
          size="large"
          onClick={onExport}
        >
          {isExporting
            ? 'Preparando imagen...'
            : `Descargar ${settings.width} x ${settings.height}`}
        </ActionButton>
      </div>
    </SectionCard>
  );
}
