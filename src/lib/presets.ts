import { ColorPreset, GrainOptions, GrayscalePreset } from './grainOptions';

export const defaultGrainOptions: GrainOptions = {
    layers: [
        {
            grainSize: 1,
            stepsBasis: 0,
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
            grainSize: 4,
            stepsBasis: 2,
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
            grainSize: 9,
            stepsBasis: 10,
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

export const baseGrayscalePreset = new GrayscalePreset(
    'base',
    defaultGrainOptions,
);
export const testColorPreset = new ColorPreset(
    'test',
    baseGrayscalePreset,
    {
        filmResponsePowerK: 0.9,
        grainAlphaK: 1,
        color: {
            hue: 0,
            saturation: 20,
        },
    },
    {
        filmResponsePowerK: 1,
        grainAlphaK: 0.9,
        color: {
            hue: 120,
            saturation: 20,
        },
    },
    {
        filmResponsePowerK: 1.1,
        grainAlphaK: 1.05,
        color: {
            hue: 240,
            saturation: 20,
        },
    },
);
