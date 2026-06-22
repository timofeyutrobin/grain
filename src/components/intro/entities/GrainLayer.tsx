import { useLoader } from '@react-three/fiber';
import { RefObject, useMemo } from 'react';
import {
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
    'use no memo';

    const demoImageTexture = useLoader(
        TextureLoader,
        '/images/demo-image.jpeg',
    );

    const verticesPositions = useMemo(
        () => [new Float32Array(vertices), 3] as const,
        [vertices],
    );
    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uAmplitude: { value: 0.3 },
            uFrequency: { value: 1 },
            uSpeed: { value: 1.2 },
            uColor: { value: new Color(color) },
            uSaturation: { value: 0 },
            uTexture: { value: demoImageTexture },
            uGrayscale: { value: 1 },
        }),
        [color],
    );

    return (
        <object3D ref={ref}>
            <points>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        args={verticesPositions}
                    />
                </bufferGeometry>
                <shaderMaterial
                    ref={materialRef}
                    vertexShader={`
                        uniform float uTime;
                        uniform float uAmplitude;
                        uniform float uFrequency;
                        uniform float uSpeed;
                        uniform float uSaturation;
                    
                        varying vec2 vUv;
                    
                        void main() {
                            vUv = vec2(position.x / 16.0, position.y / 10.0) + 0.5;
                            vec3 p = position;
                    
                            float wave = sin(uTime * uSpeed + p.x * uFrequency) * cos(uTime * uSpeed * 0.7 + p.y * uFrequency * 0.5);
                            p.z += uAmplitude * wave * 0.2;
                    
                            vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
                            gl_PointSize = 2.0;
                            gl_Position = projectionMatrix * mvPosition;
                        }
                    `}
                    fragmentShader={`
                        uniform vec3 uColor;
                        uniform float uSaturation;
                        uniform sampler2D uTexture;
                        uniform float uGrayscale;
                    
                        varying vec2 vUv;
                    
                        void main() {
                            vec4 mask = texture2D(uTexture, vUv);
                            float gray = 0.21 * mask.r + 0.71 * mask.g + 0.07 * mask.b;
                            gl_FragColor = vec4(mix(vec3(mask.rgb * (1.0 - uGrayscale) + (gray * uGrayscale)), uColor, uSaturation * 0.5) + 0.3, gray);
                        }
                    `}
                    uniforms={uniforms}
                    transparent
                />
            </points>
        </object3D>
    );
};
