import { use } from 'react';
import { DatabaseWrapper, databaseWrapper, openDatabase } from './db';

const serverDatabasePromise = Promise.resolve<UseDBResult>({ state: 'error' });
let databasePromise: Promise<UseDBResult> | null = null;

type UseDBResult = ({ state: 'ready' } & DatabaseWrapper) | { state: 'error' };

function getDatabasePromise(): Promise<UseDBResult> {
    if (typeof window === 'undefined') {
        return serverDatabasePromise;
    }

    if (!databasePromise) {
        databasePromise = new Promise((resolve) => {
            openDatabase(
                (database) =>
                    resolve({
                        state: 'ready',
                        ...databaseWrapper(database),
                    }),
                () => resolve({ state: 'error' }),
            );
        });
    }

    return databasePromise;
}

export function useDB(): UseDBResult {
    return use(getDatabasePromise());
}
