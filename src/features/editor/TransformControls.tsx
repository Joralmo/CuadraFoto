import { ActionButton } from '../../components/ActionButton';
import { SectionCard } from '../../components/SectionCard';
import { MAX_SCALE, MIN_SCALE } from './editor.reducer';

type TransformControlsProps = {
  scale: number;
  onReset: () => void;
  onScaleChange: (value: number) => void;
};

export function TransformControls({
  scale,
  onReset,
  onScaleChange
}: TransformControlsProps) {
  const quickScaleOptions = [1, 1.5, 2];

  return (
    <SectionCard
      eyebrow="Transformación"
      title="Encuadre"
      description="Ajusta el tamaño de la foto y colócala como prefieras."
    >
      <div className="space-y-4">
        <div className="rounded-[1.75rem] border border-black/10 bg-mist/80 p-4">
          <label className="block space-y-3">
            <div className="flex items-center justify-between text-sm font-medium text-ink">
              <span>Zoom</span>
              <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs text-black/65">
                {scale.toFixed(2)}x
              </span>
            </div>

            <input
              type="range"
              min={MIN_SCALE}
              max={MAX_SCALE}
              step="0.01"
              value={scale}
              onChange={(event) => {
                onScaleChange(Number(event.target.value));
              }}
              className="touch-slider"
            />
          </label>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {quickScaleOptions.map((option) => {
            const isActive = Math.abs(scale - option) < 0.05;

            return (
              <button
                key={option}
                type="button"
                aria-pressed={isActive}
                className={`min-h-12 rounded-2xl border px-3 text-sm font-semibold transition ${
                  isActive
                    ? 'border-ink bg-ink text-white'
                    : 'border-black/10 bg-white text-black/70 hover:bg-mist'
                }`}
                onClick={() => {
                  onScaleChange(option);
                }}
              >
                {option.toFixed(option % 1 === 0 ? 0 : 1)}x
              </button>
            );
          })}
        </div>

        <ActionButton
          size="large"
          variant="secondary"
          onClick={onReset}
        >
          Centrar imagen
        </ActionButton>
      </div>
    </SectionCard>
  );
}
