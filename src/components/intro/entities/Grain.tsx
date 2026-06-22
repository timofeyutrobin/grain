import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { BufferGeometry, Material, Mesh } from 'three';

interface GrainProps {
    geometry: BufferGeometry;
    material: Material;
    rotate?: boolean;
    float?: boolean;
    phaseShift?: number;
}

export const Grain: React.FC<GrainProps> = ({
    geometry,
    material,
    rotate,
    float,
    phaseShift = 0,
}) => {
    'use no memo';

    const meshRef = useRef<Mesh>(null);

    useFrame((state) => {
        if (!meshRef.current) {
            return;
        }

        const elapsedTime = state.clock.getElapsedTime();

        if (rotate) {
            meshRef.current.rotation.x = elapsedTime * 0.3;
            meshRef.current.rotation.y = elapsedTime * 0.1;
        }

        if (float) {
            meshRef.current.position.y =
                Math.sin(elapsedTime * 1.6 + phaseShift) * 0.1;
            meshRef.current.position.x =
                Math.cos(elapsedTime * 1.2 + phaseShift) * 0.06;
            meshRef.current.rotation.y = elapsedTime * 0.1;
        }
    });

    return <mesh ref={meshRef} material={material} geometry={geometry} />;
};
