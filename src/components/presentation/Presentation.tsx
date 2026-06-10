import { Slide1 } from '@/components/presentation/slides/Slide1';
import { Slide2 } from '@/components/presentation/slides/Slide2';
import { Slide3 } from '@/components/presentation/slides/Slide3';
import { clamp, radians } from '@/lib/common';
import { Canvas } from '@react-three/fiber';
import { useState } from 'react';
import { Fog } from 'three';

export default function Presentation() {
    const slides = [<Slide1 />, <Slide2 />, <Slide3 />];
    const [currentSlide, setCurrentSlide] = useState(0);

    return (
        <div className="relative h-full">
            <Canvas
                scene={{ fog: new Fog('#fff', 0, 90) }}
                camera={{ position: [0, 0, 7], fov: 45 }}
            >
                <ambientLight />
                <mesh position={[0, -3, 0]} rotation={[radians(-90), 0, 0]}>
                    <planeGeometry args={[20, 20]} />
                    <meshPhongMaterial color="#333" />
                </mesh>
                {slides[currentSlide]}
            </Canvas>
            <button
                onClick={() =>
                    setCurrentSlide((prev) =>
                        clamp(prev - 1, 0, slides.length - 1),
                    )
                }
                className="absolute top-1/2 -translate-y-1/2 left-4 px-4 py-12 text-4xl border cursor-pointer hover:bg-zinc-600"
            >
                &lt;
            </button>
            <button
                onClick={() =>
                    setCurrentSlide((prev) =>
                        clamp(prev + 1, 0, slides.length - 1),
                    )
                }
                className="absolute top-1/2 -translate-y-1/2 right-4 px-4 py-12 text-4xl border cursor-pointer hover:bg-zinc-600"
            >
                &gt;
            </button>
        </div>
    );
}
