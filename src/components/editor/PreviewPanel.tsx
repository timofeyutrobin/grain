import { Button } from '@/components/button/Button';
import { Graph } from '@/components/editor/Graph';
import { Microscope } from '@/components/editor/Microscope';
import { SettingsGroup } from '@/components/editor/settings/SettingsGroup';
import { Color, PREVIEW_SIZE, PropsWithClassName } from '@/lib/common';
import {
    GrainRenderParameters,
    Layer,
} from '@/lib/rendering/grainRenderer/GrainRenderer';
import { getColorForLayer } from '@/lib/rendering/graphRenderer/graphColors';
import classNames from 'classnames';
import Image from 'next/image';
import React from 'react';

interface PreviewPanelProps {
    renderParameters: GrainRenderParameters;
    image?: ImageBitmap | null;
    open?: boolean;
    toggleOpen: () => void;
}

export const PreviewPanel: React.FC<PropsWithClassName<PreviewPanelProps>> = ({
    className,
    renderParameters,
    image,
    open,
    toggleOpen,
}) => {
    return (
        <aside
            className={classNames(
                'flex flex-col items-center bg-zinc-800',
                className,
            )}
        >
            <Button
                small
                className="block xl:hidden absolute inset-y-0 h-16 my-auto left-0 -translate-x-full px-2 border-0 rounded-l-md bg-zinc-800 text-inherit text-lg font-bold"
                onClick={toggleOpen}
            >
                {open ? '>' : '<'}
            </Button>
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
                            renderParameters={renderParameters}
                        />
                    </section>
                    <section className="mt-8 mb-2">
                        <header className="flex justify-between items-baseline mb-2 pb-2 border-b-1 border-zinc-500">
                            <h2 className="font-semibold">Слои эмульсии</h2>
                            <i className="text-sm text-zinc-300 not-italic">
                                Размер зерна
                            </i>
                        </header>
                        {renderParameters.colorParameters ? (
                            <>
                                <div className="p-4 bg-red-700/20">
                                    {renderParameters.layers.map(
                                        (layer, index) => (
                                            <LayerParameters
                                                key={layer.id}
                                                layer={layer}
                                                color={getColorForLayer(index)}
                                            />
                                        ),
                                    )}
                                </div>
                                <div className="mt-4 p-4 bg-green-700/20">
                                    {renderParameters.layers.map(
                                        (layer, index) => (
                                            <LayerParameters
                                                key={layer.id}
                                                layer={layer}
                                                color={getColorForLayer(index)}
                                            />
                                        ),
                                    )}
                                </div>
                                <div className="mt-4 p-4 bg-blue-700/20">
                                    {renderParameters.layers.map(
                                        (layer, index) => (
                                            <LayerParameters
                                                key={layer.id}
                                                layer={layer}
                                                color={getColorForLayer(index)}
                                            />
                                        ),
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="p-4 bg-zinc-900">
                                {renderParameters.layers.map((layer, index) => (
                                    <LayerParameters
                                        key={layer.id}
                                        layer={layer}
                                        color={getColorForLayer(index)}
                                    />
                                ))}
                            </div>
                        )}
                    </section>
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
    layer: Layer;
    color: Color;
}

const LayerParameters: React.FC<LayerParametersProps> = ({ layer, color }) => (
    <div className="flex justify-between items-center">
        <span
            className="inline-block w-1/4 h-[4px]"
            style={{
                backgroundColor: `rgb(${color.r * 255},${color.g * 255},${color.b * 255})`,
            }}
        />
        <i className="not-italic text-sm font-mono">
            a = {layer.contrast.toFixed(2)}
        </i>
        <i className="not-italic text-sm font-mono">
            b = {layer.sensitivity.toFixed(2)}
        </i>
        <i className="not-italic text-sm font-mono">{layer.grainSize}px</i>
    </div>
);
