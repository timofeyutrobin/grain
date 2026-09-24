import { ColorPicker } from '@/components/editor/settings/ColorPicker';
import { Range } from '@/components/range/Range';
import { Segments } from '@/components/editor/settings/Segments';
import { SettingsGroup } from '@/components/editor/settings/SettingsGroup';
import { SettingsParameters } from '@/components/editor/settings/useSettings';
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
    settings: SettingsParameters;
}

export const Settings: React.FC<SettingsProps> = ({
    settings: {
        mode,
        setMode,
        redDyeColor,
        setRedDyeColor,
        greenDyeColor,
        setGreenDyeColor,
        blueDyeColor,
        setBlueDyeColor,
        contrast,
        setContrast,
        sensitivity,
        setSensitivity,
        grainSize,
        setGrainSize,
        grainCount,
        setGrainCount,
        sharpness,
        setSharpness,
    },
}) => {
    return (
        <>
            <SettingsGroup legend="Цвет">
                <Segments name="Цвет">
                    <Segments.Segment
                        onClick={() => setMode('grayscale')}
                        isSelected={mode === 'grayscale'}
                    >
                        Ч/Б
                    </Segments.Segment>
                    <Segments.Segment
                        onClick={() => setMode('color')}
                        isSelected={mode === 'color'}
                    >
                        Цвет
                    </Segments.Segment>
                </Segments>
            </SettingsGroup>
            {mode === 'color' && (
                <SettingsGroup
                    legend="Цвет красителя"
                    hint={
                        <>
                            <p>
                                {'Выберите цвет красителя для каждого канала.'}
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
                        value={redDyeColor}
                        onChange={setRedDyeColor}
                        defaultColor={DEFAULT_COLORS.red}
                    />
                    <ColorPicker
                        title="Зеленый канал"
                        value={greenDyeColor}
                        onChange={setGreenDyeColor}
                        defaultColor={DEFAULT_COLORS.green}
                    />

                    <ColorPicker
                        title="Синий канал"
                        value={blueDyeColor}
                        onChange={setBlueDyeColor}
                        defaultColor={DEFAULT_COLORS.blue}
                    />
                </SettingsGroup>
            )}
            <SettingsGroup legend="Контраст">
                <Range
                    max={Contrast.max}
                    min={Contrast.min}
                    step={Contrast.step}
                    value={contrast}
                    onChange={setContrast}
                />
            </SettingsGroup>
            <SettingsGroup legend="Светочувствительность">
                <Range
                    max={Sensitivity.max}
                    min={Sensitivity.min}
                    step={Sensitivity.step}
                    value={sensitivity}
                    onChange={setSensitivity}
                />
            </SettingsGroup>
            <SettingsGroup legend="Размер зерна">
                <Range
                    max={GrainSize.max}
                    min={GrainSize.min}
                    step={GrainSize.step}
                    value={grainSize}
                    onChange={setGrainSize}
                />
            </SettingsGroup>
            <SettingsGroup legend="Плотность зерна">
                <Range
                    max={GrainCount.max}
                    min={GrainCount.min}
                    step={GrainCount.step}
                    value={grainCount}
                    onChange={setGrainCount}
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
                    value={sharpness}
                    onChange={setSharpness}
                />
            </SettingsGroup>
        </>
    );
};
