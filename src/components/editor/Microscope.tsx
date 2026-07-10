import { isError } from '@/lib/common';
import { convertFloatToUint8RgbToRgba } from '@/lib/convert';
import {
    GrainRenderer,
    GrainRenderParameters,
} from '@/lib/grainRenderer/GrainRenderer';
import { generateSampleImageBuffer } from '@/lib/image';
import { useEffect, useRef, useState } from 'react';

const SCALE = 15;
function magnifyGrain(
    renderParameters: GrainRenderParameters,
): GrainRenderParameters {
    return {
        layers: renderParameters.layers.map((layer) => ({
            ...layer,
            grainSize: layer.grainSize * SCALE,
        })),
    };
}

interface MicroscopeProps {
    width: number;
    height: number;
    renderParameters: GrainRenderParameters;
}

export const Microscope: React.FC<MicroscopeProps> = ({
    width,
    height,
    renderParameters,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [sampleImage, setSampleImage] = useState<ImageBitmap | null>(null);
    const [renderer, setRenderer] = useState<GrainRenderer | null>(null);

    useEffect(() => {
        if (!canvasRef.current) {
            return;
        }

        try {
            setRenderer(
                new GrainRenderer(
                    canvasRef.current.transferControlToOffscreen(),
                ),
            );
        } catch (error) {
            if (isError(error) && error.name === 'InvalidStateError') {
                return;
            }
            throw error;
        }

        createImageBitmap(
            new ImageData(
                convertFloatToUint8RgbToRgba(
                    generateSampleImageBuffer(width, height),
                ),
                Math.floor(width),
                Math.floor(height),
            ),
        ).then((image) => {
            setSampleImage(image);
        });

        return () => {
            sampleImage?.close();
        };
    }, []);

    useEffect(() => {
        if (!renderer || !sampleImage) {
            return;
        }

        renderer.render(sampleImage, magnifyGrain(renderParameters));
    }, [renderParameters, renderer, sampleImage, width, height]);

    return (
        <canvas
            className="brightness-250"
            width={width}
            height={height}
            ref={canvasRef}
        />
    );
};
