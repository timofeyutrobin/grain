import { GrainRenderer } from '@/lib/rendering/grainRenderer/GrainRenderer';
import * as Sentry from '@sentry/browser';

if (process.env.NODE_ENV === 'production') {
    Sentry.registerWebWorker({ self });
}

let renderer: GrainRenderer | null = null;
let sourceCanvas: OffscreenCanvas = new OffscreenCanvas(0, 0);
let sourceCanvasCtx = sourceCanvas.getContext('2d');

self.addEventListener('message', async (event) => {
    switch (event.data.type) {
        case 'create':
            if (renderer) {
                break;
            }
            renderer = new GrainRenderer();
            break;
        case 'setImage':
            if (!renderer || !sourceCanvasCtx) {
                break;
            }
            sourceCanvas.width = event.data.image.width;
            sourceCanvas.height = event.data.image.height;
            sourceCanvasCtx.drawImage(event.data.image, 0, 0);
            break;
        case 'render':
            if (!renderer) {
                break;
            }
            renderer.setResultCanvasSize(
                sourceCanvas.width,
                sourceCanvas.height,
            );
            await renderer.render(sourceCanvas, event.data.params);
            const blob = await renderer.getImageBlob();
            const imageBitmap = renderer.getImageBitmap();
            postMessage(
                { type: 'ready', blob, imageBitmap },
                { transfer: [imageBitmap] },
            );
            break;
    }
});
