import { MMKV } from 'react-native-mmkv';

export type Storage = {
  getString: (key: string) => string | undefined;
  set: (key: string, value: string | number | boolean) => void;
  delete: (key: string) => void;
};

function createInMemoryStorage(): Storage {
  // Expo Go does not bundle the react-native-mmkv native module, so `new MMKV()`
  // throws there. This fallback keeps the app booting in Expo Go — persistence
  // is faked in-memory and resets on reload. Use a development build
  // (`npx expo run:android` / `run:ios`) to get real MMKV-backed persistence.
  const mem = new Map<string, string>();
  return {
    getString: (key) => mem.get(key),
    set: (key, value) => {
      mem.set(key, String(value));
    },
    delete: (key) => {
      mem.delete(key);
    },
  };
}

function createStorage(): Storage {
  try {
    return new MMKV({ id: 'spring' });
  } catch {
    // eslint-disable-next-line no-console
    console.warn(
      '[storage] MMKV unavailable — falling back to in-memory storage. ' +
        'This is expected in Expo Go; build a Development Client for real persistence.',
    );
    return createInMemoryStorage();
  }
}

export const storage: Storage = createStorage();
