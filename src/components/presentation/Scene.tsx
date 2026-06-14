import { Grain } from '@/components/presentation/entities/Grain';
import { GrainCluster } from '@/components/presentation/entities/GrainCluster';
import { Negative } from '@/components/presentation/entities/Negative';
import { lerpFactor } from '@/lib/common';
import { useFrame } from '@react-three/fiber';
import React, { useRef } from 'react';
import { DirectionalLight } from 'three';
import { lerp } from 'three/src/math/MathUtils.js';

interface SceneProps {
    currentSlide: number;
}

export const Scene: React.FC<SceneProps> = ({ currentSlide }) => {
    const lightRef = useRef<DirectionalLight>(null);

    useFrame((state, delta) => {
        if (!lightRef.current) {
            return;
        }

        const alpha = lerpFactor(0.9, delta) * 2;

        if (currentSlide === 0) {
            state.camera.position.lerp({ x: 0, y: 0, z: 7 }, alpha);
            lightRef.current.intensity = lerp(
                lightRef.current.intensity,
                10,
                alpha,
            );
        } else if (currentSlide === 1) {
            state.camera.position.lerp({ x: 0, y: 0, z: 12 }, alpha);
            lightRef.current.intensity = lerp(
                lightRef.current.intensity,
                10,
                alpha,
            );
        } else if (currentSlide === 2) {
            state.camera.position.lerp({ x: 0, y: 0, z: 30 }, alpha);
            lightRef.current.intensity = lerp(
                lightRef.current.intensity,
                0,
                alpha,
            );
        }
    });

    return (
        <>
            <directionalLight
                color="#e4e4e7"
                ref={lightRef}
                position={[0, -3, 3]}
            />
            {currentSlide < 3 && (
                <object3D position={[0, 0, 0]}>
                    <object3D scale={0.8}>
                        <Grain rotate float />
                    </object3D>
                </object3D>
            )}
            <object3D position={[0, 0, 5]}>
                <GrainCluster scattered={currentSlide === 0} />
            </object3D>
            <object3D scale={0.8} position={[0, 0, 24]}>
                <Negative />
            </object3D>
        </>
    );
};
