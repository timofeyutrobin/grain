import { isError, PropsWithClassName } from '@/lib/common';
import {
    GrainRenderer,
    GrainRenderParameters,
} from '@/lib/rendering/grainRenderer/GrainRenderer';
import classNames from 'classnames';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const SCALE = 10;
function magnifyGrain(
    renderParameters: GrainRenderParameters,
): GrainRenderParameters {
    return {
        ...renderParameters,
        layers: renderParameters.layers.map((layer) => ({
            ...layer,
            grainSize: layer.grainSize * SCALE,
        })),
    };
}

interface MicroscopeProps {
    width: number;
    height: number;
    image?: ImageBitmap | null;
    renderParameters: GrainRenderParameters;
}

export const Microscope: React.FC<PropsWithClassName<MicroscopeProps>> = ({
    className,
    width,
    height,
    image,
    renderParameters,
}) => {
    const [sampleImage, setSampleImage] = useState<ImageBitmap | null>(null);
    const [renderer, setRenderer] = useState<GrainRenderer | null>(null);

    const [scaledImage, setScaledImage] = useState<ImageBitmap | null>(null);
    const [scaledRenderer, setScaledRenderer] = useState<GrainRenderer | null>(
        null,
    );

    useEffect(() => {
        if (!image) {
            return;
        }
        createImageBitmap(
            image,
            width / 2,
            height / 2,
            width / SCALE,
            height / SCALE,
            {
                resizeWidth: width / 2,
                resizeHeight: width / 2,
            },
        ).then((image) => {
            setScaledImage(image);
        });
    }, [image]);

    useEffect(
        () => () => {
            sampleImage?.close();
        },
        [sampleImage],
    );

    useEffect(
        () => () => {
            scaledImage?.close();
        },
        [scaledImage],
    );

    useEffect(() => {
        if (!renderer || !sampleImage || !scaledRenderer || !scaledImage) {
            return;
        }

        const timer = window.setTimeout(() => {
            renderer.render(image ?? sampleImage, renderParameters);
            scaledRenderer.render(scaledImage, magnifyGrain(renderParameters));
        }, 200);

        return () => {
            window.clearTimeout(timer);
        };
    }, [renderParameters, renderer, sampleImage, image, scaledImage]);

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
                            new GrainRenderer(
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
                            new GrainRenderer(
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
            <Image
                preload
                className="hidden"
                src="/images/sunflowers.jpeg"
                alt="sunflowers"
                width={width}
                height={height}
                onLoad={(e) => {
                    createImageBitmap(e.currentTarget, {
                        imageOrientation: 'flipY',
                    }).then((image) => {
                        setSampleImage(image);
                    });
                    createImageBitmap(
                        e.currentTarget,
                        width / 2 - width / SCALE / 2,
                        height / 2 - height / SCALE / 2,
                        width / SCALE,
                        height / SCALE,
                        {
                            imageOrientation: 'flipY',
                            resizeWidth: width / 2,
                            resizeHeight: width / 2,
                        },
                    ).then((image) => {
                        setScaledImage(image);
                    });
                }}
            />
        </div>
    );
};
