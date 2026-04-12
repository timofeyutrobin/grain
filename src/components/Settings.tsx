import { Microscope } from '@/components/Microscope';
import { Segments } from '@/components/Segments';
import { SettingsGroup } from '@/components/SettingsGroup';
import {
    Color,
    defaultColors,
    GrainSize,
    GrainSpread,
    RenderMode,
} from '@/lib/common';
import { CharacteristicCurveType } from '@/lib/grainRenderer/characteristicCurves';
import { GrainGeneratorType } from '@/lib/grainRenderer/grainGenerators';
import { GrainRenderParameters } from '@/lib/grainRenderer/grainRenderParameters';
import { colord } from 'colord';
import React from 'react';

interface SettingsProps {
    mode: RenderMode;
    onModeChange: (mode: RenderMode) => void;

    grainType: GrainGeneratorType;
    onGrainTypeChange: (grainType: GrainGeneratorType) => void;

    curveType: CharacteristicCurveType;
    onCurveTypeChange: (curveType: CharacteristicCurveType) => void;

    redDyeColor: Color;
    onRedDyeColorChange: (color: Color) => void;
    greenDyeColor: Color;
    onGreenDyeColorChange: (color: Color) => void;
    blueDyeColor: Color;
    onBlueDyeColorChange: (color: Color) => void;

    grainSize: GrainSize;
    onGrainSizeChange: (grainSize: GrainSize) => void;

    grainSpread: GrainSpread;
    onGrainSpreadChange: (grainSpreading: GrainSpread) => void;

    renderParameters: GrainRenderParameters;
}

export const Settings: React.FC<SettingsProps> = ({
    mode,
    onModeChange,
    grainType,
    onGrainTypeChange,
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
    grainSpread,
    onGrainSpreadChange,
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
            <SettingsGroup legend="Grain type">
                <Segments name="Grain type">
                    <Segments.Segment
                        isSelected={grainType === 'cubic'}
                        onClick={() => onGrainTypeChange('cubic')}
                    >
                        Cubic
                    </Segments.Segment>
                    <Segments.Segment
                        isSelected={grainType === 'tabular'}
                        onClick={() => onGrainTypeChange('tabular')}
                    >
                        Tabular (beta)
                    </Segments.Segment>
                </Segments>
            </SettingsGroup>
            <SettingsGroup legend="Characteristic curve">
                <Segments name="Characteristic curve">
                    <Segments.Segment
                        isSelected={curveType === 'linear'}
                        onClick={() => onCurveTypeChange('linear')}
                    >
                        Linear (test)
                    </Segments.Segment>
                    <Segments.Segment
                        isSelected={curveType === 'power'}
                        onClick={() => onCurveTypeChange('power')}
                    >
                        Power
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
                <input
                    className="w-full"
                    type="range"
                    max={GrainSize.l}
                    min={GrainSize.s}
                    step={1}
                    value={grainSize}
                    onChange={(e) =>
                        onGrainSizeChange(parseInt(e.target.value))
                    }
                />
            </SettingsGroup>
            <SettingsGroup
                legend="Grain spread"
                hint={
                    <>
                        Controls grain diffusion radius.
                        <br />
                        Affects percieved sharpness.
                    </>
                }
                ariaLabel="Grain spread"
            >
                <input
                    className="w-full"
                    type="range"
                    max={GrainSpread.xl}
                    min={GrainSpread.s}
                    step={1}
                    value={grainSpread}
                    onChange={(e) =>
                        onGrainSpreadChange(parseInt(e.target.value))
                    }
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
                    <div className="p-2 flex align-middle cursor-pointer hover:bg-zinc-600 transition-colors">
                        <label htmlFor="red-color" className="cursor-pointer">
                            Red channel
                        </label>
                        <button
                            title="Restore default"
                            className="ml-auto mr-1 text-xs text-amber-300 underline cursor-pointer"
                            onClick={() =>
                                onRedDyeColorChange(defaultColors.red)
                            }
                        >
                            &#9166;
                        </button>
                        <input
                            id="red-color"
                            type="color"
                            value={colord(redDyeColor).toHex()}
                            onChange={(event) =>
                                onRedDyeColorChange(
                                    colord(event.target.value).toHsv(),
                                )
                            }
                            className="mr-0 cursor-pointer"
                        />
                    </div>
                    <div className="p-2 flex align-middle cursor-pointer hover:bg-zinc-600 transition-colors">
                        <label htmlFor="green-color" className="cursor-pointer">
                            Green channel
                        </label>
                        <button
                            title="Restore default"
                            className="ml-auto mr-1 text-xs text-amber-300 underline cursor-pointer"
                            onClick={() =>
                                onGreenDyeColorChange(defaultColors.green)
                            }
                        >
                            &#9166;
                        </button>
                        <input
                            id="green-color"
                            type="color"
                            value={colord(greenDyeColor).toHex()}
                            onChange={(event) =>
                                onGreenDyeColorChange(
                                    colord(event.target.value).toHsv(),
                                )
                            }
                            className="mr-0 cursor-pointer"
                        />
                    </div>
                    <div className="p-2 flex align-middle cursor-pointer hover:bg-zinc-600 transition-colors">
                        <label htmlFor="blue-color" className="cursor-pointer">
                            Blue channel
                        </label>
                        <button
                            title="Restore default"
                            className="ml-auto mr-1 text-xs text-amber-300 underline cursor-pointer"
                            onClick={() =>
                                onBlueDyeColorChange(defaultColors.blue)
                            }
                        >
                            &#9166;
                        </button>
                        <input
                            id="blue-color"
                            type="color"
                            value={colord(blueDyeColor).toHex()}
                            onChange={(event) => {
                                console.log(event.target.value);
                                onBlueDyeColorChange(
                                    colord(event.target.value).toHsv(),
                                );
                            }}
                            className="mr-0 cursor-pointer"
                        />
                    </div>
                </SettingsGroup>
            )}
        </>
    );
};
