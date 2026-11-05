import { ColorPicker } from '@/components/editor/settings/ColorPicker';
import { Segments } from '@/components/editor/settings/Segments';
import { SettingsGroup } from '@/components/editor/settings/SettingsGroup';
import {
    Contrast,
    DEFAULT_COLORS,
    GrainCount,
    GrainSize,
    Saturation,
    Sensitivity,
    SettingsData,
    Sharpness,
    Temperature,
    Tint,
} from '@/components/editor/settings/useSettings';
import { Range } from '@/components/range/Range';
import { lutNameToUrl } from '@/lib/lutService';
import React from 'react';

interface SettingsProps {
    settings: SettingsData;
}

export const Settings: React.FC<SettingsProps> = ({
    settings: { settingsParameters, update },
}) => {
    return (
        <>
            <SettingsGroup legend="Цвет">
                <Segments name="Цвет">
                    <Segments.Segment
                        onClick={() => update({ mode: 'grayscale' })}
                        isSelected={settingsParameters.mode === 'grayscale'}
                    >
                        Ч/Б
                    </Segments.Segment>
                    <Segments.Segment
                        onClick={() => update({ mode: 'color' })}
                        isSelected={settingsParameters.mode === 'color'}
                    >
                        Цвет
                    </Segments.Segment>
                </Segments>
            </SettingsGroup>
            {settingsParameters.mode === 'color' && (
                <>
                    <SettingsGroup legend="Баланс белого">
                        <Range
                            id="temperature"
                            label="Temperature"
                            max={Temperature.max}
                            min={Temperature.min}
                            step={Temperature.step}
                            value={settingsParameters.temperature}
                            onChange={(temperature) => update({ temperature })}
                        />
                        <Range
                            className="mt-4"
                            id="tint"
                            label="Tint"
                            max={Tint.max}
                            min={Tint.min}
                            step={Tint.step}
                            value={settingsParameters.tint}
                            onChange={(tint) => update({ tint })}
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
                            onChange={(e) => update({ lutUrl: e.target.value })}
                            value={settingsParameters.lutUrl}
                        >
                            {Object.entries(lutNameToUrl).map(([name, url]) => (
                                <option key={name} value={url}>
                                    {name}
                                </option>
                            ))}
                        </select>
                        <Range
                            id="lut-factor"
                            label="%"
                            className="mt-2"
                            min={0}
                            max={1}
                            step={0.05}
                            value={settingsParameters.lutFactor}
                            onChange={(lutFactor) => update({ lutFactor })}
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
                            value={settingsParameters.redDyeColor}
                            onChange={(redDyeColor) => update({ redDyeColor })}
                            defaultColor={DEFAULT_COLORS.red}
                        />
                        <ColorPicker
                            title="Зеленый канал"
                            value={settingsParameters.greenDyeColor}
                            onChange={(greenDyeColor) =>
                                update({ greenDyeColor })
                            }
                            defaultColor={DEFAULT_COLORS.green}
                        />

                        <ColorPicker
                            title="Синий канал"
                            value={settingsParameters.blueDyeColor}
                            onChange={(blueDyeColor) =>
                                update({ blueDyeColor })
                            }
                            defaultColor={DEFAULT_COLORS.blue}
                        />
                        <Range
                            className="mt-4"
                            id="saturation"
                            label="Насыщенность"
                            min={Saturation.min}
                            max={Saturation.max}
                            step={Saturation.step}
                            value={settingsParameters.saturation}
                            onChange={(saturation) => {
                                update({ saturation });
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
                    value={settingsParameters.contrast}
                    onChange={(contrast) => update({ contrast })}
                />
            </SettingsGroup>
            <SettingsGroup legend="Светочувствительность">
                <Range
                    max={Sensitivity.max}
                    min={Sensitivity.min}
                    step={Sensitivity.step}
                    value={settingsParameters.sensitivity}
                    onChange={(sensitivity) => update({ sensitivity })}
                />
            </SettingsGroup>
            <SettingsGroup legend="Размер зерна">
                <Range
                    max={GrainSize.max}
                    min={GrainSize.min}
                    step={GrainSize.step}
                    value={settingsParameters.grainSize}
                    onChange={(grainSize) => update({ grainSize })}
                />
            </SettingsGroup>
            <SettingsGroup legend="Плотность зерна">
                <Range
                    max={GrainCount.max}
                    min={GrainCount.min}
                    step={GrainCount.step}
                    value={settingsParameters.grainCount}
                    onChange={(grainCount) => update({ grainCount })}
                />
            </SettingsGroup>
            <SettingsGroup legend="Резкость">
                <Range
                    max={Sharpness.max}
                    min={Sharpness.min}
                    step={Sharpness.step}
                    value={settingsParameters.sharpness}
                    onChange={(sharpness) => update({ sharpness })}
                />
            </SettingsGroup>
        </>
    );
};
