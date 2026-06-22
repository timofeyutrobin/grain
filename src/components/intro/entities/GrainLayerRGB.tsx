import { GrainLayer } from '@/components/intro/entities/GrainLayer';
import { animate, radians, randomFromTo } from '@/lib/common';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Object3D, ShaderMaterial, Vector3Like } from 'three';
import { damp } from 'three/src/math/MathUtils.js';

const vertices1: number[] = [];
const vertices2: number[] = [];
const vertices3: number[] = [];
for (let i = 0; i < 60000; i++) {
    const x = randomFromTo(-8, 8);
    const y = randomFromTo(-5, 5);
    const z = randomFromTo(-0.1, 0.1);

    vertices1.push(x, y, z);
}
for (let i = 0; i < 60000; i++) {
    const x = randomFromTo(-8, 8);
    const y = randomFromTo(-5, 5);
    const z = randomFromTo(-0.1, 0.1);

    vertices2.push(x, y, z);
}
for (let i = 0; i < 60000; i++) {
    const x = randomFromTo(-8, 8);
    const y = randomFromTo(-5, 5);
    const z = randomFromTo(-0.1, 0.1);

    vertices3.push(x, y, z);
}

interface GrainLayerRGBProps {
    stratified?: boolean;
    grayscale?: boolean;
}

export const GrainLayerRGB: React.FC<GrainLayerRGBProps> = ({
    stratified,
    grayscale,
}) => {
    'use no memo';

    const rLayerRef = useRef<Object3D>(null);
    const gLayerRef = useRef<Object3D>(null);
    const bLayerRef = useRef<Object3D>(null);

    const rMaterialRef = useRef<ShaderMaterial>(null);
    const gMaterialRef = useRef<ShaderMaterial>(null);
    const bMaterialRef = useRef<ShaderMaterial>(null);

    useFrame((_, delta) => {
        const rLayer = rLayerRef.current;
        const gLayer = gLayerRef.current;
        const bLayer = bLayerRef.current;
        const rMaterial = rMaterialRef.current;
        const gMaterial = gMaterialRef.current;
        const bMaterial = bMaterialRef.current;
        if (
            !rLayer ||
            !gLayer ||
            !bLayer ||
            !rMaterial ||
            !gMaterial ||
            !bMaterial
        ) {
            return;
        }

        const lambda = 5;

        animate<{
            scale: number;
            rPosition: Vector3Like;
            bPosition: Vector3Like;
            rotation: Vector3Like;
            saturation: number;
        }>(
            (value) => {
                [rLayer, gLayer, bLayer].forEach((layer) => {
                    layer.scale.set(
                        damp(layer.scale.x, value.scale, lambda, delta),
                        damp(layer.scale.y, value.scale, lambda, delta),
                        damp(layer.scale.z, value.scale, lambda, delta),
                    );
                    layer.rotation.set(
                        damp(layer.rotation.x, value.rotation.x, lambda, delta),
                        damp(layer.rotation.y, value.rotation.y, lambda, delta),
                        damp(layer.rotation.z, value.rotation.z, lambda, delta),
                    );
                });

                rLayer.position.set(
                    damp(rLayer.position.x, value.rPosition.x, lambda, delta),
                    damp(rLayer.position.y, value.rPosition.y, lambda, delta),
                    damp(rLayer.position.z, value.rPosition.z, lambda, delta),
                );
                bLayer.position.set(
                    damp(bLayer.position.x, value.bPosition.x, lambda, delta),
                    damp(bLayer.position.y, value.bPosition.y, lambda, delta),
                    damp(bLayer.position.z, value.bPosition.z, lambda, delta),
                );

                [rMaterial, gMaterial, bMaterial].forEach((material) => {
                    material.uniforms.uSaturation.value = damp(
                        material.uniforms.uSaturation.value,
                        value.saturation,
                        lambda,
                        delta,
                    );
                });
            },
            [
                {
                    scale: 0.8,
                    rPosition: { x: -6, y: 3.5, z: 1 },
                    bPosition: { x: 7, y: -5, z: 0 },
                    rotation: { x: radians(-30), y: 0, z: 0 },
                    saturation: 1,
                },
                {
                    scale: 1,
                    rPosition: { x: 0, y: 0, z: 0 },
                    bPosition: { x: 0, y: 0, z: 0 },
                    rotation: { x: 0, y: 0, z: 0 },
                    saturation: 0,
                },
            ],
            stratified ? 0 : 1,
        );
        animate<number>(
            (grayscale) => {
                [rMaterial, gMaterial, bMaterial].forEach((material) => {
                    material.uniforms.uGrayscale.value = damp(
                        material.uniforms.uGrayscale.value,
                        grayscale,
                        lambda,
                        delta,
                    );
                });
            },
            [1, 0],
            grayscale ? 0 : 1,
        );

        rMaterial.uniforms.uTime.value += delta;
        gMaterial.uniforms.uTime.value += delta;
        bMaterial.uniforms.uTime.value += delta;
    });

    return (
        <>
            <GrainLayer
                ref={rLayerRef}
                materialRef={rMaterialRef}
                vertices={vertices1}
                color="#f87171"
            />
            <GrainLayer
                ref={gLayerRef}
                materialRef={gMaterialRef}
                vertices={vertices2}
                color="#4ade80"
            />
            <GrainLayer
                ref={bLayerRef}
                materialRef={bMaterialRef}
                vertices={vertices3}
                color="#60a5fa"
            />
        </>
    );
};
