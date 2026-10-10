import { SettingsParameters } from '@/components/editor/settings/useSettings';
import * as Sentry from '@sentry/browser';
import { NonNullableObject } from '../common';
const DATABASE_NAME = 'emulsion-engine';
const DATABASE_VERSION = 1;
const STORE_NAME = 'image';

type Key = 'result' | 'original' | 'settings';

type ExcludeFirst<T extends any[]> = T extends [any, ...infer Rest] ? Rest : [];

function save(database: IDBDatabase | null, key: Key, blob: unknown): void {
    if (!database) {
        Sentry.logger.error(
            'IndexedDB "save" call has been ignored. This could happen because the method was called before the database was created or the database was closed.',
        );
        return;
    }

    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put(blob, key);

    transaction.onerror = () => {
        Sentry.captureException(transaction.error);
    };

    transaction.onabort = () => {
        Sentry.captureMessage('Saving image to DB has been aborted.');
    };
}

async function load<T>(
    database: IDBDatabase | null,
    key: Key,
): Promise<T | null> {
    if (!database) {
        Sentry.logger.error(
            'IndexedDB "load" call has been ignored. This could happen because the method was called before the database was created or the database was closed.',
        );
        return Promise.resolve(null);
    }

    return new Promise<T | null>((resolve) => {
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

export function persistOriginalFile(
    database: IDBDatabase | null,
    file: File,
): void {
    save(database, 'original', file);
}

export function persistResultImage(
    database: IDBDatabase | null,
    image: Blob,
): void {
    save(database, 'result', image);
}

export function persistSettings(
    database: IDBDatabase | null,
    settings: NonNullableObject<SettingsParameters>,
): void {
    save(database, 'settings', settings);
}

export async function loadOriginalFile(
    database: IDBDatabase | null,
): Promise<File | null> {
    return load(database, 'original');
}

export async function loadResultImage(
    database: IDBDatabase | null,
): Promise<Blob | null> {
    return load(database, 'result');
}

export async function loadSettings(
    database: IDBDatabase | null,
): Promise<NonNullableObject<SettingsParameters> | null> {
    return load(database, 'settings');
}

export function deleteOriginalFile(database: IDBDatabase | null): void {
    deleteEntry(database, 'original');
}

export function deleteResultImage(database: IDBDatabase | null): void {
    deleteEntry(database, 'result');
}

export function deleteSettings(database: IDBDatabase | null): void {
    deleteEntry(database, 'settings');
}

export function databaseWrapper(database: IDBDatabase | null) {
    return <F extends (database: IDBDatabase | null, ...rest: any[]) => any>(
            func: F,
        ) =>
        (...args: ExcludeFirst<Parameters<F>>) =>
            func(database, ...args) as ReturnType<F>;
}
