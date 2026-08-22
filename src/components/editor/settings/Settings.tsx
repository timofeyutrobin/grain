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
} from '@/lib/common';
import { GrainRenderParameters } from '@/lib/grainRenderer/GrainRenderer';
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
    renderParameters,
}) => {
    return (
        <>
            <SettingsGroup
                legend="Микроскоп"
                hint={<>Показывает структуру зерна под большим увеличением</>}
            >
                <div className="flex w-full h-full">
                    <div className="m-auto">
                        <Microscope
                            renderParameters={renderParameters}
                            width={240}
                            height={240}
                        />
                    </div>
                </div>
            </SettingsGroup>
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
            {mode === 'color' && (
                <SettingsGroup
                    legend="Цвет красителя"
                    hint={
                        <>
                            Выберите цвет красителя для каждого канала (R, G,
                            B).
                            <br />
                            Выбранные цвета будут использоваться для окраски
                            зерна
                            <br />
                            Для лучшего результата рекомендуется не выставлять
                            слишком яркий и насыщенный цвет
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
        </>
    );
};
