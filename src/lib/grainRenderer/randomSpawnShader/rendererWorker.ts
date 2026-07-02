import { RandomSpawnShaderRenderer } from '@/lib/grainRenderer/randomSpawnShader/RandomSpawnShaderRenderer';

let renderer: RandomSpawnShaderRenderer;

self.addEventListener('message', (event) => {
    switch (event.data.type) {
        case 'create':
            if (renderer) {
                return;
            }
            renderer = new RandomSpawnShaderRenderer(event.data.resultCanvas);
            break;
        case 'render':
            renderer.render(event.data.image, event.data.params);
            break;
    }
});
