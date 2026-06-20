import emulsionFragmentShader from '@/components/intro/shaders/emulsionFragmentShader';
import emulsionVertexShader from '@/components/intro/shaders/emulsionVertexShader';
import { useFrame, useLoader } from '@react-three/fiber';
import { RefObject, useRef } from 'react';
import {
    BufferGeometry,
    Color,
    ColorRepresentation,
    Object3D,
    ShaderMaterial,
    TextureLoader,
} from 'three';

interface GrainLayerProps {
    vertices: number[];
    color: ColorRepresentation;
    ref?: RefObject<Object3D | null>;
    materialRef?: RefObject<ShaderMaterial | null>;
}

export const GrainLayer: React.FC<GrainLayerProps> = ({
    color,
    vertices,
    materialRef,
    ref,
}) => {
    const demoImageTexture = useLoader(
        TextureLoader,
        '/images/demo-image.jpeg',
    );
    const geometryRef = useRef<BufferGeometry>(null);

    useFrame((_, delta) => {
        if (materialRef?.current) {
            materialRef.current.uniforms.uTime.value =
                materialRef.current.uniforms.uTime.value + delta;
        }
    });

    return (
        <object3D ref={ref}>
            <points>
                <bufferGeometry ref={geometryRef}>
                    <bufferAttribute
                        attach="attributes-position"
                        args={[new Float32Array(vertices), 3]}
                    />
                </bufferGeometry>
                <shaderMaterial
                    ref={materialRef}
                    vertexShader={emulsionVertexShader}
                    fragmentShader={emulsionFragmentShader}
                    uniforms={{
                        uTime: { value: 0 },
                        uAmplitude: { value: 0.3 },
                        uFrequency: { value: 1 },
                        uSpeed: { value: 1.2 },
                        uColor: { value: new Color(color) },
                        uSaturation: { value: 0 },
                        uTexture: { value: demoImageTexture },
                        uGrayscale: { value: 1 },
                    }}
                    transparent
                />
            </points>
        </object3D>
    );
};
