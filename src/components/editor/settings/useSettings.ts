import { Color, RenderMode } from '@/lib/common';
import { DEFAULT_LUT_NAME, lutNameToUrl } from '@/lib/lutService';
import { RenderParameters } from '@/lib/rendering/types';
import { DatabaseConnectionResult, useDB } from '@/lib/storage/useDB';
import { use, useState } from 'react';

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

export const enum Saturation {
    min = 0,
    max = 1,
    step = 0.05,
    default = 0.8,
}

export const DEFAULT_COLORS = {
    red: { r: 255, g: 0, b: 0 },
    green: { r: 0, g: 255, b: 0 },
    blue: { r: 0, g: 0, b: 255 },
} as const;

export interface SettingsParameters {
    mode: RenderMode;
    grainSize: GrainSize;
    grainCount: GrainCount;
    sharpness: Sharpness;
    contrast: Contrast;
    sensitivity: Sensitivity;
    redDyeColor: Color;
    greenDyeColor: Color;
    blueDyeColor: Color;
    temperature: Temperature;
    tint: Tint;
    saturation: Saturation;
    lutUrl: string;
    lutFactor: number;
}

export interface SettingsData {
    settingsParameters: SettingsParameters;
    renderParameters: RenderParameters;
    update(patch: Partial<SettingsParameters>): void;
}

const DEFAULT_SETTINGS: SettingsParameters = {
    mode: 'grayscale',
    grainSize: GrainSize.default,
    grainCount: GrainCount.default,
    sharpness: Sharpness.default,
    contrast: Contrast.default,
    sensitivity: Sensitivity.default,
    redDyeColor: DEFAULT_COLORS.red,
    greenDyeColor: DEFAULT_COLORS.green,
    blueDyeColor: DEFAULT_COLORS.blue,
    temperature: Temperature.default,
    tint: Tint.default,
    saturation: Saturation.default,
    lutUrl: lutNameToUrl[DEFAULT_LUT_NAME],
    lutFactor: 0.5,
};

function createRenderParameters(
    settings: SettingsParameters,
): RenderParameters {
    const blurRadius = Sharpness.max + Sharpness.min - settings.sharpness;
    const invertedSensitivity =
        Sensitivity.max + Sensitivity.min - settings.sensitivity;

    return {
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
                          dye: {
                              r: settings.redDyeColor,
                              g: settings.greenDyeColor,
                              b: settings.blueDyeColor,
                          },
                          saturation: settings.saturation,
                      }
                    : null,
        },
        color: {
            temperature: settings.temperature,
            tint: settings.tint,
            lutUrl: settings.lutUrl,
            lutFactor: settings.lutFactor,
        },
    };
}

let settingsPromise: Promise<SettingsParameters | null> | null = null;
function getSettingsPromise(
    databaseConnectionResult: DatabaseConnectionResult,
) {
    if (!settingsPromise) {
        settingsPromise = new Promise(async (resolve) => {
            if (databaseConnectionResult.state === 'ready') {
                try {
                    const settingsFromDB = await databaseConnectionResult.load(
                        'settings',
                        'latest',
                    );
                    resolve(settingsFromDB);
                } catch {
                    resolve(null);
                }
            } else {
                resolve(null);
            }
        });
    }
    return settingsPromise;
}

export function useSettings(): SettingsData {
    const databaseConnectionResult = useDB();
    const initialSettings = use(getSettingsPromise(databaseConnectionResult));
    const [settingsParameters, setSettingsParameters] =
        useState<SettingsParameters>({
            ...initialSettings,
            ...DEFAULT_SETTINGS,
        });
    const update = (patch: Partial<SettingsParameters>) => {
        setSettingsParameters((current) => ({ ...current, ...patch }));
    };

    const renderParameters = createRenderParameters(settingsParameters);

    return {
        settingsParameters,
        renderParameters,
        update,
    };
}
