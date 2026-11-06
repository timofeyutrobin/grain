import { use } from 'react';
import { DatabaseWrapper, databaseWrapper, openDatabase } from './db';

const serverDatabasePromise = Promise.resolve<DatabaseConnectionResult>({
    state: 'error',
});
let databasePromise: Promise<DatabaseConnectionResult> | null = null;

export type DatabaseConnectionResult =
    | ({ state: 'ready' } & DatabaseWrapper)
    | { state: 'error' };

function getDatabasePromise(): Promise<DatabaseConnectionResult> {
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

export function useDB(): DatabaseConnectionResult {
    return use(getDatabasePromise());
}
