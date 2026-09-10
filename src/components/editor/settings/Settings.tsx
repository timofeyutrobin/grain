import { ColorPicker } from '@/components/editor/settings/ColorPicker';
import { Range } from '@/components/editor/settings/Range';
import { Segments } from '@/components/editor/settings/Segments';
import { SettingsGroup } from '@/components/editor/settings/SettingsGroup';
import { SettingsParameters } from '@/components/editor/settings/useSettings';
import { DEFAULT_COLORS, GrainCount, GrainSize, Sharpness } from '@/lib/common';
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
                    max={0.9}
                    min={0.3}
                    step={0.2}
                    value={contrast}
                    onChange={setContrast}
                />
            </SettingsGroup>
            <SettingsGroup legend="Размер зерна">
                <Range
                    max={GrainSize.l}
                    min={GrainSize.s}
                    step={1}
                    value={grainSize}
                    onChange={setGrainSize}
                />
            </SettingsGroup>
            <SettingsGroup legend="Плотность зерна">
                <Range
                    max={GrainCount.l}
                    min={GrainCount.s}
                    step={1}
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
                    max={Sharpness.sharp}
                    min={Sharpness.blurry}
                    step={1}
                    value={sharpness}
                    onChange={setSharpness}
                />
            </SettingsGroup>
        </>
    );
};
