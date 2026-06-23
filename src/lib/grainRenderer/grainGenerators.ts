import { clamp, radians, randomFromTo } from '@/lib/common';

export type GrainGeneratorParams = {
    type: 'cubic';
    grainSize: number;
    smoothing?: {
        minNeighbors: number;
        maxNeighbors: number;
    };
};
export type GrainGeneratorType = GrainGeneratorParams['type'];

/**
 * Отрисовка начинается с центральной клетки заданной сетки
 * и на каждом шаге двигается в случайном направлении, создавая случайную форму.
 */
function steppingGeneration(grainSize: number): boolean[] {
    const stepsBasis = grainSize ** 2;
    const minSteps = Math.ceil(stepsBasis / 2);
    const steps = randomFromTo(minSteps, stepsBasis);
    const grid: boolean[] = Array(grainSize ** 2).fill(false);

    let x = Math.floor(grainSize / 2);
    let y = Math.floor(grainSize / 2);
    grid[y * grainSize + x] = true;

    for (let i = 0; i < steps; i++) {
        const dir = Math.floor(randomFromTo(0, 4));
        if (dir == 0) x++;
        if (dir == 1) x--;
        if (dir == 2) y++;
        if (dir >= 3) y--;

        x = clamp(x, 0, grainSize - 1);
        y = clamp(y, 0, grainSize - 1);

        grid[y * grainSize + x] = true;
    }

    return grid;
}

/**
 * Сглаживание формы зернышка.
 */
function smoothGrain(
    grid: boolean[],
    grainSize: number,
    minNeighbors: number,
    maxNeighbors: number,
) {
    if (grainSize <= 1) {
        return grid;
    }

    const result = grid.slice();

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
                        grid[ny * grainSize + nx]
                    ) {
                        neighbors++;
                    }
                }
            }

            if (grid[y * grainSize + x] && neighbors < minNeighbors) {
                result[y * grainSize + x] = false;
            }
            if (!grid[y * grainSize + x] && neighbors >= maxNeighbors) {
                result[y * grainSize + x] = true;
            }
        }
    }

    return result;
}

function rotate(grid: boolean[], grainSize: number, angleDeg: number) {
    const result = grid.slice();

    const angleRad = radians(angleDeg);
    for (let y = 0; y < grainSize; y++) {
        for (let x = 0; x < grainSize; x++) {
            const rotatedX = Math.round(
                x * Math.cos(angleRad) + y * Math.sin(angleRad),
            );
            const rotatedY = Math.round(
                y * Math.cos(angleRad) + x * Math.sin(angleRad),
            );

            result[rotatedY * grainSize + rotatedX] = grid[y * grainSize + x];
        }
    }

    return result;
}

export function getGrainGenerator(params: GrainGeneratorParams) {
    switch (params.type) {
        case 'cubic':
            return () => {
                const { grainSize, smoothing } = params;

                const grid = steppingGeneration(grainSize);

                if (smoothing) {
                    return smoothGrain(
                        grid,
                        grainSize,
                        smoothing.minNeighbors,
                        smoothing.maxNeighbors,
                    );
                }

                return grid;
            };
    }
}
