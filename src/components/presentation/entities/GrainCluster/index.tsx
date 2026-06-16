import { Grain } from '@/components/presentation/entities/Grain';
import { grains } from '@/components/presentation/entities/GrainCluster/grains';
import { lerpFactor } from '@/lib/common';
import { useFrame } from '@react-three/fiber';
import { RefObject } from 'react';
import { BufferGeometry, Material } from 'three';

interface GrainClusterProps {
    geometry: RefObject<BufferGeometry>;
    material: RefObject<Material>;
    washedMaterial: RefObject<Material>;
    scattered?: boolean;
}

export const GrainCluster: React.FC<GrainClusterProps> = ({
    geometry,
    material,
    washedMaterial,
    scattered,
}) => {
    useFrame((state, delta) => {
        grains.forEach((grain) => {
            const grainObject = state.scene.getObjectByName(
                grain.id.toString(),
            );
            if (!grainObject) {
                return;
            }

            const alpha = lerpFactor(0.999, delta);
            const targetPosition = scattered
                ? grain.scatteredPosition
                : grain.densePosition;

            grainObject.position.lerp(
                {
                    x: targetPosition[0],
                    y: targetPosition[1],
                    z: targetPosition[2],
                },
                alpha,
            );
        });
    });

    return (
        <object3D>
            {grains.map(
                ({ id, phaseShift, scatteredPosition, washed, ...props }) => (
                    <object3D
                        {...props}
                        position={scatteredPosition}
                        name={id.toString()}
                        key={id}
                    >
                        <Grain
                            geometry={geometry}
                            material={washed ? washedMaterial : material}
                            float
                            phaseShift={phaseShift}
                        />
                    </object3D>
                ),
            )}
        </object3D>
    );
};
