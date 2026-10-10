import { ColorPicker } from '@/components/editor/settings/ColorPicker';
import { Segments } from '@/components/editor/settings/Segments';
import { SettingsGroup } from '@/components/editor/settings/SettingsGroup';
import { SettingsData } from '@/components/editor/settings/useSettings';
import { Range } from '@/components/range/Range';
import {
    Contrast,
    DEFAULT_COLORS,
    GrainCount,
    GrainSize,
    Sensitivity,
    Sharpness,
} from '@/lib/common';
import React from 'react';

interface SettingsProps {
    settings: SettingsData;
}

export const Settings: React.FC<SettingsProps> = ({ settings }) => {
    if (settings.hasAllSettingsParameters(settings)) {
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
                                <p>
                                    {
                                        'Для лучшего результата рекомендуется не выставлять слишком яркий и насыщенный цвет.'
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
                    </SettingsGroup>
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
                <SettingsGroup
                    legend="Резкость"
                    hint={
                        <>
                            <p>
                                {
                                    'Для достижения реалистичного аналогового эффекта зачастую необходимо снизить резкость картинки.'
                                }
                            </p>
                            <p>{'Данный регулятор позволяет сделать это.'}</p>
                        </>
                    }
                >
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
