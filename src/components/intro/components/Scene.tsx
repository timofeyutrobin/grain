import { Grain } from '@/components/intro/entities/Grain';
import { GrainCluster } from '@/components/intro/entities/GrainCluster';
import { GrainLayerRGB } from '@/components/intro/entities/GrainLayerRGB';
import lightRaysFragmentShader from '@/components/intro/shaders/lightRaysFragmentShader';
import lightRaysVertexShader from '@/components/intro/shaders/lightRaysVertexShader';
import { animate, radians } from '@/lib/common';
import { useFrame, useLoader } from '@react-three/fiber';
import React, { useEffect, useMemo } from 'react';
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
import { damp } from 'three/src/math/MathUtils.js';

interface SceneProps {
    currentStep: number;
}

export const Scene: React.FC<SceneProps> = ({ currentStep }) => {
    const surfaceTexture = useLoader(
        TextureLoader,
        '/textures/grain-surface.jpg',
    );

    useEffect(() => {
        surfaceTexture.wrapT = RepeatWrapping;
        surfaceTexture.wrapS = RepeatWrapping;
        surfaceTexture.repeat.set(5, 5);
    }, [surfaceTexture]);

    const grainMaterial = useMemo(
        () =>
            new MeshStandardMaterial({
                metalness: 0.5,
                roughness: 0.8,
                color: '#78716c',
                map: surfaceTexture ?? undefined,
                bumpMap: surfaceTexture ?? undefined,
                transparent: true,
            }),
        [],
    );
    const washedGrainMaterial = useMemo(
        () =>
            new MeshStandardMaterial({
                metalness: 0.5,
                roughness: 0.8,
                color: '#78716c',
                transparent: true,
            }),
        [],
    );
    const grainGeometry = useMemo(() => new DodecahedronGeometry(1, 0), []);
    const lightRaysMaterial = useMemo(
        () =>
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
        [],
    );

    useFrame((state, delta) => {
        const lambda = 5;

        animate<{
            cameraPosition: Vector3Like;
            opacity: number;
            washedOpacity: number;
            metalness: number;
            roughness: number;
            lightRaysGlow: number;
        }>(
            (value) => {
                state.camera.position.set(
                    damp(
                        state.camera.position.x,
                        value.cameraPosition.x,
                        lambda,
                        delta,
                    ),
                    damp(
                        state.camera.position.y,
                        value.cameraPosition.y,
                        lambda,
                        delta,
                    ),
                    damp(
                        state.camera.position.z,
                        value.cameraPosition.z,
                        lambda,
                        delta,
                    ),
                );

                grainMaterial.opacity = damp(
                    grainMaterial.opacity,
                    value.opacity,
                    lambda,
                    delta,
                );
                grainMaterial.metalness = damp(
                    grainMaterial.metalness,
                    value.metalness,
                    lambda,
                    delta,
                );
                grainMaterial.roughness = damp(
                    grainMaterial.roughness,
                    value.roughness,
                    lambda,
                    delta,
                );
                washedGrainMaterial.opacity = damp(
                    washedGrainMaterial.opacity,
                    value.washedOpacity,
                    lambda,
                    delta,
                );

                if (Math.abs(state.camera.position.z - 12) <= 0.5) {
                    if (lightRaysMaterial.uniforms.uGlowIntensity.value > 0) {
                        lightRaysMaterial.visible = true;
                    }

                    lightRaysMaterial.uniforms.uGlowIntensity.value = damp(
                        lightRaysMaterial.uniforms.uGlowIntensity.value,
                        value.lightRaysGlow,
                        lambda,
                        delta,
                    );
                } else {
                    lightRaysMaterial.visible = false;
                }
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

        lightRaysMaterial.uniforms.uTime.value = state.clock.getElapsedTime();
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
                material={lightRaysMaterial}
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
