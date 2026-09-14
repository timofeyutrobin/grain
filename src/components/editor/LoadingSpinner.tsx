import { PropsWithClassName, radians } from '@/lib/common';
import classNames from 'classnames';

const goldenRatio = (1 + Math.sqrt(5)) / 2;
const inverseGoldenRatio = 1 / goldenRatio;

const vertices = [
    ...[-1, 1].flatMap((x) =>
        [-1, 1].flatMap((y) => [-1, 1].map((z) => ({ x, y, z }))),
    ),
    ...[-1, 1].flatMap((y) =>
        [-1, 1].flatMap((z) => [
            { x: 0, y: y * inverseGoldenRatio, z: z * goldenRatio },
        ]),
    ),
    ...[-1, 1].flatMap((x) =>
        [-1, 1].map((z) => ({
            x: x * inverseGoldenRatio,
            y: z * goldenRatio,
            z: 0,
        })),
    ),
    ...[-1, 1].flatMap((x) =>
        [-1, 1].map((z) => ({
            x: x * goldenRatio,
            y: 0,
            z: z * inverseGoldenRatio,
        })),
    ),
];

const projectVertex = ({ x, y, z }: (typeof vertices)[number]) => ({
    x: 50 + (x - y) * 15,
    y: 50 + (x + y) * 7 - z * 19,
});

const rotateVertex = (
    { x, y, z }: (typeof vertices)[number],
    angle: number,
) => {
    const cos = Math.cos(radians(angle));
    const sin = Math.sin(radians(angle));
    const rotatedX = x * cos + z * sin;
    const rotatedZ = -x * sin + z * cos;

    return projectVertex({
        x: rotatedX,
        y: y * cos - rotatedZ * sin,
        z: y * sin + rotatedZ * cos,
    });
};

const edgeLength = 2 * inverseGoldenRatio;
const edges = vertices.flatMap((sourceVertex, sourceIndex) =>
    vertices.slice(sourceIndex + 1).flatMap((targetVertex, targetOffset) => {
        const distance = Math.sqrt(
            (sourceVertex.x - targetVertex.x) ** 2 +
                (sourceVertex.y - targetVertex.y) ** 2 +
                (sourceVertex.z - targetVertex.z) ** 2,
        );

        return Math.abs(distance - edgeLength) < 0.001
            ? [[sourceIndex, sourceIndex + targetOffset + 1]]
            : [];
    }),
);
const animationAngles = Array.from(
    { length: 25 },
    (_, index) => (index * 360) / 24,
);
const animationFrames = animationAngles.map((angle) =>
    vertices.map((vertex) => rotateVertex(vertex, angle)),
);
const createPath = (frame: ReturnType<typeof projectVertex>[]) =>
    edges
        .map(([sourceIndex, targetIndex]) => {
            const sourceVertex = frame[sourceIndex];
            const targetVertex = frame[targetIndex];

            return `M ${sourceVertex.x.toFixed(3)} ${sourceVertex.y.toFixed(3)} L ${targetVertex.x.toFixed(3)} ${targetVertex.y.toFixed(3)}`;
        })
        .join(' ');
const animationPathValues = animationFrames.map(createPath).join(';');

export const LoadingSpinner: React.FC<PropsWithClassName> = ({ className }) => {
    return (
        <svg
            className={classNames('h-32 w-32 stroke-stone-400/30', className)}
            fill="none"
            role="img"
            viewBox="0 0 100 115"
        >
            <path
                d={createPath(animationFrames[0])}
                strokeLinecap="round"
                strokeWidth="1"
            >
                <animate
                    attributeName="d"
                    calcMode="linear"
                    dur="8s"
                    repeatCount="indefinite"
                    values={animationPathValues}
                />
            </path>
            <text
                x={50}
                y={105}
                stroke="none"
                textAnchor="middle"
                className="text-sm fill-stone-400/50"
            >
                Developing
            </text>
        </svg>
    );
};
