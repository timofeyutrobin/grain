import { convertFloatToUint8RgbToRgba } from '@/lib/convert';
import { getGrainImage } from '@/lib/grain';
import { GrainRenderParameters } from '@/lib/grainRenderParameters';
import { generateSampleImageBuffer } from '@/lib/image';
import { useEffect, useRef } from 'react';

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

    const bufferWidth = Math.floor(width / 6);
    const bufferHeight = Math.floor(height / 6);
    const sampleImage = generateSampleImageBuffer(bufferWidth, bufferHeight);

    useEffect(() => {
        const canvas = canvasRef.current;

        if (!canvas) {
            return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            return;
        }

        createImageBitmap(
            new ImageData(
                convertFloatToUint8RgbToRgba(
                    getGrainImage(
                        {
                            width: bufferWidth,
                            height: bufferHeight,
                            pixels: sampleImage,
                        },
                        renderParameters,
                    ).pixels,
                ),
                bufferWidth * 2,
                bufferHeight * 2,
            ),
        ).then((bitmap) => {
            ctx.drawImage(bitmap, 0, 0, width, height);
        });
    }, [renderParameters]);

    return (
        <canvas
            className="saturate-500 brightness-175"
            width={width}
            height={height}
            ref={canvasRef}
        />
    );
};
