import { Microscope } from '@/components/Microscope';
import { ColorPicker } from '@/components/settings/ColorPicker';
import { Range } from '@/components/settings/Range';
import { Segments } from '@/components/settings/Segments';
import { SettingsGroup } from '@/components/settings/SettingsGroup';
import {
    ColorHSV,
    defaultColors,
    GrainCount,
    GrainSize,
    RenderMode,
} from '@/lib/common';
import { CharacteristicCurveType } from '@/lib/grainRenderer/characteristicCurves';
import { RandomSpawnGrainRenderParameters } from '@/lib/grainRenderer/randomSpawn/RandomSpawnRenderer';
import React from 'react';

interface SettingsProps {
    mode: RenderMode;
    onModeChange: (mode: RenderMode) => void;

    curveType: CharacteristicCurveType;
    onCurveTypeChange: (curveType: CharacteristicCurveType) => void;

    redDyeColor: ColorHSV;
    onRedDyeColorChange: (color: ColorHSV) => void;
    greenDyeColor: ColorHSV;
    onGreenDyeColorChange: (color: ColorHSV) => void;
    blueDyeColor: ColorHSV;
    onBlueDyeColorChange: (color: ColorHSV) => void;

    grainSize: GrainSize;
    onGrainSizeChange: (grainSize: GrainSize) => void;

    grainCount: GrainCount;
    onGrainCountChange: (grainSpreading: GrainCount) => void;

    renderParameters: RandomSpawnGrainRenderParameters;
}

export const Settings: React.FC<SettingsProps> = ({
    mode,
    onModeChange,
    curveType,
    onCurveTypeChange,
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
            <SettingsGroup legend="Mode">
                <Segments name="Color mode">
                    <Segments.Segment
                        isSelected={mode === 'grayscale'}
                        onClick={() => onModeChange('grayscale')}
                    >
                        Grayscale
                    </Segments.Segment>
                    <Segments.Segment
                        isSelected={mode === 'color'}
                        onClick={() => onModeChange('color')}
                    >
                        Color
                    </Segments.Segment>
                </Segments>
            </SettingsGroup>
            <SettingsGroup legend="Characteristic curve">
                <Segments name="Characteristic curve">
                    <Segments.Segment
                        isSelected={curveType === 'sigmoid'}
                        onClick={() => onCurveTypeChange('sigmoid')}
                    >
                        Sigmoid
                    </Segments.Segment>
                </Segments>
            </SettingsGroup>
            <SettingsGroup
                legend="Microscope"
                hint={<>Shows grain structure at high magnification</>}
            >
                <div className="flex w-full h-full">
                    <div className="m-auto">
                        <Microscope
                            width={240}
                            height={240}
                            renderParameters={renderParameters}
                        />
                    </div>
                </div>
            </SettingsGroup>
            <SettingsGroup legend="Grain size" ariaLabel="Grain size">
                <Range
                    max={GrainSize.l}
                    min={GrainSize.s}
                    step={1}
                    value={grainSize}
                    onChange={onGrainSizeChange}
                />
            </SettingsGroup>
            <SettingsGroup legend="Grain count" ariaLabel="Grain count">
                <Range
                    max={GrainCount.l}
                    min={GrainCount.s}
                    step={1}
                    value={grainCount}
                    onChange={onGrainCountChange}
                />
            </SettingsGroup>
            {mode === 'color' && (
                <SettingsGroup
                    legend="Dye color"
                    hint={
                        <>
                            Set dye color for each channel (R, G, B).
                            <br />
                            This dye will be used to color the grain.
                            <br />
                            For better result don't set too bright and saturated
                            color.
                        </>
                    }
                    ariaLabel="Channels dye color"
                >
                    <ColorPicker
                        title="Red channel"
                        value={redDyeColor}
                        onChange={onRedDyeColorChange}
                        defaultColor={defaultColors.red}
                    />
                    <ColorPicker
                        title="Green channel"
                        value={greenDyeColor}
                        onChange={onGreenDyeColorChange}
                        defaultColor={defaultColors.green}
                    />
                    <ColorPicker
                        title="Blue channel"
                        value={blueDyeColor}
                        onChange={onBlueDyeColorChange}
                        defaultColor={defaultColors.blue}
                    />
                </SettingsGroup>
            )}
        </>
    );
};
