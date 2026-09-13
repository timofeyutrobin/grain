import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export function useRenderWorker(onCreate: (worker: Worker) => void) {
    const worker = new Worker(new URL('rendererWorker.ts', import.meta.url));

    useEffect(() => {
        Sentry.addIntegration(Sentry.webWorkerIntegration({ worker }));
        onCreate(worker);
    }, []);

    return worker;
}
