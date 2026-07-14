import { GrainRenderer } from '@/lib/grainRenderer/GrainRenderer';

let renderer: GrainRenderer;

self.addEventListener('message', async (event) => {
    switch (event.data.type) {
        case 'create':
            if (renderer) {
                return;
            }
            renderer = new GrainRenderer(event.data.resultCanvas);
            postMessage({ type: 'rendererCreated' });
            break;
        case 'render':
            renderer.setResultCanvasSize(
                event.data.image.width,
                event.data.image.height,
            );
            postMessage({ type: 'canvasSizeSet' });
            await renderer.render(event.data.image, event.data.params);
            postMessage({ type: 'ready' });
            break;
    }
});
