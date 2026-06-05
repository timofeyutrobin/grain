import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { Mesh } from 'three';

function RotatingBox() {
    const meshRef = useRef<Mesh>(null);

    useFrame((_, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.x += delta * 0.8;
            meshRef.current.rotation.y += delta * 0.6;
        }
    });

    return (
        <mesh ref={meshRef}>
            <boxGeometry args={[1.2, 1.2, 1.2]} />
            <meshStandardMaterial color="#8b5cf6" emissive="#312e81" />
        </mesh>
    );
}

export default function Presentation() {
    return (
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[3, 3, 3]} intensity={1.2} />
            <pointLight position={[-3, -2, -2]} intensity={0.8} />
            <RotatingBox />
        </Canvas>
    );
}
