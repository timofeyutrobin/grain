import { useFrame, useLoader } from '@react-three/fiber';
import { useLayoutEffect, useRef } from 'react';
import { Mesh, RepeatWrapping, TextureLoader } from 'three';

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

    const surfaceTexture = useLoader(
        TextureLoader,
        '/textures/grain-surface.jpg',
    );

    useLayoutEffect(() => {
        surfaceTexture.wrapT = RepeatWrapping;
        surfaceTexture.wrapS = RepeatWrapping;
        surfaceTexture.repeat.set(5, 5);
    }, [surfaceTexture]);

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
