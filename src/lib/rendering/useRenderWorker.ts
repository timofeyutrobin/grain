import { useEffect } from 'react';

export function useRenderWorker() {
    const worker = new Worker(new URL('rendererWorker.ts', import.meta.url));

    useEffect(() => {
        worker.postMessage({ type: 'create' });
    }, [worker]);

    return worker;
}
