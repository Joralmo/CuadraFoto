import { useEffect, useMemo, useState } from 'react';

import {
  isLocalStorageAvailable,
  readLocalStorageItem,
  removeLocalStorageItem,
  writeLocalStorageItem
} from '../lib/storage/safeLocalStorage';

type UsePersistentStateOptions<T> = {
  deserialize?: (rawValue: string) => T;
  serialize?: (value: T) => string;
  validate?: (value: T) => boolean;
};

type UsePersistentStateMeta = {
  isStorageAvailable: boolean;
};

function defaultDeserialize<T>(rawValue: string) {
  return JSON.parse(rawValue) as T;
}

function defaultSerialize<T>(value: T) {
  return JSON.stringify(value);
}

export function usePersistentState<T>(
  key: string,
  defaultValue: T,
  options: UsePersistentStateOptions<T> = {}
) {
  const { deserialize = defaultDeserialize, serialize = defaultSerialize, validate } =
    options;
  const isStorageAvailable = useMemo(() => isLocalStorageAvailable(), []);
  const [state, setState] = useState<T>(() => {
    const storedValue = readLocalStorageItem(key);

    if (storedValue === null) {
      return defaultValue;
    }

    try {
      const parsedValue = deserialize(storedValue);

      if (validate && !validate(parsedValue)) {
        removeLocalStorageItem(key);
        return defaultValue;
      }

      return parsedValue;
    } catch {
      removeLocalStorageItem(key);
      return defaultValue;
    }
  });

  useEffect(() => {
    if (!isStorageAvailable) {
      return;
    }

    try {
      writeLocalStorageItem(key, serialize(state));
    } catch {
      // Si el storage falla o está lleno, conservamos el estado en memoria.
    }
  }, [isStorageAvailable, key, serialize, state]);

  return [state, setState, { isStorageAvailable } as UsePersistentStateMeta] as const;
}
