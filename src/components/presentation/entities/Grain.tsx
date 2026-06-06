import { useLoader } from '@react-three/fiber';
import { forwardRef, useEffect } from 'react';
import { Mesh, RepeatWrapping, TextureLoader } from 'three';

export const Grain = forwardRef<Mesh>((_, ref) => {
    const surfaceTexture = useLoader(
        TextureLoader,
        '/textures/grain-surface.jpg',
    );

    useEffect(() => {
        surfaceTexture.wrapT = RepeatWrapping;
        surfaceTexture.wrapS = RepeatWrapping;
        surfaceTexture.repeat.x = 5;
        surfaceTexture.repeat.y = 5;
    }, [surfaceTexture]);

    return (
        <mesh ref={ref}>
            <dodecahedronGeometry args={[1, 0]} />
            <meshPhysicalMaterial
                roughness={0.7}
                metalness={0.8}
                color={0xfffffffff}
                map={surfaceTexture}
                bumpMap={surfaceTexture}
            />
        </mesh>
    );
});
