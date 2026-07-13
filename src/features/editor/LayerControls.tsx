import { useRef } from 'react';
import { ActionButton } from '../../components/ActionButton';
import { SectionCard } from '../../components/SectionCard';
import type { CollageLayer, CollageShape, PhotoFilter } from '../../types/editor';
import type { LoadedImageAsset } from '../../types/image';
import { MAX_SCALE, MIN_SCALE } from './editor.reducer';

const shapes: Array<{ id: CollageShape; label: string; icon: string }> = [
  { id: 'square', label: 'Cuadrada', icon: '□' }, { id: 'rounded', label: 'Redondeada', icon: '▢' },
  { id: 'circle', label: 'Círculo', icon: '○' }, { id: 'oval', label: 'Óvalo', icon: '⬭' },
  { id: 'heart', label: 'Corazón', icon: '♡' }, { id: 'star', label: 'Estrella', icon: '☆' }
];
const filters: Array<{ id: PhotoFilter; label: string }> = [
  { id: 'none', label: 'Original' }, { id: 'vivid', label: 'Vivo' }, { id: 'mono', label: 'B/N' },
  { id: 'warm', label: 'Cálido' }, { id: 'cool', label: 'Frío' }
];

type Props = {
  layer: CollageLayer;
  images: LoadedImageAsset[];
  onAddFiles: (files: File[]) => void;
  onSelect: (id: string) => void;
  onScale: (value: number) => void;
  onSize: (value: number) => void;
  onRotation: (value: number) => void;
  onOpacity: (value: number) => void;
  onShape: (value: CollageShape) => void;
  onFilter: (value: PhotoFilter) => void;
  onForward: () => void;
  onReset: () => void;
};

export function LayerControls({ layer, images, onAddFiles, onSelect, onScale, onSize, onRotation, onOpacity, onShape, onFilter, onForward, onReset }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <SectionCard eyebrow="Capas" title="Edita cada foto" description="Selecciona una foto del collage para cambiar su forma, tamaño, efecto y posición.">
      <div className="space-y-5">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => {
            const id = `photo-${index}`;
            return <button key={id} type="button" onClick={() => onSelect(id)} aria-pressed={layer.id === id} className={`shrink-0 rounded-2xl border p-1.5 ${layer.id === id ? 'border-ink bg-ink' : 'border-black/10 bg-white'}`}><img src={image.element.src} alt={`Seleccionar ${image.fileName}`} className="h-14 w-14 rounded-xl object-cover" /></button>;
          })}
          <button type="button" onClick={() => inputRef.current?.click()} className="h-[70px] w-[70px] shrink-0 rounded-2xl border border-dashed border-black/25 bg-white text-2xl text-clay" aria-label="Añadir fotos">＋</button>
          <input ref={inputRef} className="sr-only" type="file" accept="image/jpeg,image/png,.jpg,.jpeg,.png" multiple onChange={(event) => { const files = Array.from(event.target.files ?? []); if (files.length) onAddFiles(files); event.currentTarget.value = ''; }} />
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold">Forma</p>
          <div className="grid grid-cols-3 gap-2">
            {shapes.map((shape) => <button key={shape.id} type="button" aria-pressed={layer.shape === shape.id} onClick={() => onShape(shape.id)} className={`min-h-14 rounded-2xl border px-2 text-xs font-semibold ${layer.shape === shape.id ? 'border-ink bg-ink text-white' : 'border-black/10 bg-white'}`}><span className="mr-1 text-xl" aria-hidden="true">{shape.icon}</span>{shape.label}</button>)}
          </div>
        </div>

        <div className="grid gap-4 rounded-[1.75rem] border border-black/10 bg-mist/80 p-4 sm:grid-cols-2">
          <Slider label="Tamaño" value={layer.width} min={0.15} max={1.4} step={0.01} formatted={`${Math.round(layer.width * 100)}%`} onChange={onSize} />
          <Slider label="Zoom de foto" value={layer.scale} min={MIN_SCALE} max={MAX_SCALE} step={0.01} formatted={`${layer.scale.toFixed(2)}x`} onChange={onScale} />
          <Slider label="Rotación" value={layer.rotation} min={-180} max={180} step={1} formatted={`${Math.round(layer.rotation)}°`} onChange={onRotation} />
          <Slider label="Opacidad" value={layer.opacity} min={0.1} max={1} step={0.01} formatted={`${Math.round(layer.opacity * 100)}%`} onChange={onOpacity} />
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold">Efecto</p>
          <div className="grid grid-cols-5 gap-2">{filters.map((filter) => <button key={filter.id} type="button" aria-pressed={layer.filter === filter.id} onClick={() => onFilter(filter.id)} className={`min-h-12 rounded-xl border px-1 text-[11px] font-semibold ${layer.filter === filter.id ? 'border-clay bg-clay text-white' : 'border-black/10 bg-white'}`}>{filter.label}</button>)}</div>
        </div>

        <div className="grid grid-cols-2 gap-2"><ActionButton variant="secondary" onClick={onForward}>Subir capa</ActionButton><ActionButton variant="secondary" onClick={onReset}>Centrar</ActionButton></div>
      </div>
    </SectionCard>
  );
}

function Slider({ label, value, min, max, step, formatted, onChange }: { label: string; value: number; min: number; max: number; step: number; formatted: string; onChange: (value: number) => void }) {
  return <label className="block space-y-2"><span className="flex justify-between text-xs font-medium"><span>{label}</span><span>{formatted}</span></span><input className="touch-slider" type="range" value={value} min={min} max={max} step={step} onChange={(event) => onChange(Number(event.target.value))} /></label>;
}
