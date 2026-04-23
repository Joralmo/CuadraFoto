import { PaletteSuggestions } from '../palette/PaletteSuggestions';
import { SectionCard } from '../../components/SectionCard';
import type { SuggestedColor } from '../../types/colors';
import type { BackgroundMode } from '../../types/editor';
import {
  DEFAULT_BLUR,
  MAX_BLUR,
  MIN_BLUR,
  SOFT_BLUR,
  STRONG_BLUR
} from './editor.reducer';

type BackgroundControlsProps = {
  backgroundColor: string;
  backgroundMode: BackgroundMode;
  blurAmount: number;
  paletteColors: SuggestedColor[];
  paletteError?: string | null;
  paletteLoading?: boolean;
  onBackgroundColorChange: (value: string) => void;
  onBackgroundModeChange: (value: BackgroundMode) => void;
  onBlurAmountChange: (value: number) => void;
};

function modeButtonClass(isActive: boolean) {
  return [
    'min-h-14 rounded-[1.35rem] px-4 py-3 text-left text-sm font-semibold transition',
    isActive
      ? 'bg-ink text-white shadow-[0_12px_24px_rgba(23,23,23,0.16)]'
      : 'bg-mist text-black/65 hover:bg-white'
  ].join(' ');
}

export function BackgroundControls({
  backgroundColor,
  backgroundMode,
  blurAmount,
  paletteColors,
  paletteError = null,
  paletteLoading = false,
  onBackgroundColorChange,
  onBackgroundModeChange,
  onBlurAmountChange
}: BackgroundControlsProps) {
  return (
    <SectionCard
      eyebrow="Fondo"
      title="Fondo del formato"
      description="Elige un fondo difuminado o un color liso para completar tu imagen."
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2 rounded-[1.75rem] border border-black/10 bg-white/70 p-2">
          <button
            type="button"
            className={modeButtonClass(backgroundMode === 'blur')}
            aria-pressed={backgroundMode === 'blur'}
            onClick={() => {
              onBackgroundModeChange('blur');
            }}
          >
            <span className="block">Difuminado</span>
            <span className="mt-1 block text-xs font-medium opacity-75">
              Usa la misma imagen de fondo
            </span>
          </button>

          <button
            type="button"
            className={modeButtonClass(backgroundMode === 'color')}
            aria-pressed={backgroundMode === 'color'}
            onClick={() => {
              onBackgroundModeChange('color');
            }}
          >
            <span className="block">Color</span>
            <span className="mt-1 block text-xs font-medium opacity-75">
              Fondo sólido limpio
            </span>
          </button>
        </div>

        {backgroundMode === 'blur' ? (
          <div className="rounded-[1.75rem] border border-black/10 bg-mist/80 p-4">
            <label className="block space-y-3">
              <div className="flex items-center justify-between text-sm font-medium text-ink">
                <span>Intensidad</span>
                <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs text-black/65">
                  {blurAmount}px
                </span>
              </div>

              <input
                type="range"
                min={MIN_BLUR}
                max={MAX_BLUR}
                step="1"
                value={blurAmount}
                onChange={(event) => {
                  onBlurAmountChange(Number(event.target.value));
                }}
                className="touch-slider"
              />
            </label>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs text-black/55">
              <div className="rounded-2xl border border-black/10 bg-white/70 px-2 py-3">
                Suave {SOFT_BLUR}px
              </div>
              <div className="rounded-2xl border border-black/10 bg-white/70 px-2 py-3">
                Recomendado {DEFAULT_BLUR}px
              </div>
              <div className="rounded-2xl border border-black/10 bg-white/70 px-2 py-3">
                Intenso {STRONG_BLUR}px
              </div>
            </div>

            <p className="mt-3 text-xs leading-5 text-black/55">
              Solo cambia el fondo. Tu foto se mantiene nítida.
            </p>
          </div>
        ) : (
          <div className="space-y-3 rounded-[1.75rem] border border-black/10 bg-mist/80 p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm font-medium text-ink">
                <span>Colores sugeridos</span>
                <span className="text-xs text-black/50">Para esta imagen</span>
              </div>

              <PaletteSuggestions
                colors={paletteColors}
                isLoading={paletteLoading}
                selectedColor={backgroundColor}
                onSelect={onBackgroundColorChange}
              />

              {paletteError ? (
                <p className="text-xs text-red-600">{paletteError}</p>
              ) : null}
            </div>

            <label className="flex items-center gap-3 rounded-[1.5rem] border border-black/10 bg-white/70 px-4 py-3">
              <input
                type="color"
                value={backgroundColor}
                aria-label="Elegir color manual para el fondo"
                onChange={(event) => {
                  onBackgroundColorChange(event.target.value);
                }}
                className="h-12 w-12 cursor-pointer rounded-xl border-0 bg-transparent p-0"
              />

              <div className="text-sm">
                <p className="font-medium text-ink">Color de fondo</p>
                <p className="text-black/55">
                  Elegido: {backgroundColor.toUpperCase()}
                </p>
              </div>
            </label>
          </div>
        )}
      </div>
    </SectionCard>
  );
}
