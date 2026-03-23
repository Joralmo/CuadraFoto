let cachedAvailability: boolean | null = null;

function detectAvailability() {
  if (cachedAvailability !== null) {
    return cachedAvailability;
  }

  if (typeof window === 'undefined' || !window.localStorage) {
    cachedAvailability = false;
    return cachedAvailability;
  }

  try {
    const probeKey = '__cuadrafoto_storage_probe__';
    window.localStorage.setItem(probeKey, '1');
    window.localStorage.removeItem(probeKey);
    cachedAvailability = true;
  } catch {
    cachedAvailability = false;
  }

  return cachedAvailability;
}

export function isLocalStorageAvailable() {
  return detectAvailability();
}

export function readLocalStorageItem(key: string) {
  if (!detectAvailability()) {
    return null;
  }

  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeLocalStorageItem(key: string, value: string) {
  if (!detectAvailability()) {
    return false;
  }

  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function removeLocalStorageItem(key: string) {
  if (!detectAvailability()) {
    return false;
  }

  try {
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

