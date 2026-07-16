import { GrainRenderer } from '@/lib/grainRenderer/GrainRenderer';

let renderer: GrainRenderer | null = null;
let sourceCanvas: OffscreenCanvas = new OffscreenCanvas(0, 0);
let sourceCanvasCtx = sourceCanvas.getContext('2d');

self.addEventListener('message', async (event) => {
    switch (event.data.type) {
        case 'create':
            if (renderer) {
                break;
            }
            renderer = new GrainRenderer(event.data.resultCanvas);
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
            postMessage({ type: 'ready' });
            break;
        case 'getBlob':
            if (!renderer) {
                break;
            }
            const blob = await renderer.getImage();
            postMessage({ type: 'blobReady', blob });
            break;
    }
});
