import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';

export const Slide3: React.FC = () => {
    const image = useLoader(TextureLoader, '/images/demo-negative.jpg');

    return (
        <>
            <mesh scale={0.8} position={[0, 0.2, -1]}>
                <planeGeometry args={[8, 5.8]} />
                <meshPhysicalMaterial
                    transparent
                    opacity={0.9}
                    color="#fff"
                    alphaMap={image}
                    metalness={1}
                />
            </mesh>
            <mesh position={[0, 0, -2]}>
                <planeGeometry args={[10, 7]} />
                <meshPhongMaterial emissive="#fff" emissiveIntensity={10} />
            </mesh>
        </>
    );
};
