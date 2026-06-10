import { Line, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { ColorRepresentation, Object3D } from 'three';

interface ArrowProps {
    text: string;
    length: number;
    pointerPosition: 'left' | 'right';
    linePosition: 'top' | 'bottom';
    color?: ColorRepresentation;
    position?: [number, number, number];
    float?: boolean;
}

export const Caption: React.FC<ArrowProps> = ({
    text,
    length,
    pointerPosition,
    color,
    position,
    linePosition,
    float,
}) => {
    const lineLength = pointerPosition === 'left' ? -length : length;
    const lineY = linePosition === 'top' ? 0.17 : -0.17;
    const pointerX = pointerPosition === 'left' ? -0.28 : 0.28;
    const pointerY = linePosition === 'top' ? 0.4 : -0.4;
    const lineOffset = pointerPosition === 'left' ? length / 2 : -length / 2;

    const captionRef = useRef<Object3D>(null);
    const time = useRef(0);

    useFrame((_, delta) => {
        if (!captionRef.current || !float) {
            return;
        }
        time.current += delta;

        captionRef.current.position.y = Math.sin(time.current * 1.6) * 0.05;
        captionRef.current.position.x = Math.cos(time.current * 1.2) * 0.03;
    });

    return (
        <object3D position={position}>
            <object3D ref={captionRef}>
                <Text fontSize={0.2} color={color}>
                    {text}
                </Text>
                <Line
                    points={[
                        [lineOffset, lineY, 0],
                        [lineOffset + lineLength, lineY, 0],
                        [lineOffset + lineLength, lineY, 0],
                        [
                            lineOffset + lineLength + pointerX,
                            lineY + pointerY,
                            0,
                        ],
                    ]}
                    lineWidth={2}
                    color={color}
                ></Line>
            </object3D>
        </object3D>
    );
};
