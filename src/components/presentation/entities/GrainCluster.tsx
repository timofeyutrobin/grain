import { Grain } from '@/components/presentation/entities/Grain';
import { lerpFactor } from '@/lib/common';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';

const grains = [
    {
        id: 1,
        position: [-1, -0.6, 1],
        scatteredPosition: [-6, -3, 4],
        densePosition: new Vector3(-1, -0.6, 1).multiplyScalar(0.5).toArray(),
        rotation: [4.82, 1.37, 2.91],
        phaseShift: 0.2,
        scale: 0.31,
        denseScale: 0.16,
    },
    {
        id: 2,
        position: [-2, -0.8, 1],
        scatteredPosition: [-7, -4, 3.5],
        densePosition: new Vector3(-2, -0.8, 1).multiplyScalar(0.5).toArray(),
        rotation: [0.56, 5.74, 1.24],
        phaseShift: 0.8,
        scale: 0.41,
        denseScale: 0.21,
    },
    {
        id: 3,
        position: [1, 1.1, 1],
        scatteredPosition: [6, 3.5, 2.5],
        densePosition: new Vector3(1, 1.1, 1).multiplyScalar(0.5).toArray(),
        rotation: [3.18, 2.45, 4.67],
        phaseShift: 1.4,
        scale: 0.36,
        denseScale: 0.18,
    },
    {
        id: 4,
        position: [-2, -1, -0.4],
        scatteredPosition: [-6.5, -2.5, -3],
        densePosition: new Vector3(-2, -1, -0.4).multiplyScalar(0.5).toArray(),
        rotation: [1.92, 0.83, 5.38],
        phaseShift: 2.1,
        scale: 0.2,
        denseScale: 0.1,
    },
    {
        id: 5,
        position: [-3, -1.6, 1.2],
        scatteredPosition: [-7, -3.5, 4],
        densePosition: new Vector3(-3, -1.6, 1.2).multiplyScalar(0.5).toArray(),
        rotation: [5.61, 3.04, 0.47],
        phaseShift: 2.7,
        scale: 0.39,
        denseScale: 0.2,
    },
    {
        id: 6,
        position: [4, -1.1, 0],
        scatteredPosition: [7, -2, -2],
        densePosition: new Vector3(4, -1.1, 0).multiplyScalar(0.5).toArray(),
        rotation: [2.73, 4.51, 2.18],
        phaseShift: 3.3,
        scale: 0.44,
        denseScale: 0.22,
    },
    {
        id: 7,
        position: [-4.6, -1.4, 0.05],
        scatteredPosition: [-8, -4, 1],
        densePosition: new Vector3(-4.6, -1.4, 0.05)
            .multiplyScalar(0.5)
            .toArray(),
        rotation: [0.31, 1.76, 3.89],
        phaseShift: 3.9,
        scale: 0.33,
        denseScale: 0.17,
    },
    {
        id: 8,
        position: [-2.3, -0.5, -0.12],
        scatteredPosition: [-6, -2, -2],
        densePosition: new Vector3(-2.3, -0.5, -0.12)
            .multiplyScalar(0.5)
            .toArray(),
        rotation: [4.27, 5.92, 1.63],
        phaseShift: 4.5,
        scale: 0.37,
        denseScale: 0.19,
    },
    {
        id: 9,
        position: [0.1, -1.3, 0.18],
        scatteredPosition: [1, -4, 2],
        densePosition: new Vector3(0.1, -1.3, 0.18)
            .multiplyScalar(0.5)
            .toArray(),
        rotation: [2.14, 3.68, 5.05],
        phaseShift: 5.1,
        scale: 0.42,
        denseScale: 0.21,
    },
    {
        id: 10,
        position: [2.7, -0.7, -0.08],
        scatteredPosition: [7, -3.5, -2],
        densePosition: new Vector3(2.7, -0.7, -0.08)
            .multiplyScalar(0.5)
            .toArray(),
        rotation: [5.48, 0.95, 2.76],
        phaseShift: 6.7,
        scale: 0.48,
        denseScale: 0.24,
    },
    {
        id: 11,
        position: [4.8, 1, 0.11],
        scatteredPosition: [8, 3, 0],
        densePosition: new Vector3(4.8, 1, 0.11).multiplyScalar(0.5).toArray(),
        rotation: [1.37, 4.12, 0.58],
        phaseShift: 0.4,
        scale: 0.52,
        denseScale: 0.26,
    },
    {
        id: 12,
        position: [-3.8, 0.8, -0.21],
        scatteredPosition: [-7, 0, -3],
        densePosition: new Vector3(-3.8, 0.8, -0.21)
            .multiplyScalar(0.5)
            .toArray(),
        rotation: [3.95, 2.87, 4.34],
        phaseShift: 1.0,
        scale: 0.35,
        denseScale: 0.18,
    },
    {
        id: 13,
        position: [-1.4, 1.6, 0.07],
        scatteredPosition: [-4.5, 4, 1],
        densePosition: new Vector3(-1.4, 1.6, 0.07)
            .multiplyScalar(0.5)
            .toArray(),
        rotation: [0.79, 5.23, 1.91],
        phaseShift: 1.6,
        scale: 0.4,
        denseScale: 0.2,
    },
    {
        id: 14,
        position: [1.2, 0.7, -0.15],
        scatteredPosition: [5, -2, -1],
        densePosition: new Vector3(1.2, 0.7, -0.15)
            .multiplyScalar(0.5)
            .toArray(),
        rotation: [4.64, 1.58, 3.42],
        phaseShift: 2.2,
        scale: 0.46,
        denseScale: 0.23,
    },
    {
        id: 15,
        position: [-18, -10, 7],
        scatteredPosition: [-20, -12, 10],
        densePosition: [-3.5, -1.3, 1.5],
        rotation: [1.5, 2.3, 0.8],
        phaseShift: 0.3,
        scale: 0.34,
        denseScale: 0.34,
    },
    {
        id: 16,
        position: [16, 12, -8],
        scatteredPosition: [18, 14, -10],
        densePosition: [2.2, 2.0, -1.8],
        rotation: [3.2, 1.1, 4.5],
        phaseShift: 0.9,
        scale: 0.38,
        denseScale: 0.38,
    },
    {
        id: 17,
        position: [-17, 8, -6],
        scatteredPosition: [-19, 10, -8],
        densePosition: [-2, 1, 3],
        rotation: [2.8, 4.2, 1.3],
        phaseShift: 1.5,
        scale: 0.32,
        denseScale: 0.32,
    },
    {
        id: 18,
        position: [15, -14, 5],
        scatteredPosition: [17, -16, 7],
        densePosition: [0.6, -2.2, -4],
        rotation: [0.7, 3.8, 5.1],
        phaseShift: 2.1,
        scale: 0.41,
        denseScale: 0.4,
    },
    {
        id: 19,
        position: [-16, 11, 8],
        scatteredPosition: [-18, 13, 10],
        densePosition: [-2.2, 0.5, 1.8],
        rotation: [4.1, 0.9, 2.7],
        phaseShift: 2.6,
        scale: 0.36,
        denseScale: 0.2,
    },
    {
        id: 20,
        position: [17, 9, -7],
        scatteredPosition: [19, 11, -9],
        densePosition: [2.8, 1.5, -3],
        rotation: [1.2, 5.3, 3.5],
        phaseShift: 3.2,
        scale: 0.39,
        denseScale: 0.39,
    },
    {
        id: 21,
        position: [-15, -12, -5],
        scatteredPosition: [-17, -14, -3],
        densePosition: [-2.0, -2.5, -1.0],
        rotation: [3.6, 2.1, 1.8],
        phaseShift: 3.8,
        scale: 0.43,
        denseScale: 0.3,
    },
    {
        id: 22,
        position: [18, -11, 6],
        scatteredPosition: [20, -13, 8],
        densePosition: [2.3, -1.8, 0.5],
        rotation: [2.3, 3.6, 4.9],
        phaseShift: 4.4,
        scale: 0.37,
        denseScale: 0.2,
    },
    {
        id: 23,
        position: [-19, 6, 9],
        scatteredPosition: [-21, 8, 11],
        densePosition: [-2.6, -0.3, 1.0],
        rotation: [0.5, 1.4, 2.6],
        phaseShift: 5.0,
        scale: 0.4,
        denseScale: 0.4,
    },
    {
        id: 24,
        position: [14, 13, -9],
        scatteredPosition: [16, 15, -11],
        densePosition: [2.0, 2.2, -5],
        rotation: [4.8, 4.7, 0.9],
        phaseShift: 5.6,
        scale: 0.44,
        denseScale: 0.44,
    },
    {
        id: 25,
        position: [-14, -11, 4],
        scatteredPosition: [-16, -13, 6],
        densePosition: [-2.3, -1.5, 1.0],
        rotation: [1.9, 2.5, 3.1],
        phaseShift: 6.2,
        scale: 0.33,
        denseScale: 0.33,
    },
    {
        id: 26,
        position: [16, -10, 7],
        scatteredPosition: [18, -12, 9],
        densePosition: [2.6, -1.2, 1.8],
        rotation: [3.4, 5.2, 2.2],
        phaseShift: 6.8,
        scale: 0.45,
        denseScale: 0.45,
    },
    {
        id: 27,
        position: [-18, 10, -4],
        scatteredPosition: [-20, 12, -6],
        densePosition: [-2.4, 2.0, -1.3],
        rotation: [2.1, 0.6, 5.5],
        phaseShift: 0.5,
        scale: 0.35,
        denseScale: 0.35,
    },
    {
        id: 28,
        position: [19, -8, -5],
        scatteredPosition: [21, -10, -7],
        densePosition: [2.2, -2.0, -1.5],
        rotation: [5.0, 3.3, 1.5],
        phaseShift: 1.1,
        scale: 0.42,
        denseScale: 0.42,
    },
    {
        id: 29,
        position: [20, 10, 8],
        scatteredPosition: [22, 12, 10],
        densePosition: [-1.2, 0.8, 1.0],
        rotation: [1.1, 3.2, 2.8],
        phaseShift: 1.3,
        scale: 0.38,
        denseScale: 0.38,
    },
    {
        id: 30,
        position: [-20, 12, -7],
        scatteredPosition: [-22, 14, -9],
        densePosition: [1.5, -1.2, -3],
        rotation: [4.3, 1.9, 3.6],
        phaseShift: 2.0,
        scale: 0.4,
        denseScale: 0.4,
    },
    {
        id: 31,
        position: [18, -13, 6],
        scatteredPosition: [20, -15, 8],
        densePosition: [-0.8, 1.5, 1.3],
        rotation: [2.7, 4.1, 1.2],
        phaseShift: 2.7,
        scale: 0.36,
        denseScale: 0.36,
    },
    {
        id: 32,
        position: [-19, -11, 9],
        scatteredPosition: [-21, -13, 11],
        densePosition: [1.0, 0.6, 1.5],
        rotation: [3.9, 2.3, 4.7],
        phaseShift: 3.3,
        scale: 0.41,
        denseScale: 0.41,
    },
    {
        id: 33,
        position: [21, 7, -8],
        scatteredPosition: [23, 9, -10],
        densePosition: [-1.5, -0.8, 1],
        rotation: [0.8, 5.1, 2.4],
        phaseShift: 3.9,
        scale: 0.39,
        denseScale: 0.39,
    },
    {
        id: 34,
        position: [-21, 9, 5],
        scatteredPosition: [-23, 11, 7],
        densePosition: [0.4, 1.2, -2.5],
        rotation: [4.5, 0.7, 3.2],
        phaseShift: 4.5,
        scale: 0.37,
        denseScale: 0.37,
    },
    {
        id: 35,
        position: [19, -9, -6],
        scatteredPosition: [21, -11, -8],
        densePosition: [-0.6, -1.3, -1.2],
        rotation: [2.2, 3.5, 5.0],
        phaseShift: 5.1,
        scale: 0.43,
        denseScale: 0.43,
    },
    {
        id: 36,
        position: [-22, -8, -5],
        scatteredPosition: [-24, -10, -7],
        densePosition: [1.8, -0.5, 1],
        rotation: [3.4, 2.8, 1.9],
        phaseShift: 5.7,
        scale: 0.35,
        denseScale: 0.35,
    },
    {
        id: 37,
        position: [22, -5, 7],
        scatteredPosition: [24, -7, 9],
        densePosition: [-1.0, 0.3, -1],
        rotation: [1.6, 4.2, 3.8],
        phaseShift: 6.3,
        scale: 0.44,
        denseScale: 0.44,
    },
    {
        id: 38,
        position: [-20, 7, 6],
        scatteredPosition: [-22, 9, 8],
        densePosition: [0.7, 1.8, 0],
        rotation: [4.1, 1.3, 2.5],
        phaseShift: 6.9,
        scale: 0.38,
        denseScale: 0.38,
    },
    {
        id: 39,
        position: [20, -12, -7],
        scatteredPosition: [22, -14, -9],
        densePosition: [-1.3, -2.0, -0.5],
        rotation: [2.9, 5.0, 4.1],
        phaseShift: 0.6,
        scale: 0.42,
        denseScale: 0.42,
    },
    {
        id: 40,
        position: [-18, 13, -8],
        scatteredPosition: [-20, 15, -10],
        densePosition: [1.6, 0.9, 2.5],
        rotation: [3.7, 2.6, 0.8],
        phaseShift: 1.2,
        scale: 0.36,
        denseScale: 0.36,
    },
    {
        id: 41,
        position: [21, 5, 8],
        scatteredPosition: [23, 7, 10],
        densePosition: [-0.5, 1.5, -1.4],
        rotation: [1.4, 3.9, 3.3],
        phaseShift: 1.8,
        scale: 0.4,
        denseScale: 0.4,
    },
    {
        id: 42,
        position: [-19, -14, 5],
        scatteredPosition: [-21, -16, 7],
        densePosition: [0.9, -1.8, 0.8],
        rotation: [4.6, 1.5, 2.3],
        phaseShift: 2.4,
        scale: 0.39,
        denseScale: 0.39,
    },
] as const;

interface GrainClusterProps {
    scattered?: boolean;
}

export const GrainCluster: React.FC<GrainClusterProps> = ({ scattered }) => {
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
                ({
                    id,
                    phaseShift,
                    scatteredPosition,
                    denseScale,
                    ...props
                }) => (
                    <object3D
                        {...props}
                        name={id.toString()}
                        key={id}
                        scale={denseScale}
                    >
                        <Grain float phaseShift={phaseShift} />
                    </object3D>
                ),
            )}
        </object3D>
    );
};
