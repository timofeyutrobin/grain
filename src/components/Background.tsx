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
        let time = 0;

        const cols = 80;
        const rows = 80;
        const ampX = 25;
        const ampY = 25;
        const freq = 0.1;
        const dotSize = 2;
        const timeScale = 0.01;

        const draw = () => {
            const logicalWidth = canvas.width / dpr;
            const logicalHeight = canvas.height / dpr;
            const spacing = logicalWidth / cols;

            ctx.clearRect(0, 0, logicalWidth, logicalHeight);

            ctx.fillStyle = 'rgba(100, 180, 255, 0.5)';
            const timeFreq = time * timeScale;

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

                    ctx.fillRect(
                        posX - dotSize / 2,
                        posY - dotSize / 2,
                        dotSize,
                        dotSize,
                    );
                }
            }

            time++;
            animationId = requestAnimationFrame(draw);
        };

        draw();

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
