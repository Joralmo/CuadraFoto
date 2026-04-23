import type { ExportPresetId, ExportPresetOption } from '../../types/export';

type FormatPresetSelectorProps = {
  onChange: (presetId: ExportPresetId) => void;
  options: ExportPresetOption[];
  selectedId: ExportPresetId;
};

const PRESET_ACCENTS: Record<ExportPresetId, string> = {
  story:
    'border-fuchsia-200/80 bg-[linear-gradient(180deg,rgba(250,232,255,0.94),rgba(240,215,255,0.88))]',
  portrait:
    'border-sky-200/80 bg-[linear-gradient(180deg,rgba(232,244,255,0.94),rgba(213,233,255,0.88))]',
  square:
    'border-emerald-200/80 bg-[linear-gradient(180deg,rgba(234,249,239,0.94),rgba(214,241,224,0.88))]',
  landscape:
    'border-amber-200/80 bg-[linear-gradient(180deg,rgba(255,244,228,0.94),rgba(255,231,197,0.88))]'
};

export function FormatPresetSelector({
  onChange,
  options,
  selectedId
}: FormatPresetSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm font-medium text-ink">
        <span>Formato Instagram</span>
        <span className="text-xs text-black/50">Con el mismo relleno del fondo</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {options.map((option) => {
          const isActive = option.id === selectedId;

          return (
            <button
              key={option.id}
              type="button"
              className={[
                'min-h-36 rounded-[1.6rem] border px-4 py-4 text-left transition active:scale-[0.99]',
                PRESET_ACCENTS[option.id],
                isActive
                  ? 'ring-2 ring-ink/15 shadow-[0_16px_36px_rgba(23,23,23,0.14)]'
                  : 'hover:-translate-y-0.5 hover:shadow-soft'
              ].join(' ')}
              aria-pressed={isActive}
              onClick={() => {
                onChange(option.id);
              }}
            >
              <div className="flex h-full flex-col justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-ink">
                    {option.label}
                  </p>
                  <p className="text-xs leading-5 text-black/60">
                    {option.width} x {option.height}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-[2rem] font-semibold leading-none tracking-tight text-ink">
                    {option.ratioLabel}
                  </p>
                  <p className="text-xs leading-5 text-black/60">
                    {option.isRecommended ? 'Formato por defecto.' : option.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
