import { Channel } from './common';

export type RenderMode = 'grayscale' | 'color';

export interface Color {
    h: number;
    s: number;
    v: number;
}

export interface Layer {
    /**
     * Side length
     */
    grainSize: number;
    stepsBasis: number;
    grainOffsetMax: number;
    filmResponsePower: number;
    grainBrightnessMin?: number;
    grainBrightnessMax?: number;
    grainColorAlpha: number;
    minNeighbors: number;
    maxNeighbors: number;
    color?: Color;
    channel: Channel;
}

export interface GrainRenderParameters {
    layers: Layer[];
    /**
     * Side length
     */
    resultGridSize: number;
}

interface ColorOptions {
    filmResponsePowerK?: number;
    grainAlphaK?: number;
    color: Color;
}

export function createGrayscaleRenderParameters(
    grainSizeK: number = 1,
): GrainRenderParameters {
    if (grainSizeK < 1) {
        throw new Error('Wrong "grainSizeK": use only numbers larger than 1');
    }

    grainSizeK = Math.floor(grainSizeK);

    return {
        layers: [
            {
                grainSize: 1 * grainSizeK,
                stepsBasis: grainSizeK ** 2,
                grainOffsetMax: 1,
                filmResponsePower: 1.1,
                grainBrightnessMin: 80,
                grainBrightnessMax: 100,
                grainColorAlpha: 0.3,
                minNeighbors: 0,
                maxNeighbors: 0,
                channel: 'grayscale',
            },
            {
                grainSize: 2 * grainSizeK,
                stepsBasis: (2 * grainSizeK) ** 2,
                grainOffsetMax: 4,
                filmResponsePower: 1.8,
                grainBrightnessMin: 80,
                grainBrightnessMax: 100,
                grainColorAlpha: 0.3,
                minNeighbors: 1,
                maxNeighbors: 2,
                channel: 'grayscale',
            },
            {
                grainSize: 3 * grainSizeK,
                stepsBasis: (3 * grainSizeK) ** 2,
                grainOffsetMax: 5,
                filmResponsePower: 5,
                grainBrightnessMin: 80,
                grainBrightnessMax: 100,
                grainColorAlpha: 0.5,
                minNeighbors: 3,
                maxNeighbors: 3,
                channel: 'grayscale',
            },
        ],
        resultGridSize: 2,
    };
}

export const defaultColors = {
    red: {
        h: 0,
        s: 25,
        v: 50,
    },
    green: {
        h: 120,
        s: 25,
        v: 50,
    },
    blue: {
        h: 240,
        s: 25,
        v: 50,
    },
};

export function createColorGrainRenderParameters(
    grayscaleParameters: GrainRenderParameters,
    rOptions: ColorOptions,
    gOptions: ColorOptions,
    bOptions: ColorOptions,
): GrainRenderParameters {
    const layers: Layer[] = [];

    grayscaleParameters.layers.forEach((layer) => {
        layers.push({
            ...layer,
            filmResponsePower:
                layer.filmResponsePower * (rOptions.filmResponsePowerK ?? 0.9),
            grainColorAlpha:
                layer.grainColorAlpha * (rOptions.grainAlphaK ?? 0.5),
            color: rOptions.color,
            grainBrightnessMin: 60,
            grainBrightnessMax: 70,
            channel: 'r',
        });
    });

    grayscaleParameters.layers.forEach((layer) => {
        layers.push({
            ...layer,
            filmResponsePower:
                layer.filmResponsePower * (gOptions.filmResponsePowerK ?? 1),
            grainColorAlpha:
                layer.grainColorAlpha * (gOptions.grainAlphaK ?? 0.3),
            color: gOptions.color,
            grainBrightnessMin: 60,
            grainBrightnessMax: 70,
            channel: 'g',
        });
    });

    grayscaleParameters.layers.forEach((layer) => {
        layers.push({
            ...layer,
            filmResponsePower:
                layer.filmResponsePower * (bOptions.filmResponsePowerK ?? 1.1),
            grainColorAlpha:
                layer.grainColorAlpha * (bOptions.grainAlphaK ?? 0.2),
            color: bOptions.color,
            grainBrightnessMin: 60,
            grainBrightnessMax: 70,
            channel: 'b',
        });
    });

    return {
        ...grayscaleParameters,
        layers,
    };
}
