import { isError } from '@/lib/common';
import { convertFloatToUint8RgbToRgba } from '@/lib/convert';
import {
    RandomSpawnShaderRenderer,
    RandomSpawnShaderRenderParameters,
} from '@/lib/grainRenderer/randomSpawnShader/RandomSpawnShaderRenderer';
import { generateSampleImageBuffer } from '@/lib/image';
import { useEffect, useRef, useState } from 'react';

const SCALE = 15;
function magnifyGrain(
    renderParameters: RandomSpawnShaderRenderParameters,
): RandomSpawnShaderRenderParameters {
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
    renderParameters: RandomSpawnShaderRenderParameters;
}

export const Microscope: React.FC<MicroscopeProps> = ({
    width,
    height,
    renderParameters,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [sampleImage, setSampleImage] = useState<ImageBitmap | null>(null);
    const [renderer, setRenderer] = useState<RandomSpawnShaderRenderer | null>(
        null,
    );

    useEffect(() => {
        if (!canvasRef.current) {
            return;
        }

        try {
            setRenderer(
                new RandomSpawnShaderRenderer(
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
