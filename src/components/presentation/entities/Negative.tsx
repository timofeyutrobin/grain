import { useTexture } from '@react-three/drei';

export const Negative: React.FC = () => {
    const image = useTexture('/images/demo-negative.jpg');

    return (
        <mesh position={[0, 0, 0]}>
            <planeGeometry args={[8, 5.8]} />
            <meshPhysicalMaterial
                transparent
                opacity={1}
                alphaMap={image}
                color="#000"
                emissive="#fff"
                emissiveMap={image}
                emissiveIntensity={15}
                metalness={1}
            />
        </mesh>
    );
};
