import { useEffect } from 'react';

export function useRenderWorker(onCreate: (worker: Worker) => void) {
    const worker = new Worker(new URL('rendererWorker.ts', import.meta.url));

    useEffect(() => {
        onCreate(worker);
    }, []);

    return worker;
}
