import { Button } from '@/components/button/Button';
import { Graph } from '@/components/editor/Graph';
import { Microscope } from '@/components/editor/Microscope';
import { SettingsGroup } from '@/components/editor/settings/SettingsGroup';
import { Channel, Color, PREVIEW_SIZE, PropsWithClassName } from '@/lib/common';
import {
    GrainRenderParameters,
    Layer,
} from '@/lib/rendering/grainRenderer/GrainRenderer';
import {
    averageGraphColor,
    getColorForLayer,
} from '@/lib/rendering/graphRenderer/graphColors';
import { GraphRenderParameters } from '@/lib/rendering/graphRenderer/GraphRenderer';
import classNames from 'classnames';
import Image from 'next/image';
import React from 'react';

interface PreviewPanelProps {
    renderParameters: GrainRenderParameters | null;
    image?: ImageBitmap | null;
    open?: boolean;
    toggleOpen: () => void;
    isOpenButtonHidden?: boolean;
}

export const PreviewPanel: React.FC<PropsWithClassName<PreviewPanelProps>> = ({
    className,
    renderParameters,
    image,
    open,
    toggleOpen,
    isOpenButtonHidden,
}) => {
    let graphRenderParameters: GraphRenderParameters | null = null;

    if (renderParameters) {
        const { sumContrast, sumInvertedSensitivity } =
            renderParameters.layers.reduce(
                (sums, layer) => {
                    sums.sumContrast += layer.contrast;
                    sums.sumInvertedSensitivity += layer.invertedSensitivity;
                    return sums;
                },
                { sumContrast: 0, sumInvertedSensitivity: 0 },
            );
        graphRenderParameters = {
            ...renderParameters,
            avgContrast: sumContrast / renderParameters.layers.length,
            avgInvertedSensitivity:
                sumInvertedSensitivity / renderParameters.layers.length,
        };
    }

    return (
        <aside
            className={classNames(
                'flex flex-col items-center bg-zinc-800',
                className,
            )}
        >
            {!isOpenButtonHidden && (
                <Button
                    small
                    className="
                        block xl:hidden
                        absolute h-16 bottom-24
                        md:my-auto md:inset-y-0
                        left-0
                        -translate-x-full
                        px-2 border-l border-t border-b border-r-0 border-zinc-200 rounded-l-md
                        bg-zinc-800 text-inherit text-lg font-bold
                    "
                    onClick={toggleOpen}
                >
                    {open ? '>' : '<'}
                </Button>
            )}
            <section className="self-center w-full max-w-96 my-4 px-4 overflow-y-scroll space-y-4">
                <SettingsGroup
                    legend="Микроскоп"
                    hint="Показывает структуру зерна под большим увеличением"
                >
                    <div className="flex w-full h-full">
                        <Microscope
                            className="m-auto"
                            image={image}
                            renderParameters={renderParameters}
                            width={PREVIEW_SIZE}
                            height={PREVIEW_SIZE}
                        />
                    </div>
                </SettingsGroup>
                <SettingsGroup legend="Распределение вероятностей">
                    <div className="relative w-full h-[45px]">
                        <Image
                            fill
                            preload
                            loading="eager"
                            className="mx-auto"
                            src="/images/formula.svg"
                            alt="probability formula"
                        />
                    </div>
                    <i className="block text-sm mt-2 mb-4 md:text-sm not-italic">
                        a — контраст
                        <br />b — обратная чувствительность
                    </i>
                    <section className="flex w-full h-full">
                        <Graph
                            className="m-auto border-l-2 border-b-2 border-stone-200"
                            width={240}
                            height={240}
                            renderParameters={graphRenderParameters}
                        />
                    </section>
                    {renderParameters && graphRenderParameters && (
                        <section className="mt-8 mb-2">
                            <header className="flex justify-between items-baseline mb-2 pb-2 border-b-1 border-zinc-500">
                                <h2 className="font-semibold">Слои эмульсии</h2>
                                <i className="text-sm text-zinc-300 not-italic">
                                    Размер зерна
                                </i>
                            </header>
                            {renderParameters.colorParameters ? (
                                <div className="space-y-4">
                                    {Object.keys(
                                        renderParameters.colorParameters,
                                    ).map((channel) => (
                                        <Layers
                                            key={channel}
                                            channel={channel as Channel}
                                            layers={renderParameters.layers}
                                            avgContrast={
                                                graphRenderParameters.avgContrast
                                            }
                                            avgInvertedSensitivity={
                                                graphRenderParameters.avgInvertedSensitivity
                                            }
                                        />
                                    ))}
                                </div>
                            ) : (
                                <Layers
                                    channel="grayscale"
                                    layers={renderParameters.layers}
                                    avgContrast={
                                        graphRenderParameters.avgContrast
                                    }
                                    avgInvertedSensitivity={
                                        graphRenderParameters.avgInvertedSensitivity
                                    }
                                />
                            )}
                        </section>
                    )}
                </SettingsGroup>
            </section>
            <footer className="md:hidden max-w-96 w-full mt-auto p-4">
                <Button secondary small className="w-full" onClick={toggleOpen}>
                    Закрыть
                </Button>
            </footer>
        </aside>
    );
};

interface LayerParametersProps {
    contrast: number;
    invertedSensitivity: number;
    color: Color;
    grainSize?: number;
}

const LayerParameters: React.FC<LayerParametersProps> = ({
    contrast,
    invertedSensitivity,
    color,
    grainSize,
}) => (
    <div className="flex items-center gap-2">
        <span
            className="shrink-0 w-1/4 h-[4px]"
            style={{
                backgroundColor: `rgb(${color.r * 255},${color.g * 255},${color.b * 255})`,
            }}
        />
        <i className="flex-2 not-italic text-sm font-mono text-center">
            a = {contrast.toFixed(2)}
        </i>
        <i className="flex-2 not-italic text-sm font-mono text-center">
            b = {invertedSensitivity.toFixed(2)}
        </i>
        <i className="flex-1 not-italic text-sm font-mono text-end">
            {grainSize ? `${grainSize}px` : ''}
        </i>
    </div>
);

interface LayersProps {
    channel: Channel;
    layers: Layer[];
    avgContrast: number;
    avgInvertedSensitivity: number;
}

const Layers: React.FC<LayersProps> = ({
    layers,
    avgContrast,
    avgInvertedSensitivity,
    channel,
}) => {
    const style = {
        r: 'border-2 border-red-700/50',
        g: 'border-2 border-green-700/50',
        b: 'border-2 border-blue-700/50',
        grayscale: '',
    }[channel];
    return (
        <div className={classNames('p-4 bg-zinc-900', style)}>
            {layers.map((layer, index) => (
                <LayerParameters
                    key={layer.id}
                    contrast={layer.contrast}
                    invertedSensitivity={layer.invertedSensitivity}
                    grainSize={layer.grainSize}
                    color={getColorForLayer(index)}
                />
            ))}
            <p className="mt-2 text-sm text-zinc-300">Среднее:</p>
            <LayerParameters
                contrast={avgContrast}
                invertedSensitivity={avgInvertedSensitivity}
                color={averageGraphColor}
            />
        </div>
    );
};
