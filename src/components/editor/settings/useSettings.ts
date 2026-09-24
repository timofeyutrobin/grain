import {
    Color,
    Contrast,
    DEFAULT_COLORS,
    GrainCount,
    GrainSize,
    RenderMode,
    Sensitivity,
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
    sensitivity: number;
    setSensitivity: Setter<number>;
    redDyeColor: Color;
    setRedDyeColor: Setter<Color>;
    greenDyeColor: Color;
    setGreenDyeColor: Setter<Color>;
    blueDyeColor: Color;
    setBlueDyeColor: Setter<Color>;
    renderParameters: GrainRenderParameters;
}

export function useSettings(): SettingsParameters {
    const [mode, setMode] = useState<RenderMode>('grayscale');

    const [grainSize, setGrainSize] = useState<GrainSize>(GrainSize.default);
    const [grainCount, setGrainCount] = useState<GrainCount>(
        GrainCount.default,
    );
    const [sharpness, setSharpness] = useState<Sharpness>(Sharpness.default);
    const [contrast, setContrast] = useState<number>(Contrast.default);
    const [sensitivity, setSensitivity] = useState<number>(Sensitivity.default);

    const [redDyeColor, setRedDyeColor] = useState<Color>(DEFAULT_COLORS.red);
    const [greenDyeColor, setGreenDyeColor] = useState<Color>(
        DEFAULT_COLORS.green,
    );
    const [blueDyeColor, setBlueDyeColor] = useState<Color>(
        DEFAULT_COLORS.blue,
    );

    const blurRadius = Sharpness.max + Sharpness.min - sharpness;
    const invertedSensitivity = Sensitivity.max + Sensitivity.min - sensitivity;

    // TODO: пресеты
    const renderParameters: GrainRenderParameters = {
        layers: [
            {
                id: 0,
                contrast: contrast * 0.5,
                invertedSensitivity: invertedSensitivity * 0.2,
                grainSize: 2 * grainSize,
                spawnRate: grainCount,
                alpha: 0.1,
                blurRadius,
            },
            {
                id: 1,
                contrast,
                invertedSensitivity: invertedSensitivity * 0.2,
                grainSize: grainSize,
                spawnRate: 2 * grainCount,
                alpha: 0.2,
                blurRadius,
            },
            {
                id: 2,
                contrast: contrast * 3,
                invertedSensitivity,
                grainSize: grainSize,
                spawnRate: 3 * grainCount,
                alpha: 0.2,
                blurRadius,
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
        sensitivity,
        setSensitivity,
        redDyeColor,
        setRedDyeColor,
        greenDyeColor,
        setGreenDyeColor,
        blueDyeColor,
        setBlueDyeColor,

        renderParameters,
    };
}
