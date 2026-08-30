import {
    Color,
    defaultColors,
    GrainCount,
    GrainSize,
    RenderMode,
    Sharpness,
} from '@/lib/common';
import { GrainRenderParameters } from '@/lib/grainRenderer/GrainRenderer';
import { useState } from 'react';

const sharpnessToBlurRadius: Record<Sharpness, number> = {
    [Sharpness.blurry]: 12,
    [Sharpness.normal]: 6,
    [Sharpness.sharp]: 1,
};

export function useSettings() {
    const [mode, setMode] = useState<RenderMode>('grayscale');

    const [grainSize, setGrainSize] = useState<GrainSize>(GrainSize.s);
    const [grainCount, setGrainCount] = useState<GrainCount>(GrainCount.l);
    const [sharpness, setSharpness] = useState<Sharpness>(Sharpness.normal);

    const [redDyeColor, setRedDyeColor] = useState<Color>(defaultColors.red);
    const [greenDyeColor, setGreenDyeColor] = useState<Color>(
        defaultColors.green,
    );
    const [blueDyeColor, setBlueDyeColor] = useState<Color>(defaultColors.blue);

    // TODO: пресеты
    const renderParameters: GrainRenderParameters = {
        layers: [
            {
                contrast: 0.2,
                sensitivity: 0.2,
                grainSize: 2 * grainSize,
                spawnRate: grainCount,
                alpha: 0.1,
                blurRadius: sharpnessToBlurRadius[sharpness],
            },
            {
                contrast: 0.5,
                sensitivity: 0.2,
                grainSize: grainSize,
                spawnRate: 2 * grainCount,
                alpha: 0.2,
                blurRadius: sharpnessToBlurRadius[sharpness],
            },
            {
                contrast: 1.6,
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
        redDyeColor,
        setRedDyeColor,
        greenDyeColor,
        setGreenDyeColor,
        blueDyeColor,
        setBlueDyeColor,

        renderParameters,
    };
}
