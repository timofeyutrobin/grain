import { useFrame } from '@react-three/fiber';
import { RefObject, useRef } from 'react';
import { BufferGeometry, Material, Mesh } from 'three';

interface GrainProps {
    geometry: RefObject<BufferGeometry>;
    material: RefObject<Material>;
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
    const meshRef = useRef<Mesh>(null);
    const time = useRef(0);

    useFrame((_, delta) => {
        if (!meshRef.current) {
            return;
        }

        if (rotate) {
            meshRef.current.rotation.x += delta * 0.3;
            meshRef.current.rotation.y += delta * 0.1;
        }

        if (float) {
            time.current += delta;

            meshRef.current.position.y =
                Math.sin(time.current * 1.6 + phaseShift) * 0.1;
            meshRef.current.position.x =
                Math.cos(time.current * 1.2 + phaseShift) * 0.06;
            meshRef.current.rotation.y += delta * 0.1;
        }
    });

    return (
        <mesh
            ref={meshRef}
            name="grain"
            material={material.current}
            geometry={geometry.current}
        />
    );
};
