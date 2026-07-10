import {
    ColorHSV,
    defaultColors,
    GrainCount,
    GrainSize,
    RenderMode,
} from '@/lib/common';
import { CharacteristicCurveType } from '@/lib/grainRenderer/characteristicCurves';
import { GrainGeneratorType } from '@/lib/grainRenderer/grainGenerators';
import { RandomSpawnShaderRenderParameters } from '@/lib/grainRenderer/randomSpawnShader/RandomSpawnShaderRenderer';
import { useState } from 'react';

export function useSettings() {
    const [mode, setMode] = useState<RenderMode>('grayscale');

    const [grainType, setGrainType] = useState<GrainGeneratorType>('cubic');
    const [grainSize, setGrainSize] = useState<GrainSize>(GrainSize.s);
    const [grainCount, setGrainCount] = useState<GrainCount>(GrainCount.s);

    const [redDyeColor, setRedDyeColor] = useState<ColorHSV>(defaultColors.red);
    const [greenDyeColor, setGreenDyeColor] = useState<ColorHSV>(
        defaultColors.green,
    );
    const [blueDyeColor, setBlueDyeColor] = useState<ColorHSV>(
        defaultColors.blue,
    );

    const [curveType, setCurveType] =
        useState<CharacteristicCurveType>('sigmoid');

    // TODO: пресеты
    const renderParameters: RandomSpawnShaderRenderParameters = {
        layers: [
            {
                contrast: 0.14,
                sensitivity: 0.1,
                grainSize: 2 * grainSize,
                spawnRate: grainCount,
            },
            {
                contrast: 0.8,
                sensitivity: 0.2,
                grainSize: grainSize,
                spawnRate: 2 * grainCount,
            },
            {
                contrast: 1.6,
                sensitivity: 1,
                grainSize: grainSize,
                spawnRate: 3 * grainCount,
            },
        ],
    };

    return {
        mode,
        setMode,
        grainType,
        setGrainType,
        curveType,
        setCurveType,
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
