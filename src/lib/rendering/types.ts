import { Color, RenderMode } from '@/lib/common';

export interface Layer {
    id: number;
    contrast: number;
    invertedSensitivity: number;
    grainSize: number;
    spawnRate: number;
    alpha: number;
    blurRadius: number;
}

export interface GrainRenderParameters {
    layers: Layer[];
    colorParameters?: {
        dye: {
            r: Color;
            g: Color;
            b: Color;
        };
        saturation: number;
    } | null;
}

export interface ColorRenderParameters {
    temperature?: number;
    tint?: number;
    lutUrl: string;
    lutFactor?: number;
}

export interface RenderParameters {
    mode: RenderMode;
    grain: GrainRenderParameters;
    color: ColorRenderParameters;
}
