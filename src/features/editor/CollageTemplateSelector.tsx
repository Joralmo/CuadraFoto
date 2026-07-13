import { SectionCard } from '../../components/SectionCard';
import type { CollageTemplateId } from '../../types/editor';

const templates: Array<{ id: CollageTemplateId; label: string; cells: string[] }> = [
  { id: 'free', label: 'Libre', cells: ['inset-1'] },
  { id: 'split', label: 'Columnas', cells: ['left-1 top-1 bottom-1 w-[47%]', 'right-1 top-1 bottom-1 w-[47%]'] },
  { id: 'sidebar', label: 'Lateral', cells: ['left-1 top-1 bottom-1 w-[62%]', 'right-1 top-1 h-[45%] w-[30%]', 'right-1 bottom-1 h-[45%] w-[30%]'] },
  { id: 'feature-grid', label: 'Destacada', cells: ['left-1 right-1 top-1 h-[45%]', 'left-1 bottom-1 h-[45%] w-[47%]', 'right-1 bottom-1 h-[45%] w-[47%]'] }
];

export function CollageTemplateSelector({ selectedId, onChange }: { selectedId: CollageTemplateId; onChange: (id: CollageTemplateId) => void }) {
  return (
    <SectionCard eyebrow="Diseño" title="Plantillas de collage" description="Empieza con una distribución y después mueve o transforma cada foto libremente.">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {templates.map((template) => (
          <button key={template.id} type="button" aria-pressed={selectedId === template.id} onClick={() => onChange(template.id)} className={`rounded-2xl border p-2 text-left transition ${selectedId === template.id ? 'border-ink bg-ink text-white' : 'border-black/10 bg-white text-ink hover:bg-mist'}`}>
            <span className={`relative block aspect-square overflow-hidden rounded-xl ${selectedId === template.id ? 'bg-white/15' : 'bg-paper'}`}>
              {template.cells.map((classes, index) => <span key={index} className={`absolute rounded-md ${classes} ${selectedId === template.id ? 'bg-white/75' : 'bg-clay/55'}`} />)}
            </span>
            <span className="mt-2 block text-xs font-semibold">{template.label}</span>
          </button>
        ))}
      </div>
    </SectionCard>
  );
}
