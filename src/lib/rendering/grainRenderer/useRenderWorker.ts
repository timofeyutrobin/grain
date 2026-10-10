import { type RendererWorker } from '@/lib/rendering/grainRenderer/rendererWorker';
import * as Sentry from '@sentry/nextjs';
import { useEffect, useState } from 'react';

export function useRenderWorker(onCreate: (worker: RendererWorker) => void) {
    const [renderWorker, setRenderWorker] = useState<RendererWorker | null>(
        null,
    );

    useEffect(() => {
        const worker = new Worker(
            new URL('rendererWorker.ts', import.meta.url),
        );

        if (process.env.NODE_ENV === 'production') {
            Sentry.addIntegration(Sentry.webWorkerIntegration({ worker }));
        }

        setRenderWorker(worker);
        onCreate(worker);

        return () => {
            worker.terminate();
        };
    }, []);

    return renderWorker;
}
