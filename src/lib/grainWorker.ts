import { drawGrainImage } from './grain';
import { GrainOptions } from './grainOptions';

let canvas: OffscreenCanvas;

onmessage = (event) => {
    if (event.data.canvas && !canvas) {
        canvas = event.data.canvas;
    }
    const imageData: SimpleImageData = event.data.imageData;
    const options: GrainOptions = event.data.options;
    const ctx = canvas.getContext('2d');

    drawGrainImage(imageData, canvas, ctx, options);

    postMessage(true);
};
