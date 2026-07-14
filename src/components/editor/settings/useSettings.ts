import {
    ColorHSV,
    defaultColors,
    GrainCount,
    GrainSize,
    RenderMode,
} from '@/lib/common';
import { GrainRenderParameters } from '@/lib/grainRenderer/GrainRenderer';
import { useState } from 'react';

export function useSettings() {
    const [mode, setMode] = useState<RenderMode>('grayscale');

    const [grainSize, setGrainSize] = useState<GrainSize>(GrainSize.s);
    const [grainCount, setGrainCount] = useState<GrainCount>(GrainCount.s);

    const [redDyeColor, setRedDyeColor] = useState<ColorHSV>(defaultColors.red);
    const [greenDyeColor, setGreenDyeColor] = useState<ColorHSV>(
        defaultColors.green,
    );
    const [blueDyeColor, setBlueDyeColor] = useState<ColorHSV>(
        defaultColors.blue,
    );

    // TODO: пресеты
    const renderParameters: GrainRenderParameters = {
        layers: [
            {
                contrast: 0.2,
                sensitivity: 0.2,
                grainSize: 2 * grainSize,
                spawnRate: grainCount,
                alpha: 0.1,
            },
            {
                contrast: 0.5,
                sensitivity: 0.2,
                grainSize: grainSize,
                spawnRate: 2 * grainCount,
                alpha: 0.2,
            },
            {
                contrast: 1.6,
                sensitivity: 1,
                grainSize: grainSize,
                spawnRate: 3 * grainCount,
                alpha: 0.2,
            },
        ],
    };

    return {
        mode,
        setMode,
        grainSize,
        setGrainSize,
        grainCount,
        setGrainCount,
        redDyeColor,
        setRedDyeColor,
        greenDyeColor,
        setGreenDyeColor,
        blueDyeColor,
        setBlueDyeColor,

        renderParameters,
    };
}
