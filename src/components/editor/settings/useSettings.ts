import { Color, NonNullableObject, RenderMode, Setter } from '@/lib/common';
import { DEFAULT_LUT_NAME, lutNameToUrl } from '@/lib/lutService';
import { RenderParameters } from '@/lib/rendering/RenderPipeline';
import { useState } from 'react';

export const enum GrainSize {
    min = 1,
    max = 3,
    step = 1,
    default = min,
}

export const enum GrainCount {
    min = 1,
    max = 3,
    step = 1,
    default = max,
}

export const enum Sharpness {
    min = 1,
    max = 16,
    step = 5,
    default = 11,
}

export const enum Contrast {
    min = 0.1,
    max = 0.9,
    step = 0.1,
    default = 0.5,
}

export const enum Sensitivity {
    min = 0.5,
    max = 1.5,
    step = 0.1,
    default = 1,
}

export const enum Temperature {
    min = -0.5,
    max = 0.5,
    step = 0.05,
    default = 0,
}

export const enum Tint {
    min = -0.5,
    max = 0.5,
    step = 0.05,
    default = 0,
}

export const DEFAULT_COLORS = {
    red: { r: 255, g: 0, b: 0 },
    green: { r: 0, g: 255, b: 0 },
    blue: { r: 0, g: 0, b: 255 },
} as const;

export interface SettingsParameters {
    mode: RenderMode | null;
    grainSize: GrainSize | null;
    grainCount: GrainCount | null;
    sharpness: Sharpness | null;
    contrast: Contrast | null;
    sensitivity: Sensitivity | null;
    redDyeColor: Color | null;
    greenDyeColor: Color | null;
    blueDyeColor: Color | null;
    temperature: Temperature | null;
    tint: Tint | null;
    lutUrl: string | null;
    lutFactor: number | null;
}

function hasAllSettingsParameters(
    settings: SettingsParameters,
): settings is NonNullableObject<SettingsParameters> {
    return Object.values(settings).every((value) => value !== null);
}

export interface SettingsParametersSetters {
    setMode: Setter<RenderMode>;
    setGrainSize: Setter<GrainSize>;
    setGrainCount: Setter<GrainCount>;
    setSharpness: Setter<Sharpness>;
    setContrast: Setter<Contrast>;
    setSensitivity: Setter<Sensitivity>;
    setRedDyeColor: Setter<Color>;
    setGreenDyeColor: Setter<Color>;
    setBlueDyeColor: Setter<Color>;
    setTemperature: Setter<Temperature>;
    setTint: Setter<Tint>;
    setLutUrl: Setter<string>;
    setLutFactor: Setter<number>;
}

export interface SettingsRenderParameters {
    renderParameters: RenderParameters | null;
    hasAllSettingsParameters: typeof hasAllSettingsParameters;
    set: (settings?: Partial<SettingsParameters>) => void;
}

export type SettingsData = SettingsParameters &
    SettingsParametersSetters &
    SettingsRenderParameters;

export function useSettings(): SettingsData {
    const [mode, setMode] = useState<RenderMode | null>(null);

    const [grainSize, setGrainSize] = useState<GrainSize | null>(null);
    const [grainCount, setGrainCount] = useState<GrainCount | null>(null);
    const [sharpness, setSharpness] = useState<Sharpness | null>(null);
    const [contrast, setContrast] = useState<Contrast | null>(null);
    const [sensitivity, setSensitivity] = useState<Sensitivity | null>(null);

    const [redDyeColor, setRedDyeColor] = useState<Color | null>(null);
    const [greenDyeColor, setGreenDyeColor] = useState<Color | null>(null);
    const [blueDyeColor, setBlueDyeColor] = useState<Color | null>(null);

    const [temperature, setTemperature] = useState<Temperature | null>(null);
    const [tint, setTint] = useState<Tint | null>(null);

    const [lutUrl, setLutUrl] = useState<string | null>(null);
    const [lutFactor, setLutFactor] = useState<number | null>(null);

    const set = (settings?: Partial<SettingsParameters>) => {
        setMode(settings?.mode ?? 'grayscale');
        setContrast(settings?.contrast ?? Contrast.default);
        setSensitivity(settings?.sensitivity ?? Sensitivity.default);
        setGrainSize(settings?.grainSize ?? GrainSize.default);
        setGrainCount(settings?.grainCount ?? GrainCount.default);
        setSharpness(settings?.sharpness ?? Sharpness.default);
        setRedDyeColor(settings?.redDyeColor ?? DEFAULT_COLORS.red);
        setGreenDyeColor(settings?.greenDyeColor ?? DEFAULT_COLORS.green);
        setBlueDyeColor(settings?.blueDyeColor ?? DEFAULT_COLORS.blue);
        setTemperature(settings?.temperature ?? Temperature.default);
        setTint(settings?.tint ?? Tint.default);
        setLutFactor(settings?.lutFactor ?? 1);

        const selectedLut = settings?.lutUrl ?? DEFAULT_LUT_NAME;
        setLutUrl(lutNameToUrl[selectedLut]);
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
            temperature,
            tint,
            lutUrl,
            lutFactor,
        };

    const isSettingsPresent = hasAllSettingsParameters(settings);

    const blurRadius = isSettingsPresent
        ? Sharpness.max + Sharpness.min - settings.sharpness
        : 0;
    const invertedSensitivity = isSettingsPresent
        ? Sensitivity.max + Sensitivity.min - settings.sensitivity
        : 0;

    const renderParameters: RenderParameters | null = isSettingsPresent
        ? {
              mode: settings.mode,
              grain: {
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
              },
              color: {
                  temperature: settings.temperature,
                  tint: settings.tint,
                  lutUrl: settings.lutUrl,
                  lutFactor: settings.lutFactor,
              },
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
        setTemperature,
        setTint,
        setLutUrl,
        setLutFactor,

        renderParameters,
        hasAllSettingsParameters,
        set,
    };
}
