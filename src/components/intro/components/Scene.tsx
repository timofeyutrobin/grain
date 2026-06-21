import { Grain } from '@/components/intro/entities/Grain';
import { GrainCluster } from '@/components/intro/entities/GrainCluster';
import { GrainLayerRGB } from '@/components/intro/entities/GrainLayerRGB';
import lightRaysFragmentShader from '@/components/intro/shaders/lightRaysFragmentShader';
import lightRaysVertexShader from '@/components/intro/shaders/lightRaysVertexShader';
import { animate, lerpFactor, radians } from '@/lib/common';
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
    Vector3Like,
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
    const lightRaysMaterialRef = useRef<ShaderMaterial>(
        new ShaderMaterial({
            uniforms: {
                uColor: { value: new Color('#e7e5e4') },
                uTime: { value: 0 },
                uGlowIntensity: { value: 0 },
            },
            fragmentShader: lightRaysFragmentShader,
            vertexShader: lightRaysVertexShader,
            side: 2,
            blending: AdditiveBlending,
            transparent: true,
            depthWrite: false,
        }),
    );

    useFrame((state, delta) => {
        const alpha = lerpFactor(0.9, delta) * 2;

        animate<{
            cameraPosition: Vector3Like;
            opacity: number;
            washedOpacity: number;
            metalness: number;
            roughness: number;
            lightRaysGlow: number;
            lightRaysAlpha?: number;
        }>(
            (value) => {
                state.camera.position.lerp(value.cameraPosition, alpha);
                grainMaterial.current.opacity = lerp(
                    grainMaterial.current.opacity,
                    value.opacity,
                    alpha,
                );
                grainMaterial.current.metalness = lerp(
                    grainMaterial.current.metalness,
                    value.metalness,
                    alpha,
                );
                grainMaterial.current.roughness = lerp(
                    grainMaterial.current.roughness,
                    value.roughness,
                    alpha,
                );
                washedGrainMaterial.current.opacity = lerp(
                    washedGrainMaterial.current.opacity,
                    value.washedOpacity,
                    alpha,
                );
                lightRaysMaterialRef.current.uniforms.uGlowIntensity.value =
                    lerp(
                        lightRaysMaterialRef.current.uniforms.uGlowIntensity
                            .value,
                        value.lightRaysGlow,
                        value.lightRaysAlpha ?? alpha / 2,
                    );
            },
            [
                {
                    cameraPosition: { x: 0, y: 0, z: 7 },
                    opacity: 1,
                    metalness: 0.5,
                    roughness: 0.8,
                    washedOpacity: 1,
                    lightRaysGlow: -1,
                },
                {
                    cameraPosition: { x: 0, y: 0, z: 12 },
                    opacity: 1,
                    metalness: 0.5,
                    roughness: 0.8,
                    washedOpacity: 1,
                    lightRaysGlow: -1,
                },
                {
                    cameraPosition: { x: 0, y: 0, z: 12 },
                    opacity: 1,
                    metalness: 0.5,
                    roughness: 0.8,
                    washedOpacity: 1,
                    lightRaysGlow: 3,
                },
                {
                    cameraPosition: { x: 0, y: 0, z: 12 },
                    opacity: 1,
                    metalness: 0.8,
                    roughness: 0.4,
                    washedOpacity: 0.05,
                    lightRaysGlow: 3,
                },
                {
                    cameraPosition: { x: 0, y: 0, z: 65 },
                    opacity: 0,
                    metalness: 0.8,
                    roughness: 0.4,
                    washedOpacity: 0,
                    lightRaysGlow: -1,
                },
                {
                    cameraPosition: { x: 0, y: 0, z: 65 },
                    opacity: 0,
                    metalness: 0.8,
                    roughness: 0.4,
                    washedOpacity: 0,
                    lightRaysGlow: -1,
                },
                {
                    cameraPosition: { x: 0, y: 0, z: 65 },
                    opacity: 0,
                    metalness: 0.8,
                    roughness: 0.4,
                    washedOpacity: 0,
                    lightRaysGlow: -1,
                },
                {
                    cameraPosition: { x: 0, y: 0, z: 65 },
                    opacity: 0,
                    metalness: 0.8,
                    roughness: 0.4,
                    washedOpacity: 0,
                    lightRaysGlow: -1,
                },
            ],
            currentStep,
        );

        lightRaysMaterialRef.current.uniforms.uTime.value =
            state.clock.getElapsedTime();

        if (
            lightRaysMaterialRef.current.uniforms.uGlowIntensity.value > 0 &&
            currentStep < 4
        ) {
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
            <mesh
                position={[0, 0, 7]}
                rotation={[radians(-10), 0, 0]}
                material={lightRaysMaterialRef.current}
            >
                <cylinderGeometry args={[1, 10, 15]} />
            </mesh>
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
            <object3D
                scale={0.9}
                rotation={[radians(-30), 0, 0]}
                position={[0, 1.4, 50]}
            >
                <GrainLayerRGB
                    grayscale={currentStep < 6}
                    stratified={currentStep === 5}
                />
            </object3D>
        </object3D>
    );
};
