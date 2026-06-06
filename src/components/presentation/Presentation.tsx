import { Grain } from '@/components/presentation/entities/Grain';
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { type Mesh } from 'three';

function RotatingGrain() {
    const meshRef = useRef<Mesh>(null);

    useFrame((_, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.x += delta * 0.3;
            meshRef.current.rotation.y += delta * 0.1;
        }
    });

    return <Grain ref={meshRef} />;
}

export default function Presentation() {
    return (
        <Canvas camera={{ position: [0, 0, 7], fov: 45 }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[-1, 2, 2]} intensity={2} />
            <RotatingGrain />
        </Canvas>
    );
}
