import { radians } from '@/lib/common';
import { useFrame } from '@react-three/fiber';
import { useMemo } from 'react';
import { AdditiveBlending, Color, ShaderMaterial } from 'three';
import { damp } from 'three/src/math/MathUtils.js';

interface LightRaysProps {
    intensity: number;
}

export const LightRays: React.FC<LightRaysProps> = ({ intensity }) => {
    const lightRaysMaterial = useMemo(
        () =>
            new ShaderMaterial({
                uniforms: {
                    uColor: { value: new Color('#e7e5e4') },
                    uTime: { value: 0 },
                    uGlowIntensity: { value: 0 },
                },
                fragmentShader: `
                    uniform vec3 uColor;
                    uniform float uGlowIntensity;
                    uniform float uTime;
                    varying vec2 vUv;
                
                    float hash(float n) { 
                        return fract(sin(n) * 43758.5453123); 
                    }
                
                    float noise(float x) {
                        float i = floor(x);
                        float f = fract(x);
                        float u = f * f * (3.0 - 2.0 * f);
                        return mix(hash(i), hash(i + 1.0), u);
                    }
                
                    void main() {
                        float verticalFade = pow(vUv.y, 4.0);
                
                        float horizontalFade = sin(vUv.x * 3.14159265);
                        horizontalFade = pow(horizontalFade, 2.5);
                
                        float ray1 = noise(vUv.x * 20.0 + uTime * 0.1);
                        float ray2 = noise(vUv.x * 45.0 - uTime * 0.05);
                
                        float raysTexture = (ray1 * 0.6 + ray2 * 0.4);
                
                        float finalAlpha = verticalFade * horizontalFade * raysTexture;
                        if (finalAlpha < 0.001) discard;
                
                        vec3 finalColor = uColor * uGlowIntensity;
                
                        gl_FragColor = vec4(finalColor, finalAlpha);
                    }
                `,
                vertexShader: `
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                side: 2,
                blending: AdditiveBlending,
                transparent: true,
                depthWrite: false,
            }),
        [],
    );

    useFrame((state, delta) => {
        const lambda = 5;

        if (Math.abs(state.camera.position.z - 12) <= 0.5) {
            lightRaysMaterial.uniforms.uGlowIntensity.value = damp(
                lightRaysMaterial.uniforms.uGlowIntensity.value,
                intensity,
                lambda,
                delta,
            );
            if (lightRaysMaterial.uniforms.uGlowIntensity.value > 0) {
                lightRaysMaterial.visible = true;
            } else {
                lightRaysMaterial.visible = false;
            }
        } else {
            lightRaysMaterial.visible = false;
        }

        lightRaysMaterial.uniforms.uTime.value = state.clock.getElapsedTime();
    });

    return (
        <mesh
            position={[0, 0, 7]}
            rotation={[radians(-10), 0, 0]}
            material={lightRaysMaterial}
        >
            <cylinderGeometry args={[1, 10, 15]} />
        </mesh>
    );
};
