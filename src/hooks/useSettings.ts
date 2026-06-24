import {
    ColorHSV,
    defaultColors,
    GrainCount,
    grainCountMap,
    GrainSize,
    RenderMode,
} from '@/lib/common';
import { CharacteristicCurveType } from '@/lib/grainRenderer/characteristicCurves';
import { GrainGeneratorType } from '@/lib/grainRenderer/grainGenerators';
import { RandomSpawnGrainRenderParameters } from '@/lib/grainRenderer/randomSpawn/RandomSpawnRenderer';
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

    const renderParameters: RandomSpawnGrainRenderParameters = {
        isColor: mode === 'color',
        relativeGrainCount: grainCountMap[grainCount],
        curveType,
        grainSize,
        grainType,
        color: {
            r: redDyeColor,
            g: greenDyeColor,
            b: blueDyeColor,
            grayscale: { h: 0, s: 0, v: 80 },
        },
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
