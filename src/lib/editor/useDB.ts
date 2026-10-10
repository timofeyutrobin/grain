import { useEffect, useRef, useState } from 'react';
import {
    databaseWrapper,
    deleteOriginalFile,
    deleteResultImage,
    deleteSettings,
    loadOriginalFile,
    loadResultImage,
    loadSettings,
    openDatabase,
    persistOriginalFile,
    persistResultImage,
    persistSettings,
} from './db';

export function useDB() {
    const [error, setError] = useState<DOMException | null>(null);
    const [database, setDatabase] = useState<IDBDatabase | null>(null);
    const databaseRef = useRef<IDBDatabase | null>(null);

    useEffect(() => {
        openDatabase((db) => {
            databaseRef.current = db;
            setDatabase(db);
        }, setError);

        return () => {
            databaseRef.current?.close();
        };
    }, []);

    const withDatabase = databaseWrapper(database);

    return !!database || !!error
        ? {
              isLoaded: !!database,
              isFailed: !!error,
              persistOriginalFile: withDatabase(persistOriginalFile),
              persistResultImage: withDatabase(persistResultImage),
              persistSettings: withDatabase(persistSettings),
              loadOriginalFile: withDatabase(loadOriginalFile),
              loadResultImage: withDatabase(loadResultImage),
              loadSettings: withDatabase(loadSettings),
              deleteOriginalFile: withDatabase(deleteOriginalFile),
              deleteResultImage: withDatabase(deleteResultImage),
              deleteSettings: withDatabase(deleteSettings),
          }
        : null;
}
