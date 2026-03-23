import { useEffect, useState } from 'react';

type PwaStatus = {
  isInstalled: boolean;
  isIosSafari: boolean;
  isOfflineReady: boolean;
  isOnline: boolean;
  supportsServiceWorker: boolean;
};

function detectIosSafari() {
  const userAgent = navigator.userAgent.toLowerCase();
  const isIos = /iphone|ipad|ipod/.test(userAgent);
  const isSafari =
    /safari/.test(userAgent) &&
    !/crios|fxios|edgios|opr\//.test(userAgent);

  return isIos && isSafari;
}

function detectInstalledMode() {
  const navigatorWithStandalone = navigator as Navigator & {
    standalone?: boolean;
  };

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    navigatorWithStandalone.standalone === true
  );
}

export function usePwaStatus(): PwaStatus {
  const [status, setStatus] = useState<PwaStatus>(() => ({
    isInstalled:
      typeof window !== 'undefined' &&
      typeof navigator !== 'undefined' &&
      detectInstalledMode(),
    isIosSafari:
      typeof navigator !== 'undefined' ? detectIosSafari() : false,
    isOfflineReady:
      typeof navigator !== 'undefined' && 'serviceWorker' in navigator
        ? Boolean(navigator.serviceWorker.controller)
        : false,
    isOnline:
      typeof navigator !== 'undefined' ? navigator.onLine : true,
    supportsServiceWorker:
      typeof navigator !== 'undefined' && 'serviceWorker' in navigator
  }));

  useEffect(() => {
    const setOnline = () => {
      setStatus((currentStatus) => ({
        ...currentStatus,
        isOnline: navigator.onLine
      }));
    };

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const updateInstalled = () => {
      setStatus((currentStatus) => ({
        ...currentStatus,
        isInstalled: detectInstalledMode()
      }));
    };
    const updateOfflineReady = () => {
      setStatus((currentStatus) => ({
        ...currentStatus,
        isOfflineReady: Boolean(navigator.serviceWorker.controller) || currentStatus.isOfflineReady
      }));
    };

    window.addEventListener('online', setOnline);
    window.addEventListener('offline', setOnline);
    window.addEventListener('appinstalled', updateInstalled);

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', updateInstalled);
    } else {
      mediaQuery.addListener(updateInstalled);
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then(() => {
          updateOfflineReady();
        })
        .catch(() => {
          // Ignorar: la app sigue funcionando incluso si el SW no queda listo.
        });

      navigator.serviceWorker.addEventListener('controllerchange', updateOfflineReady);
    }

    return () => {
      window.removeEventListener('online', setOnline);
      window.removeEventListener('offline', setOnline);
      window.removeEventListener('appinstalled', updateInstalled);

      if (typeof mediaQuery.removeEventListener === 'function') {
        mediaQuery.removeEventListener('change', updateInstalled);
      } else {
        mediaQuery.removeListener(updateInstalled);
      }

      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener(
          'controllerchange',
          updateOfflineReady
        );
      }
    };
  }, []);

  return status;
}
