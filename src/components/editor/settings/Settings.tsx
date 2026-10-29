import { ColorPicker } from '@/components/editor/settings/ColorPicker';
import { Segments } from '@/components/editor/settings/Segments';
import { SettingsGroup } from '@/components/editor/settings/SettingsGroup';
import {
    Contrast,
    DEFAULT_COLORS,
    GrainCount,
    GrainSize,
    Sensitivity,
    SettingsData,
    Sharpness,
    Temperature,
    Tint,
} from '@/components/editor/settings/useSettings';
import { Range } from '@/components/range/Range';
import { Color } from '@/lib/common';
import { lutNameToUrl } from '@/lib/lutService';
import { colord } from 'colord';
import React from 'react';

function withSaturation(color: Color, saturation: number): Color {
    const { h, l } = colord(color).toHsl();
    const { r, g, b } = colord({ h, s: saturation, l }).toRgb();

    return { r, g, b };
}

interface SettingsProps {
    settings: SettingsData;
}

export const Settings: React.FC<SettingsProps> = ({ settings }) => {
    if (settings.hasAllSettingsParameters(settings)) {
        const dyeColors = [
            settings.redDyeColor,
            settings.greenDyeColor,
            settings.blueDyeColor,
        ];
        const saturation =
            dyeColors.reduce(
                (total, color) => total + colord(color).toHsl().s,
                0,
            ) / dyeColors.length;

        return (
            <>
                <SettingsGroup legend="Цвет">
                    <Segments name="Цвет">
                        <Segments.Segment
                            onClick={() => settings.setMode('grayscale')}
                            isSelected={settings.mode === 'grayscale'}
                        >
                            Ч/Б
                        </Segments.Segment>
                        <Segments.Segment
                            onClick={() => settings.setMode('color')}
                            isSelected={settings.mode === 'color'}
                        >
                            Цвет
                        </Segments.Segment>
                    </Segments>
                </SettingsGroup>
                {settings.mode === 'color' && (
                    <>
                        <SettingsGroup legend="Баланс белого">
                            <Range
                                id="temperature"
                                label="Temperature"
                                max={Temperature.max}
                                min={Temperature.min}
                                step={Temperature.step}
                                value={settings.temperature}
                                onChange={settings.setTemperature}
                            />
                            <Range
                                className="mt-4"
                                id="tint"
                                label="Tint"
                                max={Tint.max}
                                min={Tint.min}
                                step={Tint.step}
                                value={settings.tint}
                                onChange={settings.setTint}
                            />
                        </SettingsGroup>
                        <SettingsGroup legend="LUT">
                            <label
                                className="text-sm font-semibold"
                                htmlFor="lut-selector"
                            >
                                Выбрать:
                            </label>
                            <select
                                id="lut-selector"
                                name="lut"
                                className="mt-3 ml-2 text-sm"
                                onChange={(e) =>
                                    settings.setLutUrl(e.target.value)
                                }
                                value={settings.lutUrl}
                            >
                                {Object.entries(lutNameToUrl).map(
                                    ([name, url]) => (
                                        <option key={name} value={url}>
                                            {name}
                                        </option>
                                    ),
                                )}
                            </select>
                            <Range
                                id="lut-factor"
                                label="%"
                                className="mt-2"
                                min={0}
                                max={1}
                                step={0.05}
                                value={settings.lutFactor}
                                onChange={settings.setLutFactor}
                            />
                            <p className="mt-8 text-xs text-zinc-400">
                                LUT credit:{' '}
                                <a
                                    href="https://gmic.eu/color_presets/negative_new_sample_6.html"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="underline hover:text-zinc-200"
                                >
                                    Films: Negative [New] by Pat David
                                </a>
                            </p>
                        </SettingsGroup>
                        <SettingsGroup
                            legend="Цвет красителя"
                            hint={
                                <>
                                    <p>
                                        {
                                            'Выберите цвет красителя для каждого канала.'
                                        }
                                    </p>
                                    <p>
                                        {
                                            'Выбранные цвета будут использоваться для окраски зерна.'
                                        }
                                    </p>
                                </>
                            }
                        >
                            <ColorPicker
                                title="Красный канал"
                                value={settings.redDyeColor}
                                onChange={settings.setRedDyeColor}
                                defaultColor={DEFAULT_COLORS.red}
                            />
                            <ColorPicker
                                title="Зеленый канал"
                                value={settings.greenDyeColor}
                                onChange={settings.setGreenDyeColor}
                                defaultColor={DEFAULT_COLORS.green}
                            />

                            <ColorPicker
                                title="Синий канал"
                                value={settings.blueDyeColor}
                                onChange={settings.setBlueDyeColor}
                                defaultColor={DEFAULT_COLORS.blue}
                            />
                            <Range
                                className="mt-4"
                                id="saturation"
                                label="Насыщенность"
                                min={0}
                                max={100}
                                step={5}
                                value={saturation}
                                onChange={(value) => {
                                    settings.setRedDyeColor(
                                        withSaturation(
                                            settings.redDyeColor,
                                            value,
                                        ),
                                    );
                                    settings.setGreenDyeColor(
                                        withSaturation(
                                            settings.greenDyeColor,
                                            value,
                                        ),
                                    );
                                    settings.setBlueDyeColor(
                                        withSaturation(
                                            settings.blueDyeColor,
                                            value,
                                        ),
                                    );
                                }}
                            />
                        </SettingsGroup>
                    </>
                )}
                <SettingsGroup legend="Контраст">
                    <Range
                        max={Contrast.max}
                        min={Contrast.min}
                        step={Contrast.step}
                        value={settings.contrast}
                        onChange={settings.setContrast}
                    />
                </SettingsGroup>
                <SettingsGroup legend="Светочувствительность">
                    <Range
                        max={Sensitivity.max}
                        min={Sensitivity.min}
                        step={Sensitivity.step}
                        value={settings.sensitivity}
                        onChange={settings.setSensitivity}
                    />
                </SettingsGroup>
                <SettingsGroup legend="Размер зерна">
                    <Range
                        max={GrainSize.max}
                        min={GrainSize.min}
                        step={GrainSize.step}
                        value={settings.grainSize}
                        onChange={settings.setGrainSize}
                    />
                </SettingsGroup>
                <SettingsGroup legend="Плотность зерна">
                    <Range
                        max={GrainCount.max}
                        min={GrainCount.min}
                        step={GrainCount.step}
                        value={settings.grainCount}
                        onChange={settings.setGrainCount}
                    />
                </SettingsGroup>
                <SettingsGroup legend="Резкость">
                    <Range
                        max={Sharpness.max}
                        min={Sharpness.min}
                        step={Sharpness.step}
                        value={settings.sharpness}
                        onChange={settings.setSharpness}
                    />
                </SettingsGroup>
            </>
        );
    } else {
        return null;
    }
};
