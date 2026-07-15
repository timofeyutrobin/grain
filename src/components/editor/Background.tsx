import { ResizableCanvas } from '@/components/ResizableCanvas';
import { PropsWithClassName } from '@/lib/common';
import React, { useEffect, useRef } from 'react';

export const Background: React.FC<PropsWithClassName> = ({ className }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rows = useRef<number>(0);
    const cols = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) {
            return;
        }

        let animationId: number = 0;
        let start = 0;

        const freq = 0.2;
        const dotSize = 2;
        const duration = 1000 / 16;

        const draw = async (timestamp: DOMHighResTimeStamp) => {
            if (!start) {
                start = timestamp;
            }
            const value = (timestamp - start) / duration;
            const width = canvas.width;
            const height = canvas.height;
            const ampX = cols.current / 2.5;
            const ampY = rows.current / 2.5;

            if (value > 1) {
                const timeFreq = timestamp * 0.0001;

                if (width <= 0 || height <= 0) {
                    start = timestamp;
                    animationId = requestAnimationFrame(draw);
                    return;
                }

                const spacing = width / cols.current;

                ctx.clearRect(0, 0, width, height);

                for (let x = 0; x < cols.current; x++) {
                    const baseX = x * spacing;
                    const xPhase = x * freq;
                    for (let y = 0; y < rows.current; y++) {
                        const baseY = y * spacing;
                        const phaseShift = xPhase + y * freq;

                        const offsetX = Math.sin(phaseShift + timeFreq) * ampX;
                        const offsetY = Math.cos(phaseShift + timeFreq) * ampY;

                        const posX = baseX + offsetX;
                        const posY = baseY + offsetY;

                        const hue = (phaseShift * 60 + timeFreq * 100) % 360;
                        ctx.fillStyle = `hsla(${hue}, 25%, 50%, 0.3)`;

                        ctx.fillRect(
                            posX - dotSize / 2,
                            posY - dotSize / 2,
                            dotSize,
                            dotSize,
                        );
                    }
                }

                start = timestamp;
            }

            animationId = requestAnimationFrame(draw);
        };

        requestAnimationFrame(draw);

        return () => {
            cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <ResizableCanvas
            onResize={(width, height) => {
                cols.current = Math.floor(width / 24);
                rows.current = Math.floor(height / 24);
            }}
            ref={canvasRef}
            className={className}
        />
    );
};
