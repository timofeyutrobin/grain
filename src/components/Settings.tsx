import { GrainSize } from '@/lib/common';
import { Color, defaultColors, RenderMode } from '@/lib/grainRenderParameters';
import { colord } from 'colord';
import React from 'react';
import { SettingsGroup } from './SettingsGroup';

interface SettingsProps {
    mode: RenderMode;
    onModeChange: (mode: RenderMode) => void;

    redDyeColor: Color;
    onRedDyeColorChange: (hue: Color) => void;
    greenDyeColor: Color;
    onGreenDyeColorChange: (hue: Color) => void;
    blueDyeColor: Color;
    onBlueDyeColorChange: (hue: Color) => void;

    grainSize: GrainSize;
    onGrainSizeChange: (grainSize: GrainSize) => void;

    grainSpread: number;
    onGrainSpreadChange: (grainSpreading: number) => void;
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
    grainSpread,
    onGrainSpreadChange,
}) => {
    const select = (m: RenderMode) => {
        onModeChange(m);
    };

    return (
        <>
            <div className="flex" role="radiogroup" aria-label="Color mode">
                <button
                    type="button"
                    role="radio"
                    aria-checked={mode === 'grayscale'}
                    onClick={() => select('grayscale')}
                    className={`grow px-4 py-2 text-sm border transition-colors focus:outline-none cursor-pointer ${
                        mode === 'grayscale' &&
                        'bg-amber-300  border-amber-300 hover:bg-amber-300 text-zinc-800'
                    }`}
                >
                    Grayscale
                </button>
                <button
                    type="button"
                    role="radio"
                    aria-checked={mode === 'color'}
                    onClick={() => select('color')}
                    className={`grow px-4 py-2 text-sm border transition-colors focus:outline-none cursor-pointer ${
                        mode === 'color' &&
                        'bg-amber-300  border-amber-300 hover:bg-amber-300 text-zinc-800'
                    }`}
                >
                    Color
                </button>
            </div>
            <SettingsGroup legend="Grain size" ariaLabel="Grain size">
                <input
                    className="w-full"
                    type="range"
                    max={GrainSize.LARGE}
                    min={GrainSize.SMALL}
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
                    max={4}
                    min={1}
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
