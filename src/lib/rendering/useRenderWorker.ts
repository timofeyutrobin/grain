import { type RendererWorker } from '@/lib/rendering/rendererWorker';
import { useEffect, useState } from 'react';

export function useRenderWorker() {
    const [renderWorker, setRenderWorker] = useState<RendererWorker | null>(
        null,
    );

    useEffect(() => {
        const worker = new Worker(
            new URL('rendererWorker.ts', import.meta.url),
        );

        setRenderWorker(worker);
        worker.postMessage({ type: 'create' });

        return () => {
            worker.terminate();
        };
    }, []);

    return renderWorker;
}
