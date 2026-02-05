import { Channel } from './common';

interface Color {
    hue: number;
    saturation: number;
}

export interface Layer {
    /**
     * Side length
     */
    grainSize: number;
    stepsBasis: number;
    grainOffsetMax: number;
    filmResponsePower: number;
    grainBrightnessMin: number;
    grainBrightnessMax: number;
    grainColorAlpha: number;
    minNeighbors: number;
    maxNeighbors: number;
    color?: Color;
    channel: Channel;
}

export interface GrainOptions {
    layers: Layer[];
    /**
     * Side length
     */
    resultGridSize: number;
}

export interface Preset {
    name: string;
    getOptions(): GrainOptions;
}

export class GrayscalePreset implements Preset {
    constructor(
        public name: string,
        private grayscaleOptions: GrainOptions,
    ) {}

    getOptions(): GrainOptions {
        return this.grayscaleOptions;
    }
}

interface ColorOptions {
    filmResponsePowerK: number;
    grainAlphaK: number;
    color: Color;
}
export class ColorPreset implements Preset {
    constructor(
        public name: string,
        private basePreset: GrayscalePreset,
        private rOptions: ColorOptions,
        private gOptions: ColorOptions,
        private bOptions: ColorOptions,
    ) {}

    getOptions(): GrainOptions {
        const basePresetOptions = this.basePreset.getOptions();
        const layers: Layer[] = [];

        basePresetOptions.layers.forEach((layer, i) => {
            layers.push({
                ...layer,
                filmResponsePower:
                    layer.filmResponsePower * this.rOptions.filmResponsePowerK,
                grainColorAlpha:
                    layer.grainColorAlpha * this.rOptions.grainAlphaK,
                color: this.rOptions.color,
                grainBrightnessMin: 60,
                grainBrightnessMax: 70,
                channel: 'r',
            });
        });

        basePresetOptions.layers.forEach((layer, i) => {
            layers.push({
                ...layer,
                filmResponsePower:
                    layer.filmResponsePower * this.gOptions.filmResponsePowerK,
                grainColorAlpha:
                    layer.grainColorAlpha * this.gOptions.grainAlphaK,
                color: this.gOptions.color,
                grainBrightnessMin: 60,
                grainBrightnessMax: 70,
                channel: 'g',
            });
        });

        basePresetOptions.layers.forEach((layer, i) => {
            layers.push({
                ...layer,
                filmResponsePower:
                    layer.filmResponsePower * this.bOptions.filmResponsePowerK,
                grainColorAlpha:
                    layer.grainColorAlpha * this.bOptions.grainAlphaK,
                color: this.bOptions.color,
                grainBrightnessMin: 60,
                grainBrightnessMax: 70,
                channel: 'b',
            });
        });

        return {
            layers,
            resultGridSize: basePresetOptions.resultGridSize,
        };
    }
}
