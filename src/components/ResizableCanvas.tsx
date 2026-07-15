import { PropsWithClassName } from '@/lib/common';
import { RefObject, useEffect, useRef } from 'react';

export interface ResizableCanvasProps {
    ref?: RefObject<HTMLCanvasElement | null>;
    onResize?: (width: number, height: number) => void;
}

export const ResizableCanvas: React.FC<
    PropsWithClassName<ResizableCanvasProps>
> = ({ className, ref, onResize }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }

        const resizeCanvas = () => {
            const width = Math.floor(canvas.clientWidth);
            const height = Math.floor(canvas.clientHeight);
            onResize?.(width, height);
            if (width !== canvas.width) {
                canvas.width = width;
            }
            if (height !== canvas.height) {
                canvas.height = height;
            }
        };

        resizeCanvas();

        const handleResize = () => resizeCanvas();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [onResize]);

    return (
        <canvas
            className={className}
            ref={(canvasElement) => {
                canvasRef.current = canvasElement;
                if (ref) {
                    ref.current = canvasElement;
                }
            }}
        />
    );
};
