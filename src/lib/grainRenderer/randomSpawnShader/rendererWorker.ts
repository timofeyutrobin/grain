import { RandomSpawnShaderRenderer } from '@/lib/grainRenderer/randomSpawnShader/RandomSpawnShaderRenderer';

let renderer: RandomSpawnShaderRenderer;

self.addEventListener('message', async (event) => {
    switch (event.data.type) {
        case 'create':
            if (renderer) {
                return;
            }
            renderer = new RandomSpawnShaderRenderer(event.data.resultCanvas);
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
