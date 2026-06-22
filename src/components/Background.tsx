import { PropsWithClassName } from '@/lib/common';
import React, { useEffect, useRef } from 'react';

export const Background: React.FC<PropsWithClassName> = ({ className }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) {
            return;
        }

        const dpr = window.devicePixelRatio || 1;

        const resizeCanvas = () => {
            const parent = canvas.parentElement || canvas;
            const width =
                parent.clientWidth || parent.offsetWidth || window.innerWidth;
            const height =
                parent.clientHeight ||
                parent.offsetHeight ||
                window.innerHeight;
            canvas.width = Math.max(1, Math.floor(width * dpr));
            canvas.height = Math.max(1, Math.floor(height * dpr));
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };

        resizeCanvas();

        let animationId: number = 0;
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
                const timeFreq = timestamp * 0.0001;

                const logicalWidth = canvas.width / dpr;
                const logicalHeight = canvas.height / dpr;
                if (logicalWidth <= 0 || logicalHeight <= 0) {
                    start = timestamp;
                    animationId = requestAnimationFrame(draw);
                    return;
                }
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

        const ro = new ResizeObserver(() => resizeCanvas());
        ro.observe(canvas);

        const handleResize = () => resizeCanvas();
        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', handleResize);
            ro.disconnect();
        };
    }, []);

    return <canvas ref={canvasRef} className={className} />;
};
