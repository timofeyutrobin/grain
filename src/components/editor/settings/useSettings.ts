import {
    Color,
    Contrast,
    DEFAULT_COLORS,
    GrainCount,
    GrainSize,
    NonNullableObject,
    RenderMode,
    Sensitivity,
    Setter,
    Sharpness,
} from '@/lib/common';
import { GrainRenderParameters } from '@/lib/rendering/grainRenderer/GrainRenderer';
import { useState } from 'react';

export interface SettingsParameters {
    mode: RenderMode | null;
    grainSize: GrainSize | null;
    grainCount: GrainCount | null;
    sharpness: Sharpness | null;
    contrast: number | null;
    sensitivity: number | null;
    redDyeColor: Color | null;
    greenDyeColor: Color | null;
    blueDyeColor: Color | null;
}

function hasAllSettingsParameters(
    settings: SettingsParameters,
): settings is NonNullableObject<SettingsParameters> {
    return (
        settings.mode !== null &&
        settings.grainSize !== null &&
        settings.grainCount !== null &&
        settings.sharpness !== null &&
        settings.contrast !== null &&
        settings.sensitivity !== null &&
        settings.redDyeColor !== null &&
        settings.greenDyeColor !== null &&
        settings.blueDyeColor !== null
    );
}

export interface SettingsParametersSetters {
    setMode: Setter<RenderMode>;
    setGrainSize: Setter<GrainSize>;
    setGrainCount: Setter<GrainCount>;
    setSharpness: Setter<Sharpness>;
    setContrast: Setter<number>;
    setSensitivity: Setter<number>;
    setRedDyeColor: Setter<Color>;
    setGreenDyeColor: Setter<Color>;
    setBlueDyeColor: Setter<Color>;
}

export interface SettingsRenderParameters {
    renderParameters: GrainRenderParameters | null;
    hasAllSettingsParameters: typeof hasAllSettingsParameters;
    set: (settings: SettingsParameters) => void;
    setDefaults: () => void;
}

export type SettingsData = SettingsParameters &
    SettingsParametersSetters &
    SettingsRenderParameters;

// Дефолтные настройки либо из БД, либо дефолт, если БД не загрузилась
export function useSettings(): SettingsData {
    const [mode, setMode] = useState<RenderMode | null>(null);

    const [grainSize, setGrainSize] = useState<GrainSize | null>(null);
    const [grainCount, setGrainCount] = useState<GrainCount | null>(null);
    const [sharpness, setSharpness] = useState<Sharpness | null>(null);
    const [contrast, setContrast] = useState<number | null>(null);
    const [sensitivity, setSensitivity] = useState<number | null>(null);

    const [redDyeColor, setRedDyeColor] = useState<Color | null>(null);
    const [greenDyeColor, setGreenDyeColor] = useState<Color | null>(null);
    const [blueDyeColor, setBlueDyeColor] = useState<Color | null>(null);

    const set = (settings: SettingsParameters) => {
        setMode(settings.mode);
        setContrast(settings.contrast);
        setSensitivity(settings.sensitivity);
        setGrainSize(settings.grainSize);
        setGrainCount(settings.grainCount);
        setSharpness(settings.sharpness);
        setRedDyeColor(settings.redDyeColor);
        setGreenDyeColor(settings.greenDyeColor);
        setBlueDyeColor(settings.blueDyeColor);
    };
    const setDefaults = () => {
        setMode('grayscale');
        setContrast(Contrast.default);
        setSensitivity(Sensitivity.default);
        setGrainSize(GrainSize.default);
        setGrainCount(GrainCount.default);
        setSharpness(Sharpness.default);
        setRedDyeColor(DEFAULT_COLORS.red);
        setGreenDyeColor(DEFAULT_COLORS.green);
        setBlueDyeColor(DEFAULT_COLORS.blue);
    };

    const settings: SettingsParameters | NonNullableObject<SettingsParameters> =
        {
            mode,
            grainSize,
            grainCount,
            sharpness,
            contrast,
            sensitivity,
            redDyeColor,
            greenDyeColor,
            blueDyeColor,
        };

    const isSettingsPresent = hasAllSettingsParameters(settings);

    const blurRadius = isSettingsPresent
        ? Sharpness.max + Sharpness.min - settings.sharpness
        : 0;
    const invertedSensitivity = isSettingsPresent
        ? Sensitivity.max + Sensitivity.min - settings.sensitivity
        : 0;

    // TODO: пресеты
    const renderParameters: GrainRenderParameters | null = isSettingsPresent
        ? {
              layers: [
                  {
                      id: 0,
                      contrast: settings.contrast * 0.5,
                      invertedSensitivity: invertedSensitivity * 0.2,
                      grainSize: 2 * settings.grainSize,
                      spawnRate: settings.grainCount,
                      alpha: 0.1,
                      blurRadius,
                  },
                  {
                      id: 1,
                      contrast: settings.contrast,
                      invertedSensitivity: invertedSensitivity * 0.2,
                      grainSize: settings.grainSize,
                      spawnRate: 2 * settings.grainCount,
                      alpha: 0.2,
                      blurRadius,
                  },
                  {
                      id: 2,
                      contrast: settings.contrast * 3,
                      invertedSensitivity,
                      grainSize: settings.grainSize,
                      spawnRate: 3 * settings.grainCount,
                      alpha: 0.2,
                      blurRadius,
                  },
              ],
              colorParameters:
                  settings.mode === 'color'
                      ? {
                            r: { dye: settings.redDyeColor },
                            g: { dye: settings.greenDyeColor },
                            b: { dye: settings.blueDyeColor },
                        }
                      : null,
          }
        : null;

    return {
        ...settings,
        setMode,
        setGrainSize,
        setGrainCount,
        setSharpness,
        setContrast,
        setSensitivity,
        setRedDyeColor,
        setGreenDyeColor,
        setBlueDyeColor,

        renderParameters,
        hasAllSettingsParameters,
        set,
        setDefaults,
    };
}
