import { Graph } from '@/components/editor/Graph';
import { Microscope } from '@/components/editor/Microscope';
import { ColorPicker } from '@/components/editor/settings/ColorPicker';
import { Range } from '@/components/editor/settings/Range';
import { Segments } from '@/components/editor/settings/Segments';
import { SettingsGroup } from '@/components/editor/settings/SettingsGroup';
import {
    Color,
    defaultColors,
    GrainCount,
    GrainSize,
    RenderMode,
    Sharpness,
} from '@/lib/common';
import { GrainRenderParameters } from '@/lib/rendering/grainRenderer/GrainRenderer';
import React from 'react';

interface SettingsProps {
    mode: RenderMode;
    onModeChange: (mode: RenderMode) => void;

    redDyeColor: Color;
    onRedDyeColorChange: (color: Color) => void;
    greenDyeColor: Color;
    onGreenDyeColorChange: (color: Color) => void;
    blueDyeColor: Color;
    onBlueDyeColorChange: (color: Color) => void;

    grainSize: GrainSize;
    onGrainSizeChange: (grainSize: GrainSize) => void;

    grainCount: GrainCount;
    onGrainCountChange: (grainSpreading: GrainCount) => void;

    sharpness: Sharpness;
    onSharpnessChange: (sharpness: Sharpness) => void;

    contrast: number;
    onContrastChange: (contrast: number) => void;

    renderParameters: GrainRenderParameters;
}

export const Settings: React.FC<SettingsProps> = ({
    mode,
    onModeChange,
    redDyeColor,
    onRedDyeColorChange,
    greenDyeColor,
    onGreenDyeColorChange,
    blueDyeColor,
    onBlueDyeColorChange,
    grainSize,
    onGrainSizeChange,
    grainCount,
    onGrainCountChange,
    sharpness,
    onSharpnessChange,
    contrast,
    onContrastChange,
    renderParameters,
}) => {
    return (
        <>
            <SettingsGroup legend="Цвет">
                <Segments name="Цвет">
                    <Segments.Segment
                        onClick={() => onModeChange('grayscale')}
                        isSelected={mode === 'grayscale'}
                    >
                        Ч/Б
                    </Segments.Segment>
                    <Segments.Segment
                        onClick={() => onModeChange('color')}
                        isSelected={mode === 'color'}
                    >
                        Цвет
                    </Segments.Segment>
                </Segments>
            </SettingsGroup>
            <SettingsGroup
                legend="Микроскоп"
                hint="Показывает структуру зерна под большим увеличением"
            >
                <div className="flex w-full h-full">
                    <Microscope
                        className="m-auto"
                        renderParameters={renderParameters}
                        width={240}
                        height={240}
                    />
                </div>
            </SettingsGroup>
            <SettingsGroup legend="Распределение вероятностей">
                <div className="flex w-full h-full">
                    <Graph
                        className="m-auto border-l-2 border-b-2 border-stone-300"
                        width={240}
                        height={240}
                        renderParameters={renderParameters}
                    />
                </div>
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
                        onChange={onRedDyeColorChange}
                        defaultColor={defaultColors.red}
                    />
                    <ColorPicker
                        title="Зеленый канал"
                        value={greenDyeColor}
                        onChange={onGreenDyeColorChange}
                        defaultColor={defaultColors.green}
                    />
                    <ColorPicker
                        title="Синий канал"
                        value={blueDyeColor}
                        onChange={onBlueDyeColorChange}
                        defaultColor={defaultColors.blue}
                    />
                </SettingsGroup>
            )}
            <SettingsGroup legend="Контраст">
                <Range
                    max={0.9}
                    min={0.3}
                    step={0.2}
                    value={contrast}
                    onChange={onContrastChange}
                />
            </SettingsGroup>
            <SettingsGroup legend="Размер зерна">
                <Range
                    max={GrainSize.l}
                    min={GrainSize.s}
                    step={1}
                    value={grainSize}
                    onChange={onGrainSizeChange}
                />
            </SettingsGroup>
            <SettingsGroup legend="Плотность зерна">
                <Range
                    max={GrainCount.l}
                    min={GrainCount.s}
                    step={1}
                    value={grainCount}
                    onChange={onGrainCountChange}
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
                    onChange={onSharpnessChange}
                />
            </SettingsGroup>
        </>
    );
};
