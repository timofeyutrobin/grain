import { randomFromTo, SimpleImageData } from '@/lib/common';
import { getCharacteristicCurve } from '@/lib/grainRenderer/characteristicCurves';
import { getGrainGenerator } from '@/lib/grainRenderer/grainGenerators';
import {
    GrainRenderParameters,
    Layer,
} from '@/lib/grainRenderer/grainRenderParameters';
import { addPixelHsl, nextPixel } from '@/lib/image';

function drawGrain(
    dest: SimpleImageData,
    grain: boolean[],
    offsetX: number,
    offsetY: number,
    layer: Layer,
) {
    const {
        grainGeneratorParams: { grainSize },
        grainColorAlpha,
        grainSpread,
        color,
    } = layer;
    const { width, pixels } = dest;
    const randomOffsetX = Math.round(randomFromTo(0, grainSpread));
    const randomOffsetY = Math.round(randomFromTo(0, grainSpread));
    for (let y = 0; y < grainSize; y++) {
        for (let x = 0; x < grainSize; x++) {
            if (grain[y * grainSize + x]) {
                const brightness = color
                    ? color.v
                    : Math.floor(randomFromTo(80, 100));

                const finalX = offsetX + randomOffsetX + x;
                const finalY = offsetY + randomOffsetY + y;

                addPixelHsl(
                    pixels,
                    width,
                    finalX,
                    finalY,
                    color?.h ?? 0,
                    color?.s ?? 0,
                    brightness,
                    grainColorAlpha,
                );
            }
        }
    }
}

function drawLayer(
    layer: Layer,
    src: SimpleImageData,
    dest: SimpleImageData,
    resultGridSize: number,
) {
    const { grainGeneratorParams, curveParams } = layer;

    let i = 0;
    for (let pixel of nextPixel(src.pixels, layer.channel)) {
        if (Math.random() < getCharacteristicCurve(curveParams)(pixel)) {
            const grain = getGrainGenerator(grainGeneratorParams)();
            drawGrain(
                dest,
                grain,
                (i % src.width) * resultGridSize,
                Math.floor(i / src.width) * resultGridSize,
                layer,
            );
        }
        i++;
    }
}

export function getGrainImage(
    srcImage: SimpleImageData,
    renderParameters: GrainRenderParameters,
): SimpleImageData {
    const destImage = {
        width: srcImage.width * renderParameters.resultGridSize,
        height: srcImage.height * renderParameters.resultGridSize,
        pixels: new Float32Array(
            srcImage.pixels.length * renderParameters.resultGridSize ** 2,
        ),
    };

    renderParameters.layers.forEach((layer) => {
        drawLayer(layer, srcImage, destImage, renderParameters.resultGridSize);
    });

    return destImage;
}
