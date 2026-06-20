import { GrainLayer } from '@/components/intro/entities/GrainLayer';
import { animate, lerpFactor, radians, randomFromTo } from '@/lib/common';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Object3D, ShaderMaterial, Vector3Like } from 'three';
import { lerp } from 'three/src/math/MathUtils.js';

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
    const rLayerRef = useRef<Object3D>(null);
    const gLayerRef = useRef<Object3D>(null);
    const bLayerRef = useRef<Object3D>(null);

    const rMaterialRef = useRef<ShaderMaterial>(null);
    const gMaterialRef = useRef<ShaderMaterial>(null);
    const bMaterialRef = useRef<ShaderMaterial>(null);

    useFrame((_, delta) => {
        const alpha = lerpFactor(0.9, delta) * 2;

        animate<{
            scale: number;
            rPosition: Vector3Like;
            bPosition: Vector3Like;
            rotation: Vector3Like;
            saturation: number;
        }>(
            (value) => {
                if (
                    !rLayerRef.current ||
                    !gLayerRef.current ||
                    !bLayerRef.current ||
                    !rMaterialRef.current ||
                    !gMaterialRef.current ||
                    !bMaterialRef.current
                ) {
                    return;
                }

                rLayerRef.current.scale.lerp(
                    { x: value.scale, y: value.scale, z: value.scale },
                    alpha,
                );
                gLayerRef.current.scale.lerp(
                    { x: value.scale, y: value.scale, z: value.scale },
                    alpha,
                );
                bLayerRef.current.scale.lerp(
                    { x: value.scale, y: value.scale, z: value.scale },
                    alpha,
                );

                rLayerRef.current.position.lerp(value.rPosition, alpha);
                bLayerRef.current.position.lerp(value.bPosition, alpha);

                rLayerRef.current.rotation.set(
                    lerp(rLayerRef.current.rotation.x, value.rotation.x, alpha),
                    lerp(rLayerRef.current.rotation.y, value.rotation.y, alpha),
                    lerp(rLayerRef.current.rotation.z, value.rotation.z, alpha),
                );
                gLayerRef.current.rotation.set(
                    lerp(gLayerRef.current.rotation.x, value.rotation.x, alpha),
                    lerp(gLayerRef.current.rotation.y, value.rotation.y, alpha),
                    lerp(gLayerRef.current.rotation.z, value.rotation.z, alpha),
                );
                bLayerRef.current.rotation.set(
                    lerp(gLayerRef.current.rotation.x, value.rotation.x, alpha),
                    lerp(gLayerRef.current.rotation.y, value.rotation.y, alpha),
                    lerp(gLayerRef.current.rotation.z, value.rotation.z, alpha),
                );

                rMaterialRef.current.uniforms.uSaturation.value = lerp(
                    rMaterialRef.current.uniforms.uSaturation.value,
                    value.saturation,
                    alpha,
                );
                gMaterialRef.current.uniforms.uSaturation.value = lerp(
                    gMaterialRef.current.uniforms.uSaturation.value,
                    value.saturation,
                    alpha,
                );
                bMaterialRef.current.uniforms.uSaturation.value = lerp(
                    bMaterialRef.current.uniforms.uSaturation.value,
                    value.saturation,
                    alpha,
                );
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
                if (
                    !rLayerRef.current ||
                    !gLayerRef.current ||
                    !bLayerRef.current ||
                    !rMaterialRef.current ||
                    !gMaterialRef.current ||
                    !bMaterialRef.current
                ) {
                    return;
                }

                rMaterialRef.current.uniforms.uGrayscale.value = lerp(
                    rMaterialRef.current.uniforms.uGrayscale.value,
                    grayscale,
                    alpha,
                );
                gMaterialRef.current.uniforms.uGrayscale.value = lerp(
                    gMaterialRef.current.uniforms.uGrayscale.value,
                    grayscale,
                    alpha,
                );
                bMaterialRef.current.uniforms.uGrayscale.value = lerp(
                    bMaterialRef.current.uniforms.uGrayscale.value,
                    grayscale,
                    alpha,
                );
            },
            [1, 0],
            grayscale ? 0 : 1,
        );
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
