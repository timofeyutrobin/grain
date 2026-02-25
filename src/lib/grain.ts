import { SimpleImageData } from './common';
import { grainGenerators } from './grainGenerators';
import {
    GrainGeneratorType,
    GrainRenderParameters,
    Layer,
} from './grainRenderParameters';
import { addPixelHsl, nextPixel } from './image';

function drawGrain(
    dest: SimpleImageData,
    grain: boolean[],
    offsetX: number,
    offsetY: number,
    layer: Layer,
) {
    const {
        grainGeneratorParams: { grainSize },
        grainBrightnessMax = 100,
        grainBrightnessMin = 80,
        grainColorAlpha,
        grainOffsetMax,
        color,
    } = layer;
    const { width, pixels } = dest;
    const randomOffsetX = Math.round(
        Math.random() * grainOffsetMax * 2 - grainOffsetMax,
    );
    const randomOffsetY = Math.round(
        Math.random() * grainOffsetMax * 2 - grainOffsetMax,
    );
    for (let y = 0; y < grainSize; y++) {
        for (let x = 0; x < grainSize; x++) {
            if (grain[y * grainSize + x]) {
                const brightness = color
                    ? color.v
                    : Math.floor(
                          Math.random() *
                              (grainBrightnessMax - grainBrightnessMin) +
                              grainBrightnessMin,
                      );

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

function filmResponse(pixel: number, filmResponsePower: number) {
    return Math.pow(pixel, filmResponsePower);
}

function drawLayer<GrainType extends GrainGeneratorType>(
    layer: Layer<GrainType>,
    src: SimpleImageData,
    dest: SimpleImageData,
    resultGridSize: number,
) {
    const { grainType, grainGeneratorParams } = layer;

    let i = 0;
    for (let pixel of nextPixel(src.pixels, layer.channel)) {
        {
            if (Math.random() < filmResponse(pixel, layer.filmResponsePower)) {
                const grain = grainGenerators[grainType](grainGeneratorParams);
                drawGrain(
                    dest,
                    grain,
                    (i % src.width) * resultGridSize,
                    Math.floor(i / src.width) * resultGridSize,
                    layer,
                );
            }
        }
        i++;
    }
}

export function getGrainImage<GrainType extends GrainGeneratorType>(
    srcImage: SimpleImageData,
    renderParameters: GrainRenderParameters<GrainType>,
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
