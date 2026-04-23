import { useState } from 'react';

import { AppShell } from '../components/AppShell';
import { SectionCard } from '../components/SectionCard';
import { EditorScreen } from '../features/editor/EditorScreen';
import { InstallHint } from '../features/pwa/InstallHint';
import { UploadSection } from '../features/upload/UploadSection';
import { useImageLoader } from '../hooks/useImageLoader';

export function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { image, error, isLoading } = useImageLoader(selectedFile);
  const hasImage = Boolean(image);

  return (
    <AppShell>
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-black/60 backdrop-blur">
          <span className="h-2 w-2 rounded-full bg-clay" />
          Rápida y simple
        </div>

        <div className="flex items-start gap-4">
          <img
            src="/assets/logo.png"
            alt="Logo de CuadraFoto"
            className="h-16 w-16 shrink-0 rounded-[1.35rem] border border-black/10 bg-white/85 object-cover shadow-soft sm:h-20 sm:w-20"
          />

          <div className="space-y-3">
            <h1 className="max-w-80 text-[2.4rem] font-semibold tracking-tight text-ink sm:text-5xl">
              CuadraFoto
            </h1>
            <p className="max-w-md text-sm leading-6 text-black/70">
              Convierte tus fotos en formatos tipo Instagram, ajusta el encuadre
              y descárgalas listas para publicar.
            </p>
          </div>
        </div>
      </header>

      <InstallHint />

      {isLoading ? (
        <SectionCard
          eyebrow="Carga"
          title="Preparando imagen"
          description="Estamos dejando tu foto lista para empezar a editar."
        >
          <div
            role="status"
            aria-live="polite"
            className="rounded-[1.75rem] border border-black/10 bg-mist px-4 py-5 text-sm text-black/65"
          >
            Cargando imagen...
          </div>
        </SectionCard>
      ) : null}

      {error ? (
        <SectionCard
          eyebrow="Error"
          title="No pudimos abrir la imagen"
          description="Prueba con otra imagen en formato JPG o PNG."
        >
          <div
            role="alert"
            className="rounded-[1.75rem] border border-red-200 bg-red-50 px-4 py-5 text-sm text-red-700"
          >
            {error}
          </div>
        </SectionCard>
      ) : null}

      {hasImage && image ? <EditorScreen image={image} /> : null}

      <UploadSection
        fileName={selectedFile?.name}
        isLoading={isLoading}
        onFileSelect={(file) => {
          setSelectedFile(file);
        }}
      />

      {!hasImage ? (
        <SectionCard
          eyebrow="Editor"
          title="Listo para editar"
          description="Aquí verás tu foto en formato Instagram para moverla, ajustar el fondo y descargarla."
        >
          <div className="rounded-[1.75rem] border border-dashed border-black/15 bg-white/55 px-4 py-10 text-center text-sm leading-6 text-black/55">
            Sube una imagen para empezar.
          </div>
        </SectionCard>
      ) : null}
    </AppShell>
  );
}
