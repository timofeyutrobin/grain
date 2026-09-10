import {
    Color,
    DEFAULT_COLORS,
    GrainCount,
    GrainSize,
    RenderMode,
    Setter,
    Sharpness,
} from '@/lib/common';
import { GrainRenderParameters } from '@/lib/rendering/grainRenderer/GrainRenderer';
import { useState } from 'react';

export interface SettingsParameters {
    mode: RenderMode;
    setMode: Setter<RenderMode>;
    grainSize: GrainSize;
    setGrainSize: Setter<GrainSize>;
    grainCount: GrainCount;
    setGrainCount: Setter<GrainCount>;
    sharpness: Sharpness;
    setSharpness: Setter<Sharpness>;
    contrast: number;
    setContrast: Setter<number>;
    redDyeColor: Color;
    setRedDyeColor: Setter<Color>;
    greenDyeColor: Color;
    setGreenDyeColor: Setter<Color>;
    blueDyeColor: Color;
    setBlueDyeColor: Setter<Color>;
    renderParameters: GrainRenderParameters;
}

const sharpnessToBlurRadius: Record<Sharpness, number> = {
    [Sharpness.blurry]: 12,
    [Sharpness.normal]: 6,
    [Sharpness.sharp]: 1,
};

export function useSettings(): SettingsParameters {
    const [mode, setMode] = useState<RenderMode>('grayscale');

    const [grainSize, setGrainSize] = useState<GrainSize>(GrainSize.s);
    const [grainCount, setGrainCount] = useState<GrainCount>(GrainCount.l);
    const [sharpness, setSharpness] = useState<Sharpness>(Sharpness.normal);
    const [contrast, setContrast] = useState<number>(0.5);

    const [redDyeColor, setRedDyeColor] = useState<Color>(DEFAULT_COLORS.red);
    const [greenDyeColor, setGreenDyeColor] = useState<Color>(
        DEFAULT_COLORS.green,
    );
    const [blueDyeColor, setBlueDyeColor] = useState<Color>(
        DEFAULT_COLORS.blue,
    );

    // TODO: пресеты
    const renderParameters: GrainRenderParameters = {
        layers: [
            {
                id: 0,
                contrast: contrast * 0.5,
                sensitivity: 0.2,
                grainSize: 2 * grainSize,
                spawnRate: grainCount,
                alpha: 0.1,
                blurRadius: sharpnessToBlurRadius[sharpness],
            },
            {
                id: 1,
                contrast,
                sensitivity: 0.2,
                grainSize: grainSize,
                spawnRate: 2 * grainCount,
                alpha: 0.2,
                blurRadius: sharpnessToBlurRadius[sharpness],
            },
            {
                id: 2,
                contrast: contrast * 3,
                sensitivity: 1,
                grainSize: grainSize,
                spawnRate: 3 * grainCount,
                alpha: 0.2,
                blurRadius: sharpnessToBlurRadius[sharpness],
            },
        ],
        colorParameters:
            mode === 'color'
                ? {
                      r: { dye: redDyeColor },
                      g: { dye: greenDyeColor },
                      b: { dye: blueDyeColor },
                  }
                : null,
    };

    return {
        mode,
        setMode,
        grainSize,
        setGrainSize,
        grainCount,
        setGrainCount,
        sharpness,
        setSharpness,
        contrast,
        setContrast,
        redDyeColor,
        setRedDyeColor,
        greenDyeColor,
        setGreenDyeColor,
        blueDyeColor,
        setBlueDyeColor,

        renderParameters,
    };
}
