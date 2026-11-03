import { SettingsParameters } from '@/components/editor/settings/useSettings';
const DATABASE_NAME = 'emulsion-engine';
const DATABASE_VERSION = 2;

type Store = 'image' | 'lut' | 'settings';

type Key<S extends Store> = S extends 'image'
    ? 'result' | 'original'
    : S extends 'settings'
      ? 'latest'
      : string;
type Value<S extends Store, K extends Key<S>> = S extends 'image'
    ? K extends 'result'
        ? Blob
        : K extends 'original'
          ? File
          : never
    : S extends 'settings'
      ? K extends 'latest'
          ? SettingsParameters
          : never
      : S extends 'lut'
        ? ImageBitmap
        : never;

function persist<S extends Store, K extends Key<S>>(
    database: IDBDatabase,
    store: S,
    key: K,
    value: Value<S, K>,
): void {
    const transaction = database.transaction(store, 'readwrite');
    transaction.objectStore(store).put(value, key);

    transaction.onerror = () => {
        console.error(transaction.error);
    };

    transaction.onabort = () => {
        console.log('Saving image to DB has been aborted.');
    };
}

async function load<S extends Store, K extends Key<S>>(
    database: IDBDatabase,
    store: S,
    key: K,
): Promise<Value<S, K> | null> {
    return new Promise<Value<S, K> | null>((resolve) => {
        const transaction = database.transaction(store, 'readonly');
        const request = transaction.objectStore(store).get(key);

        request.onsuccess = () => {
            resolve(request.result ?? null);
        };

        transaction.onerror = () => {
            console.error(transaction.error);
            resolve(null);
        };
        transaction.onabort = () => {
            console.log('Loading image from DB has been aborted.');
            resolve(null);
        };
    });
}

function deleteEntry(
    database: IDBDatabase,
    store: Store,
    key: Key<Store>,
): void {
    const transaction = database.transaction(store, 'readwrite');
    transaction.objectStore(store).delete(key);

    transaction.onerror = () => {
        console.error(transaction.error);
    };
    transaction.onabort = () => {
        console.log('Deleting image from DB has been aborted.');
    };
}

export function openDatabase(
    onOpen?: (database: IDBDatabase) => void,
    onError?: (error: DOMException | null) => void,
): void {
    if (typeof indexedDB === 'undefined') {
        console.error('IndexedDB is not supported.');
        onError?.(null);
        return;
    }

    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains('image')) {
            request.result.createObjectStore('image');
        }
        if (!request.result.objectStoreNames.contains('lut')) {
            request.result.createObjectStore('lut');
        }

        if (request.result.objectStoreNames.contains('settings')) {
            request.result.deleteObjectStore('settings');
        }
        request.result.createObjectStore('settings');
    };

    request.onsuccess = () => {
        const database = request.result;
        database.onversionchange = () => {
            database.close();
        };

        onOpen?.(database);
    };

    request.onerror = () => {
        console.error(request.error);
        onError?.(request.error);
    };
}

export interface DatabaseWrapper {
    persist<S extends Store, K extends Key<S>>(
        store: S,
        key: K,
        value: Value<S, K>,
    ): void;
    load<S extends Store, K extends Key<S>>(
        store: S,
        key: K,
    ): Promise<Value<S, K> | null>;
    delete<S extends Store>(store: S, key: Key<S>): void;
}

export function databaseWrapper(database: IDBDatabase): DatabaseWrapper {
    return {
        persist: (store, key, value) => persist(database, store, key, value),
        load: (store, key) => load(database, store, key),
        delete: (store, key) => deleteEntry(database, store, key),
    };
}
