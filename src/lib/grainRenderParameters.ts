import { Channel } from './common';

export type RenderMode = 'grayscale' | 'color';

export interface GrainGeneratorParams {
    cubic: {
        grainSize: number;
        stepsBasis: number;
        smoothing?: {
            minNeighbors: number;
            maxNeighbors: number;
        };
    };
    tabular: {
        grainSize: number;
    };
}
export type GrainGeneratorType = keyof GrainGeneratorParams;

export interface Color {
    h: number;
    s: number;
    v: number;
}

export interface Layer<
    GrainType extends GrainGeneratorType = GrainGeneratorType,
> {
    grainType: GrainType;
    grainGeneratorParams: GrainGeneratorParams[GrainType];
    grainOffsetMax: number;
    filmResponsePower: number;
    grainBrightnessMin?: number;
    grainBrightnessMax?: number;
    grainColorAlpha: number;
    color?: Color;
    channel: Channel;
}

export interface GrainRenderParameters<
    GrainType extends GrainGeneratorType = GrainGeneratorType,
> {
    layers: Layer<GrainType>[];
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

export function createGrayscaleRenderParameters<
    GrainType extends GrainGeneratorType,
>(
    grainType: GrainType,
    grainSizeK: number = 1,
    grainSpread: number = 1,
): GrainRenderParameters<GrainType> {
    if (grainSizeK < 1) {
        throw new Error('Wrong "grainSizeK": use only numbers larger than 1');
    }
    if (grainSpread < 1) {
        throw new Error(
            'Wrong "grainSpreading": use only numbers larger than 1',
        );
    }

    grainSizeK = Math.floor(grainSizeK);
    grainSpread = Math.floor(grainSpread);

    return {
        layers: [
            {
                grainType,
                grainGeneratorParams: {
                    grainSize: 1 * grainSizeK,
                    stepsBasis: grainSizeK ** 2,
                },
                grainOffsetMax: 1 * grainSpread,
                filmResponsePower: 1.1,
                grainBrightnessMin: 80,
                grainBrightnessMax: 100,
                grainColorAlpha: 0.3,
                channel: 'grayscale',
            },
            {
                grainType,
                grainGeneratorParams: {
                    grainSize: 2 * grainSizeK,
                    stepsBasis: (2 * grainSizeK) ** 2,
                },
                grainOffsetMax: 4 * grainSpread,
                filmResponsePower: 1.8,
                grainBrightnessMin: 80,
                grainBrightnessMax: 100,
                grainColorAlpha: 0.3,
                channel: 'grayscale',
            },
            {
                grainType,
                grainGeneratorParams: {
                    grainSize: 3 * grainSizeK,
                    stepsBasis: (3 * grainSizeK) ** 2,
                },
                grainOffsetMax: 5 * grainSpread,
                filmResponsePower: 5,
                grainBrightnessMin: 80,
                grainBrightnessMax: 100,
                grainColorAlpha: 0.5,
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

export function createColorGrainRenderParameters<
    GrainType extends GrainGeneratorType,
>(
    grayscaleParameters: GrainRenderParameters<GrainType>,
    rOptions: ColorOptions,
    gOptions: ColorOptions,
    bOptions: ColorOptions,
): GrainRenderParameters<GrainType> {
    const layers: Layer<GrainType>[] = [];

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
