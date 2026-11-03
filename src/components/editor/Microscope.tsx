import { isError, PropsWithClassName } from '@/lib/common';
import { getLut } from '@/lib/lutService';
import { RenderPipeline } from '@/lib/rendering/RenderPipeline';
import { RenderParameters } from '@/lib/rendering/types';
import { useDB } from '@/lib/storage/useDB';
import classNames from 'classnames';
import { useEffect, useRef, useState } from 'react';

const SCALE = 10;
function magnifyGrain(renderParameters: RenderParameters): RenderParameters {
    return {
        ...renderParameters,
        grain: {
            ...renderParameters.grain,
            layers: renderParameters.grain.layers.map((layer) => ({
                ...layer,
                grainSize: layer.grainSize * SCALE,
            })),
        },
    };
}

interface MicroscopeProps {
    width: number;
    height: number;
    image?: ImageBitmap | null;
    renderParameters: RenderParameters | null;
}

export const Microscope: React.FC<PropsWithClassName<MicroscopeProps>> = ({
    className,
    width,
    height,
    image,
    renderParameters,
}) => {
    const database = useDB();
    const [renderer, setRenderer] = useState<RenderPipeline | null>(null);
    const [scaledImage, setScaledImage] = useState<ImageBitmap | null>(null);
    const [scaledRenderer, setScaledRenderer] = useState<RenderPipeline | null>(
        null,
    );

    const isRendering = useRef<boolean>(false);
    const renderVersion = useRef(0);
    const [renderSignal, setRenderSignal] = useState(0);
    const [lut, setLut] = useState<ImageBitmap | null>(null);

    useEffect(() => {
        if (!renderParameters) {
            return;
        }

        getLut(
            database.state === 'ready' ? database : null,
            renderParameters.color.lutUrl,
        )
            .then((lutImage) => setLut(lutImage))
            .catch((error) => console.error(error));

        return () => {
            lut?.close();
        };
    }, [renderParameters, database]);

    useEffect(() => {
        renderVersion.current += 1;
    }, [renderParameters, lut, image, scaledImage]);

    useEffect(() => {
        if (!image) {
            return;
        }
        createImageBitmap(
            image,
            width / 2 - width / SCALE / 2,
            height / 2 - height / SCALE / 2,
            width / SCALE,
            height / SCALE,
            {
                resizeWidth: width / 2,
                resizeHeight: width / 2,
            },
        ).then((image) => {
            setScaledImage(image);
        });

        return () => {
            scaledImage?.close();
        };
    }, [image]);

    useEffect(() => {
        if (
            !renderer ||
            !scaledRenderer ||
            !image ||
            !scaledImage ||
            isRendering.current ||
            !renderParameters ||
            !lut
        ) {
            return;
        }

        isRendering.current = true;

        const previousRenderVersion = renderVersion.current;

        const renderPromise = renderer.render(image, lut, renderParameters);
        const scaledRenderPromise = scaledRenderer.render(
            scaledImage,
            lut,
            magnifyGrain(renderParameters),
        );

        Promise.all([renderPromise, scaledRenderPromise])
            .catch((error) => {
                console.error(error);
            })
            .finally(() => {
                isRendering.current = false;

                if (renderVersion.current !== previousRenderVersion) {
                    setRenderSignal((signal) => signal + 1);
                }
            });
    }, [renderParameters, lut, renderer, image, scaledImage, renderSignal]);

    return (
        <div className={classNames('relative', className)}>
            <div
                style={{ width: width / SCALE, height: height / SCALE }}
                className="absolute inset-0 m-auto border border-stone-100 rounded-full backdrop-brightness-75 shadow-sm shadow-zinc-900"
            />
            <div className="absolute top-1/2 left-1/2 w-1/3 h-0 border-t-2 border-dashed border-stone-100 origin-left -rotate-45 translate-x-[10px] -translate-y-[10px]" />
            <canvas
                className="absolute -top-5 -right-8 border-2 rounded-full border-stone-100 shadow-md shadow-zinc-900"
                width={width / 2}
                height={height / 2}
                ref={(canvas) => {
                    if (!canvas) {
                        return;
                    }
                    try {
                        setScaledRenderer(
                            new RenderPipeline(
                                canvas.transferControlToOffscreen(),
                            ),
                        );
                    } catch (error) {
                        if (
                            isError(error) &&
                            error.name === 'InvalidStateError'
                        ) {
                            return;
                        }
                        throw error;
                    }
                }}
            />
            <canvas
                width={width}
                height={height}
                ref={(canvas) => {
                    if (!canvas) {
                        return;
                    }
                    try {
                        setRenderer(
                            new RenderPipeline(
                                canvas.transferControlToOffscreen(),
                            ),
                        );
                    } catch (error) {
                        if (
                            isError(error) &&
                            error.name === 'InvalidStateError'
                        ) {
                            return;
                        }
                        throw error;
                    }
                }}
            />
        </div>
    );
};
