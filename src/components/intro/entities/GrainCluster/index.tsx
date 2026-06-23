import { Grain } from '@/components/intro/entities/Grain';
import { grains } from '@/components/intro/entities/GrainCluster/grains';
import { useFrame } from '@react-three/fiber';
import { BufferGeometry, Material } from 'three';
import { damp } from 'three/src/math/MathUtils.js';

interface GrainClusterProps {
    geometry: BufferGeometry;
    material: Material;
    washedMaterial: Material;
    scattered?: boolean;
}

export const GrainCluster: React.FC<GrainClusterProps> = ({
    geometry,
    material,
    washedMaterial,
    scattered,
}) => {
    'use no memo';

    useFrame((state, delta) => {
        grains.forEach((grain) => {
            const grainObject = state.scene.getObjectByName(
                grain.id.toString(),
            );
            if (!grainObject) {
                return;
            }

            const lambda = 6;
            const targetPosition = scattered
                ? grain.scatteredPosition
                : grain.densePosition;

            grainObject.position.set(
                damp(grainObject.position.x, targetPosition[0], lambda, delta),
                damp(grainObject.position.y, targetPosition[1], lambda, delta),
                damp(grainObject.position.z, targetPosition[2], lambda, delta),
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
