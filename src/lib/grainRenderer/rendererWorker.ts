import { GrainRenderer } from '@/lib/grainRenderer/GrainRenderer';

let renderer: GrainRenderer | null = null;
let imageBitmap: ImageBitmap | null = null;

self.addEventListener('message', async (event) => {
    switch (event.data.type) {
        case 'create':
            if (renderer) {
                break;
            }
            renderer = new GrainRenderer(event.data.resultCanvas);
            break;
        case 'setImage':
            if (!renderer) {
                break;
            }
            if (imageBitmap) {
                imageBitmap.close();
            }
            imageBitmap = event.data.image;
            break;
        case 'render':
            if (!imageBitmap || !renderer) {
                break;
            }
            renderer.setResultCanvasSize(imageBitmap.width, imageBitmap.height);
            await renderer.render(imageBitmap, event.data.params);
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
