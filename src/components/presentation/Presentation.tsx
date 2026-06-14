import { Button } from '@/components/button/Button';
import { Scene } from '@/components/presentation/Scene';
import { clamp } from '@/lib/common';
import welcomeTourStateAtom, {
    WelcomeIntroState,
} from '@/lib/storage/welcomeTourStateAtom';
import { Canvas } from '@react-three/fiber';
import { useAtom } from 'jotai';
import { useState } from 'react';

export const Presentation: React.FC<{ className?: string }> = ({
    className,
}) => {
    const [_, setWelcomeIntroState] = useAtom(welcomeTourStateAtom);
    const slidesCount = 3;
    const [currentSlide, setCurrentSlide] = useState(0);

    return (
        <div className={className}>
            <Canvas camera={{ fov: 45, far: 60 }}>
                <ambientLight />
                <Scene currentSlide={currentSlide} />
            </Canvas>
            <Button
                onClick={() =>
                    setCurrentSlide(clamp(currentSlide - 1, 0, slidesCount - 1))
                }
                className="absolute top-1/2 -translate-y-1/2 left-4 px-4 py-12 text-4xl"
            >
                &lt;
            </Button>
            <Button
                onClick={() =>
                    setCurrentSlide(clamp(currentSlide + 1, 0, slidesCount - 1))
                }
                className="absolute top-1/2 -translate-y-1/2 right-4 px-4 py-12 text-4xl"
            >
                &gt;
            </Button>
            <Button
                onClick={() =>
                    setWelcomeIntroState(
                        WelcomeIntroState.TOUR_STATE_INTRO_SEEN,
                    )
                }
                className="absolute bottom-12 left-1/2 -translate-x-1/2"
            >
                End Tour
            </Button>
        </div>
    );
};
