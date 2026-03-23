import { usePwaStatus } from './usePwaStatus';

export function InstallHint() {
  const status = usePwaStatus();
  const shouldShowInstallHint = status.isIosSafari && !status.isInstalled;
  const shouldShowCard =
    shouldShowInstallHint || status.isInstalled || status.isOfflineReady || !status.isOnline;

  if (!shouldShowCard) {
    return null;
  }

  return (
    <aside className="rounded-[1.85rem] border border-black/10 bg-black px-4 py-4 text-sm text-white shadow-soft">
      <div className="flex flex-wrap gap-2">
        {status.isInstalled ? (
          <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-black">
            Instalada
          </span>
        ) : null}

        {status.isOfflineReady ? (
          <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-100">
            Disponible sin conexión
          </span>
        ) : null}

        {!status.isOnline ? (
          <span className="rounded-full bg-amber-300/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-100">
            Sin conexión
          </span>
        ) : null}
      </div>

      {shouldShowInstallHint ? (
        <>
          <p className="mt-3 font-semibold">Añadir a inicio</p>
          <p className="mt-1 leading-6 text-white/75">
            Si quieres tenerla más a mano, añádela a tu pantalla de inicio desde
            el menú Compartir.
          </p>
        </>
      ) : null}

      {status.isInstalled && status.isOnline ? (
        <p className="mt-3 leading-6 text-white/75">
          Ya la tienes instalada. Puedes abrirla directamente desde tu pantalla de inicio.
        </p>
      ) : null}

      {!status.isOnline ? (
        <p className="mt-3 leading-6 text-white/75">
          No tienes conexión, pero puedes seguir editando y descargando tus imágenes.
        </p>
      ) : null}

      {status.isOfflineReady && status.isOnline && !shouldShowInstallHint ? (
        <p className="mt-3 leading-6 text-white/75">
          La app ya está lista para volver a abrirse aunque no tengas internet.
        </p>
      ) : null}
    </aside>
  );
}
