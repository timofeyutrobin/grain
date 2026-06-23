import {
    ColorHSV,
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
    const [grainCount, setGrainCount] = useState<GrainCount>(2);

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
        relativeGrainCount: grainCount,
        curveType,
        grainSize,
        grainType,
        color:
            mode === 'color'
                ? {
                      r: redDyeColor,
                      g: greenDyeColor,
                      b: blueDyeColor,
                  }
                : null,
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
