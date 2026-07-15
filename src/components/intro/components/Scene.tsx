import { Grain } from '@/components/intro/entities/Grain';
import { GrainCluster } from '@/components/intro/entities/GrainCluster';
import { GrainLayerRGB } from '@/components/intro/entities/GrainLayerRGB';
import { LightRays } from '@/components/intro/entities/LightRays';
import { animate, radians } from '@/lib/common';
import { useFrame, useLoader } from '@react-three/fiber';
import React, { useLayoutEffect, useMemo } from 'react';
import {
    DodecahedronGeometry,
    MeshStandardMaterial,
    RepeatWrapping,
    TextureLoader,
    Vector3Like,
} from 'three';
import { damp } from 'three/src/math/MathUtils.js';

interface SceneAnimationState {
    cameraPosition: Vector3Like;
    opacity: number;
    washedOpacity: number;
    metalness: number;
    roughness: number;
}
const animationState: SceneAnimationState[] = [
    {
        cameraPosition: { x: 0, y: 0, z: 7 },
        opacity: 1,
        metalness: 0.5,
        roughness: 0.8,
        washedOpacity: 1,
    },
    {
        cameraPosition: { x: 0, y: 0, z: 12 },
        opacity: 1,
        metalness: 0.5,
        roughness: 0.8,
        washedOpacity: 1,
    },
    {
        cameraPosition: { x: 0, y: 0, z: 12 },
        opacity: 1,
        metalness: 0.5,
        roughness: 0.8,
        washedOpacity: 1,
    },
    {
        cameraPosition: { x: 0, y: 0, z: 12 },
        opacity: 1,
        metalness: 0.8,
        roughness: 0.4,
        washedOpacity: 0.05,
    },
    {
        cameraPosition: { x: 0, y: 0, z: 65 },
        opacity: 0,
        metalness: 0.8,
        roughness: 0.4,
        washedOpacity: 0,
    },
    {
        cameraPosition: { x: 0, y: 0, z: 65 },
        opacity: 0,
        metalness: 0.8,
        roughness: 0.4,
        washedOpacity: 0,
    },
    {
        cameraPosition: { x: 0, y: 0, z: 65 },
        opacity: 0,
        metalness: 0.8,
        roughness: 0.4,
        washedOpacity: 0,
    },
    {
        cameraPosition: { x: 0, y: 0, z: 65 },
        opacity: 0,
        metalness: 0.8,
        roughness: 0.4,
        washedOpacity: 0,
    },
];

interface SceneProps {
    currentStep: number;
}

export const Scene: React.FC<SceneProps> = ({ currentStep }) => {
    'use no memo';

    const surfaceTexture = useLoader(
        TextureLoader,
        '/textures/grain-surface.jpg',
    );

    useLayoutEffect(() => {
        surfaceTexture.wrapT = RepeatWrapping;
        surfaceTexture.wrapS = RepeatWrapping;
        surfaceTexture.repeat.set(5, 5);
    }, []);

    const grainMaterial = useMemo(
        () =>
            new MeshStandardMaterial({
                metalness: 0.5,
                roughness: 0.8,
                color: '#78716c',
                map: surfaceTexture,
                bumpMap: surfaceTexture,
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

    useFrame((state, delta) => {
        const lambda = 5;

        animate<SceneAnimationState>(
            (animationState) => {
                state.camera.position.set(
                    damp(
                        state.camera.position.x,
                        animationState.cameraPosition.x,
                        lambda,
                        delta,
                    ),
                    damp(
                        state.camera.position.y,
                        animationState.cameraPosition.y,
                        lambda,
                        delta,
                    ),
                    damp(
                        state.camera.position.z,
                        animationState.cameraPosition.z,
                        lambda,
                        delta,
                    ),
                );

                grainMaterial.opacity = damp(
                    grainMaterial.opacity,
                    animationState.opacity,
                    lambda,
                    delta,
                );
                grainMaterial.metalness = damp(
                    grainMaterial.metalness,
                    animationState.metalness,
                    lambda,
                    delta,
                );
                grainMaterial.roughness = damp(
                    grainMaterial.roughness,
                    animationState.roughness,
                    lambda,
                    delta,
                );
                washedGrainMaterial.opacity = damp(
                    washedGrainMaterial.opacity,
                    animationState.washedOpacity,
                    lambda,
                    delta,
                );
            },
            animationState,
            currentStep,
        );
    });

    return (
        <object3D position={[0, 0.2, 0]} scale={0.9}>
            <directionalLight
                intensity={10}
                color="#e4e4e7"
                position={[0, 10, 3]}
            />
            <LightRays
                intensity={currentStep === 2 || currentStep === 3 ? 3 : -1}
            />
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
