import { isLightColor } from '../../lib/colors/colorMath';
import type { SuggestedColor } from '../../types/colors';

type PaletteSuggestionsProps = {
  colors: SuggestedColor[];
  isLoading?: boolean;
  selectedColor: string;
  onSelect: (value: string) => void;
};

function chipLabelColor(hex: string) {
  return isLightColor(hex) ? 'text-ink' : 'text-white';
}

export function PaletteSuggestions({
  colors,
  isLoading = false,
  selectedColor,
  onSelect
}: PaletteSuggestionsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="h-[4.5rem] animate-pulse rounded-2xl border border-black/10 bg-white/70"
          />
        ))}
      </div>
    );
  }

  if (colors.length === 0) {
    return (
      <div className="rounded-2xl border border-black/10 bg-mist px-4 py-3 text-sm text-black/55">
        No encontramos colores claros para sugerirte. Puedes elegir uno manualmente.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {colors.map((color) => {
        const isSelected =
          color.hex.toLowerCase() === selectedColor.toLowerCase();

        return (
          <button
            key={color.hex}
            type="button"
            className={[
              'flex min-h-[4.5rem] flex-col justify-between rounded-2xl border p-3 text-left transition active:scale-[0.99]',
              isSelected
                ? 'border-ink ring-2 ring-ink/20'
                : 'border-black/10'
            ].join(' ')}
            style={{ backgroundColor: color.hex }}
            onClick={() => {
              onSelect(color.hex);
            }}
            aria-pressed={isSelected}
            aria-label={`Usar ${color.hex} como color de fondo`}
          >
            <span
              className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${chipLabelColor(
                color.hex
              )}`}
            >
              {isSelected ? 'Elegido' : 'Sugerido'}
            </span>
            <span className={`text-xs font-medium ${chipLabelColor(color.hex)}`}>
              {color.hex.toUpperCase()}
            </span>
          </button>
        );
      })}
    </div>
  );
}
