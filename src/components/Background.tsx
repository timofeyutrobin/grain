import React, { useEffect, useRef } from 'react';

export const Background: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) {
            return;
        }

        const parent = canvas.parentElement;
        const dpr = window.devicePixelRatio || 1;

        const resizeCanvas = () => {
            if (!parent) return;
            canvas.width = parent.offsetWidth * dpr;
            canvas.height = parent.offsetHeight * dpr;
            ctx.resetTransform();
            ctx.scale(dpr, dpr);
        };

        resizeCanvas();

        let animationId: number;
        let start = 0;

        const cols = 60;
        const rows = 60;
        const ampX = 25;
        const ampY = 25;
        const freq = 0.2;
        const dotSize = 2;
        const duration = 1000 / 16;

        const draw = async (timestamp: DOMHighResTimeStamp) => {
            if (!start) {
                start = timestamp;
            }
            const value = (timestamp - start) / duration;

            if (value > 1) {
                const timeFreq = timestamp * 0.0006;

                const logicalWidth = canvas.width / dpr;
                const logicalHeight = canvas.height / dpr;
                const spacing = logicalWidth / (cols / 1.2);

                ctx.clearRect(0, 0, logicalWidth, logicalHeight);

                for (let x = 0; x < cols; x++) {
                    const baseX = x * spacing;
                    const xPhase = x * freq;
                    for (let y = 0; y < rows; y++) {
                        const baseY = y * spacing;
                        const phaseShift = xPhase + y * freq;

                        const offsetX = Math.sin(phaseShift + timeFreq) * ampX;
                        const offsetY = Math.cos(phaseShift + timeFreq) * ampY;

                        const posX = baseX + offsetX;
                        const posY = baseY + offsetY;

                        const hue = (phaseShift * 60 + timeFreq * 100) % 360;
                        ctx.fillStyle = `hsl(${hue}, 50%, 50%)`;

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

        const handleResize = () => {
            resizeCanvas();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full"
        />
    );
};
