import { useEffect, useRef, useState } from 'react';
import { databaseWrapper, openDatabase } from './db';

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
              ...withDatabase,
          }
        : null;
}
