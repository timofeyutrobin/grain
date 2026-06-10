import { Caption } from '@/components/presentation/entities/Caption';
import { Grain } from '@/components/presentation/entities/Grain';

const grains = [
    {
        id: 0,
        rotation: [0.8, 0.9, 0],
        phaseShift: 0,
        scale: 0.7,
    },
    {
        id: 1,
        position: [-1, -1 + 0.4, 1],
        rotation: [4.82, 1.37, 2.91],
        phaseShift: 0.2,
        scale: 0.31,
    },
    {
        id: 2,
        position: [-2, -1.2 + 0.4, 1],
        rotation: [0.56, 5.74, 1.24],
        phaseShift: 0.8,
        scale: 0.41,
    },
    {
        id: 3,
        position: [1, 0.7 + 0.4, 1],
        rotation: [3.18, 2.45, 4.67],
        phaseShift: 1.4,
        scale: 0.36,
    },
    {
        id: 4,
        position: [-2, -1.4 + 0.4, -0.4],
        rotation: [1.92, 0.83, 5.38],
        phaseShift: 2.1,
        scale: 0.2,
    },
    {
        id: 5,
        position: [-3, -2 + 0.4, 1.2],
        rotation: [5.61, 3.04, 0.47],
        phaseShift: 2.7,
        scale: 0.39,
    },
    {
        id: 6,
        position: [4, -1.5 + 0.4, 0],
        rotation: [2.73, 4.51, 2.18],
        phaseShift: 3.3,
        scale: 0.44,
    },
    {
        id: 7,
        position: [-4.6, -1.8 + 0.4, 0.05],
        rotation: [0.31, 1.76, 3.89],
        phaseShift: 3.9,
        scale: 0.33,
    },
    {
        id: 8,
        position: [-2.3, -0.9 + 0.4, -0.12],
        rotation: [4.27, 5.92, 1.63],
        phaseShift: 4.5,
        scale: 0.37,
    },
    {
        id: 9,
        position: [0.1, -1.7 + 0.4, 0.18],
        rotation: [2.14, 3.68, 5.05],
        phaseShift: 5.1,
        scale: 0.42,
    },
    {
        id: 10,
        position: [2.7, -1.1 + 0.4, -0.08],
        rotation: [5.48, 0.95, 2.76],
        phaseShift: 6.7,
        scale: 0.48,
    },
    {
        id: 11,
        position: [4.8, 0.6 + 0.4, 0.11],
        rotation: [1.37, 4.12, 0.58],
        phaseShift: 0.4,
        scale: 0.52,
    },
    {
        id: 12,
        position: [-3.8, 0.4 + 0.4, -0.21],
        rotation: [3.95, 2.87, 4.34],
        phaseShift: 1.0,
        scale: 0.35,
    },
    {
        id: 13,
        position: [-1.4, 1.2 + 0.4, 0.07],
        rotation: [0.79, 5.23, 1.91],
        phaseShift: 1.6,
        scale: 0.4,
    },
    {
        id: 14,
        position: [1.2, 0.3 + 0.4, -0.15],
        rotation: [4.64, 1.58, 3.42],
        phaseShift: 2.2,
        scale: 0.46,
    },
] as const;

export const Slide2: React.FC = () => {
    return (
        <>
            <directionalLight position={[0, -3, 3]} intensity={10} />
            <object3D name="cluster">
                {grains.map(({ id, phaseShift, ...props }) => (
                    <object3D key={id} {...props}>
                        <Grain float phaseShift={phaseShift} />
                    </object3D>
                ))}
                <Caption
                    float
                    text="Photographic emulsion has a lot of grain."
                    position={[-2.7, 1.2, 1]}
                    length={4}
                    linePosition="bottom"
                    pointerPosition="right"
                />
            </object3D>
        </>
    );
};
