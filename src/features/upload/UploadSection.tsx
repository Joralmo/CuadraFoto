import { useId, useRef } from 'react';

import { ActionButton } from '../../components/ActionButton';
import { SectionCard } from '../../components/SectionCard';

type UploadSectionProps = {
  fileName?: string;
  isLoading?: boolean;
  onFileSelect: (file: File) => void;
};

export function UploadSection({
  fileName,
  isLoading = false,
  onFileSelect
}: UploadSectionProps) {
  const helpId = useId();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const hasSelectedImage = Boolean(fileName);

  return (
    <SectionCard
      eyebrow="Inicio"
      title={hasSelectedImage ? 'Cambiar imagen' : 'Sube una imagen'}
      description={
        hasSelectedImage
          ? 'Puedes reemplazar la foto actual sin salir del editor.'
          : 'Empieza con una foto vertical u horizontal y conviértela en una versión cuadrada lista para publicar.'
      }
    >
      <div className="space-y-3">
        <ActionButton
          disabled={isLoading}
          size="large"
          variant={hasSelectedImage ? 'secondary' : 'primary'}
          aria-controls={inputId}
          onClick={() => {
            inputRef.current?.click();
          }}
        >
          {isLoading ? 'Cargando imagen...' : 'Elegir imagen'}
        </ActionButton>

        <input
          id={inputId}
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,.jpg,.jpeg,.png"
          aria-describedby={helpId}
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];

            if (!file) {
              return;
            }

            onFileSelect(file);
            event.currentTarget.value = '';
          }}
        />

        <p id={helpId} className="text-xs leading-5 text-black/55">
          Compatibles: JPG, JPEG y PNG.
        </p>

        <div className="rounded-2xl border border-black/10 bg-mist px-4 py-3 text-sm text-black/70">
          {fileName
            ? `Archivo seleccionado: ${fileName}`
            : 'Todavía no has seleccionado una imagen.'}
        </div>
      </div>
    </SectionCard>
  );
}
