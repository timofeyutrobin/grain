import {
    Color,
    defaultColors,
    GrainCount,
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
    const [grainSize, setGrainSize] = useState<GrainSize>(1);
    const [grainCount, setGrainCount] = useState<GrainCount>(1);

    const [redDyeColor, setRedDyeColor] = useState<Color>(defaultColors.red);
    const [greenDyeColor, setGreenDyeColor] = useState<Color>(
        defaultColors.green,
    );
    const [blueDyeColor, setBlueDyeColor] = useState<Color>(defaultColors.blue);

    const [curveType, setCurveType] =
        useState<CharacteristicCurveType>('sigmoid');

    const renderParameters: RandomSpawnGrainRenderParameters = {
        relativeGrainCount: grainCount,
        curveType,
        grainSize,
        grainType,
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
