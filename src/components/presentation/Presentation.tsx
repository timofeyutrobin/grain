import { Scene } from '@/components/presentation/Scene';
import { clamp } from '@/lib/common';
import { Canvas } from '@react-three/fiber';
import { useState } from 'react';

export const Presentation: React.FC<{ className?: string }> = ({
    className,
}) => {
    const slidesCount = 3;
    const [currentSlide, setCurrentSlide] = useState(0);

    return (
        <div className={className}>
            <Canvas camera={{ fov: 45, far: 60 }}>
                <ambientLight />
                <Scene currentSlide={currentSlide} />
            </Canvas>
            <button
                onClick={() =>
                    setCurrentSlide(clamp(currentSlide - 1, 0, slidesCount - 1))
                }
                className="absolute top-1/2 -translate-y-1/2 left-4 px-4 py-12 text-4xl border border-stone-100 text-stone-100 cursor-pointer hover:bg-stone-600"
            >
                &lt;
            </button>
            <button
                onClick={() =>
                    setCurrentSlide(clamp(currentSlide + 1, 0, slidesCount - 1))
                }
                className="absolute top-1/2 -translate-y-1/2 right-4 px-4 py-12 text-4xl border border-stone-100 text-stone-100 cursor-pointer hover:bg-stone-600"
            >
                &gt;
            </button>
        </div>
    );
};
