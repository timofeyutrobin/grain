import { Channel, clamp, randomFromTo } from '@/lib/common';

export type GrainGeneratorParams = {
    type: 'cubic';
    grainSize: number;
    smoothing?: {
        minNeighbors: number;
        maxNeighbors: number;
    };
};
export type GrainGeneratorType = 'cubic';

const buffer: boolean[] = [];

/**
 * Отрисовка начинается с центральной клетки заданной сетки
 * и на каждом шаге двигается в случайном направлении, создавая случайную форму.
 */
function steppingGeneration(grainSize: number): void {
    const stepsBasis = grainSize ** 2;
    const minSteps = Math.ceil(stepsBasis / 2);
    const steps = randomFromTo(minSteps, stepsBasis);

    let x = Math.floor(grainSize / 2);
    let y = Math.floor(grainSize / 2);
    buffer[y * grainSize + x] = true;

    for (let i = 0; i < steps; i++) {
        const dir = Math.floor(randomFromTo(0, 4));
        if (dir == 0) x++;
        if (dir == 1) x--;
        if (dir == 2) y++;
        if (dir >= 3) y--;

        x = clamp(x, 0, grainSize - 1);
        y = clamp(y, 0, grainSize - 1);

        buffer[y * grainSize + x] = true;
    }
}

/**
 * Сглаживание формы зернышка.
 */
function smoothGrain(
    grainSize: number,
    minNeighbors: number,
    maxNeighbors: number,
) {
    if (grainSize <= 1) {
        return;
    }

    for (let y = 0; y < grainSize; y++) {
        for (let x = 0; x < grainSize; x++) {
            let neighbors = 0;

            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    if (dx === 0 && dy === 0) continue;
                    const nx = x + dx;
                    const ny = y + dy;
                    if (
                        nx >= 0 &&
                        nx < grainSize &&
                        ny >= 0 &&
                        ny < grainSize &&
                        buffer[ny * grainSize + nx]
                    ) {
                        neighbors++;
                    }
                }
            }

            if (buffer[y * grainSize + x] && neighbors < minNeighbors) {
                buffer[y * grainSize + x] = false;
            }
            if (!buffer[y * grainSize + x] && neighbors >= maxNeighbors) {
                buffer[y * grainSize + x] = true;
            }
        }
    }
}

export function getGrainGenerator(type: GrainGeneratorType) {
    switch (type) {
        case 'cubic':
            return (
                size: number,
                imageX: number,
                imageY: number,
                channel: Channel,
                addPixel: (x: number, y: number, channel: Channel) => void,
            ) => {
                steppingGeneration(size);
                smoothGrain(size, 3, 3);

                buffer.forEach((pixel, i) => {
                    pixel &&
                        addPixel(
                            (i % size) + imageX,
                            Math.floor(i / size) + imageY,
                            channel,
                        );
                });

                buffer.fill(false);
            };
    }
}
