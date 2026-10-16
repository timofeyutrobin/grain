import { SettingsParameters } from '@/components/editor/settings/useSettings';
import * as Sentry from '@sentry/browser';
const DATABASE_NAME = 'emulsion-engine';
const DATABASE_VERSION = 1;
const STORE_NAME = 'image';

type Key = 'result' | 'original' | 'settings' | 'presets';
type Value<Key> = Key extends 'result'
    ? Blob
    : Key extends 'original'
      ? File
      : Key extends 'settings'
        ? SettingsParameters
        : Key extends 'presets'
          ? Record<string, SettingsParameters>
          : never;

function persist(
    database: IDBDatabase | null,
    key: Key,
    value: Value<Key>,
): void {
    if (!database) {
        Sentry.logger.error(
            'IndexedDB "save" call has been ignored. This could happen because the method was called before the database was created or the database was closed.',
        );
        return;
    }

    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put(value, key);

    transaction.onerror = () => {
        Sentry.captureException(transaction.error);
    };

    transaction.onabort = () => {
        Sentry.captureMessage('Saving image to DB has been aborted.');
    };
}

async function load<K extends Key>(
    database: IDBDatabase | null,
    key: K,
): Promise<Value<K> | null> {
    if (!database) {
        Sentry.logger.error(
            'IndexedDB "load" call has been ignored. This could happen because the method was called before the database was created or the database was closed.',
        );
        return Promise.resolve(null);
    }

    return new Promise<Value<K> | null>((resolve) => {
        const transaction = database.transaction(STORE_NAME, 'readonly');
        const request = transaction.objectStore(STORE_NAME).get(key);

        request.onsuccess = () => {
            resolve(request.result ?? null);
        };

        transaction.onerror = () => {
            Sentry.captureException(transaction.error);
            resolve(null);
        };
        transaction.onabort = () => {
            Sentry.captureMessage('Loading image from DB has been aborted.');
            resolve(null);
        };
    });
}

function deleteEntry(database: IDBDatabase | null, key: Key): void {
    if (!database) {
        Sentry.logger.error(
            'IndexedDB "deleteEntry" call has been ignored. This could happen because the method was called before the database was created or the database was closed.',
        );
        return;
    }

    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).delete(key);

    transaction.onerror = () => {
        Sentry.captureException(transaction.error);
    };
    transaction.onabort = () => {
        Sentry.captureMessage('Deleting image to DB has been aborted.');
    };
}

export function openDatabase(
    onOpen: (database: IDBDatabase) => void,
    onError: (error: DOMException | null) => void,
): void {
    if (typeof indexedDB === 'undefined') {
        Sentry.logger.error('IndexedDB is not supported.');
        onError(null);
        return;
    }

    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(STORE_NAME)) {
            request.result.createObjectStore(STORE_NAME);
        }
    };

    request.onsuccess = () => {
        const database = request.result;
        database.onversionchange = () => {
            database.close();
        };

        onOpen(database);
    };

    request.onerror = () => {
        Sentry.captureException(request.error);
        onError(request.error);
    };
}

export function databaseWrapper(database: IDBDatabase | null) {
    return {
        persist: (
            key: Parameters<typeof persist>[1],
            value: Parameters<typeof persist>[2],
        ) => persist(database, key, value),
        load: <K extends Key>(key: K) => load(database, key),
        delete: (key: Parameters<typeof deleteEntry>[1]) =>
            deleteEntry(database, key),
    };
}
