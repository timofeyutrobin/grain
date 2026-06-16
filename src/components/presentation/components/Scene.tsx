import { Grain } from '@/components/presentation/entities/Grain';
import { GrainCluster } from '@/components/presentation/entities/GrainCluster';
import {
    lightRaysFragmentShader,
    lightRaysVertexShader,
} from '@/components/presentation/shaders';
import { lerpFactor, radians } from '@/lib/common';
import { useFrame, useLoader } from '@react-three/fiber';
import React, { useLayoutEffect, useRef } from 'react';
import {
    AdditiveBlending,
    Color,
    DodecahedronGeometry,
    MeshStandardMaterial,
    RepeatWrapping,
    ShaderMaterial,
    TextureLoader,
} from 'three';
import { lerp } from 'three/src/math/MathUtils.js';

interface SceneProps {
    currentStep: number;
}

export const Scene: React.FC<SceneProps> = ({ currentStep }) => {
    const surfaceTexture = useLoader(
        TextureLoader,
        '/textures/grain-surface.jpg',
    );

    useLayoutEffect(() => {
        surfaceTexture.wrapT = RepeatWrapping;
        surfaceTexture.wrapS = RepeatWrapping;
        surfaceTexture.repeat.set(5, 5);
    }, [surfaceTexture]);

    const grainMaterial = useRef(
        new MeshStandardMaterial({
            metalness: 0.5,
            roughness: 0.8,
            color: '#78716c',
            map: surfaceTexture ?? undefined,
            bumpMap: surfaceTexture ?? undefined,
            transparent: true,
        }),
    );
    const washedGrainMaterial = useRef(
        new MeshStandardMaterial({
            metalness: 0.5,
            roughness: 0.8,
            color: '#78716c',
            transparent: true,
        }),
    );
    const grainGeometry = useRef(new DodecahedronGeometry(1, 0));
    const lightRaysMaterialRef = useRef<ShaderMaterial>(null);

    useFrame((state, delta) => {
        if (!lightRaysMaterialRef.current) {
            return;
        }

        const alpha = lerpFactor(0.9, delta) * 2;
        if (!lightRaysMaterialRef.current.uniforms.uGlowIntensity) {
            lightRaysMaterialRef.current.uniforms.uGlowIntensity = {
                value: 0,
            };
        }

        if (currentStep === 0) {
            state.camera.position.lerp({ x: 0, y: 0, z: 7 }, alpha);
            grainMaterial.current.opacity = lerp(
                grainMaterial.current.opacity,
                1,
                alpha,
            );
            grainMaterial.current.roughness = lerp(
                grainMaterial.current.roughness,
                0.8,
                alpha,
            );
            grainMaterial.current.metalness = lerp(
                grainMaterial.current.metalness,
                0.5,
                alpha,
            );
            washedGrainMaterial.current.opacity = lerp(
                washedGrainMaterial.current.opacity,
                1,
                alpha,
            );
            lightRaysMaterialRef.current.uniforms.uGlowIntensity.value = lerp(
                lightRaysMaterialRef.current.uniforms.uGlowIntensity.value,
                -1,
                alpha / 2,
            );
        } else if (currentStep === 1) {
            state.camera.position.lerp({ x: 0, y: 0, z: 12 }, alpha);
            grainMaterial.current.opacity = lerp(
                grainMaterial.current.opacity,
                1,
                alpha,
            );
            grainMaterial.current.roughness = lerp(
                grainMaterial.current.roughness,
                0.8,
                alpha,
            );
            grainMaterial.current.metalness = lerp(
                grainMaterial.current.metalness,
                0.5,
                alpha,
            );
            washedGrainMaterial.current.opacity = lerp(
                washedGrainMaterial.current.opacity,
                1,
                alpha,
            );
            lightRaysMaterialRef.current.uniforms.uGlowIntensity.value = lerp(
                lightRaysMaterialRef.current.uniforms.uGlowIntensity.value,
                -1,
                alpha / 2,
            );
        } else if (currentStep === 2) {
            state.camera.position.lerp({ x: 0, y: 0, z: 12 }, alpha);
            grainMaterial.current.opacity = lerp(
                grainMaterial.current.opacity,
                1,
                alpha,
            );
            grainMaterial.current.roughness = lerp(
                grainMaterial.current.roughness,
                0.8,
                alpha,
            );
            grainMaterial.current.metalness = lerp(
                grainMaterial.current.metalness,
                0.5,
                alpha,
            );
            washedGrainMaterial.current.opacity = lerp(
                washedGrainMaterial.current.opacity,
                1,
                alpha,
            );
            lightRaysMaterialRef.current.uniforms.uGlowIntensity.value = lerp(
                lightRaysMaterialRef.current.uniforms.uGlowIntensity.value,
                3,
                alpha / 2,
            );
        } else if (currentStep === 3) {
            state.camera.position.lerp({ x: 0, y: 0, z: 12 }, alpha);
            grainMaterial.current.opacity = lerp(
                grainMaterial.current.opacity,
                1,
                alpha,
            );
            grainMaterial.current.roughness = lerp(
                grainMaterial.current.roughness,
                0.4,
                alpha,
            );
            grainMaterial.current.metalness = lerp(
                grainMaterial.current.metalness,
                0.8,
                alpha,
            );
            washedGrainMaterial.current.opacity = lerp(
                washedGrainMaterial.current.opacity,
                0.05,
                alpha,
            );
            lightRaysMaterialRef.current.uniforms.uGlowIntensity.value = lerp(
                lightRaysMaterialRef.current.uniforms.uGlowIntensity.value,
                3,
                alpha / 2,
            );
        } else if (currentStep >= 4) {
            state.camera.position.lerp({ x: 0, y: 0, z: 12 }, alpha);
            grainMaterial.current.opacity = lerp(
                grainMaterial.current.opacity,
                0,
                alpha * 2,
            );
            grainMaterial.current.roughness = lerp(
                grainMaterial.current.roughness,
                0.4,
                alpha,
            );
            grainMaterial.current.metalness = lerp(
                grainMaterial.current.metalness,
                0.8,
                alpha,
            );
            washedGrainMaterial.current.opacity = lerp(
                washedGrainMaterial.current.opacity,
                0,
                alpha * 2,
            );
            lightRaysMaterialRef.current.uniforms.uGlowIntensity.value = lerp(
                lightRaysMaterialRef.current.uniforms.uGlowIntensity.value,
                -1,
                alpha,
            );
        }

        lightRaysMaterialRef.current.uniforms.uTime.value =
            state.clock.getElapsedTime();

        if (lightRaysMaterialRef.current.uniforms.uGlowIntensity.value > 0) {
            lightRaysMaterialRef.current.visible = true;
        } else {
            lightRaysMaterialRef.current.visible = false;
        }
    });

    return (
        <object3D position={[0, 0.2, 0]} scale={0.9}>
            <directionalLight
                intensity={10}
                color="#e4e4e7"
                position={[0, 10, 3]}
            />
            <mesh position={[0, 0, 11]} rotation={[radians(-30), 0, 0]}>
                <cylinderGeometry args={[0.5, 5, 5]} />
                <shaderMaterial
                    ref={lightRaysMaterialRef}
                    uniforms={{
                        uColor: { value: new Color('#e7e5e4') },
                        uTime: { value: 0 },
                    }}
                    fragmentShader={lightRaysFragmentShader}
                    vertexShader={lightRaysVertexShader}
                    side={2}
                    blending={AdditiveBlending}
                    transparent
                    depthWrite={false}
                />
            </mesh>
            <>
                <object3D position={[0, 0, 0]}>
                    <object3D scale={0.8}>
                        <Grain
                            geometry={grainGeometry}
                            material={grainMaterial}
                            rotate
                            float
                        />
                    </object3D>
                </object3D>
                <object3D position={[0, 0, 5]}>
                    <GrainCluster
                        geometry={grainGeometry}
                        material={grainMaterial}
                        washedMaterial={washedGrainMaterial}
                        scattered={currentStep < 1}
                    />
                </object3D>
            </>
        </object3D>
    );
};
