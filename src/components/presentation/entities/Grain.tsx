import { useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Mesh, RepeatWrapping } from 'three';

interface GrainProps {
    rotate?: boolean;
    float?: boolean;
    phaseShift?: number;
}

export const Grain: React.FC<GrainProps> = ({
    rotate,
    float,
    phaseShift = 0,
}) => {
    const meshRef = useRef<Mesh>(null);
    const time = useRef(0);

    const surfaceTexture = useTexture(
        '/textures/grain-surface.jpg',
        (texture) => {
            texture.wrapT = RepeatWrapping;
            texture.wrapS = RepeatWrapping;
            texture.repeat.set(5, 5);
        },
    );

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
        <mesh ref={meshRef} name="grain">
            <dodecahedronGeometry args={[1, 0]} />
            <meshPhysicalMaterial
                metalness={0.5}
                roughness={0.8}
                color="#78716c"
                map={surfaceTexture ?? undefined}
                bumpMap={surfaceTexture ?? undefined}
            />
        </mesh>
    );
};
