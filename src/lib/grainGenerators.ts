import {
    GrainGeneratorParams,
    GrainGeneratorType,
} from './grainRenderParameters';

/**
 * Сглаживание формы зернышка. Числа в массиве меняются на месте.
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

export const grainGenerators: {
    [GrainType in GrainGeneratorType]: (
        params: GrainGeneratorParams[GrainType],
    ) => boolean[];
} = {
    /**
     * Отрисовка начинается с центральной клетки заданной сетки
     * и на каждом шаге двигается в случайном направлении, создавая случайную форму.
     */
    cubic: (params) => {
        const { stepsBasis, grainSize, smoothing } = params;

        const minSteps = Math.ceil(stepsBasis / 2);
        const steps = Math.random() * (stepsBasis - minSteps) + minSteps;
        const grid: boolean[] = Array(grainSize ** 2).fill(false);

        let x = Math.floor(grainSize / 2);
        let y = Math.floor(grainSize / 2);
        grid[y * grainSize + x] = true;

        for (let i = 0; i < steps; i++) {
            const dir = Math.floor(Math.random() * 4);
            if (dir === 0) x++;
            if (dir === 1) x--;
            if (dir === 2) y++;
            if (dir === 3) y--;

            x = Math.max(0, Math.min(grainSize - 1, x));
            y = Math.max(0, Math.min(grainSize - 1, y));

            grid[y * grainSize + x] = true;
        }

        if (smoothing) {
            return smoothGrain(
                grid,
                grainSize,
                smoothing.minNeighbors,
                smoothing.maxNeighbors,
            );
        }

        return grid;
    },
    // TODO: not implemented
    tabular: () => {
        return [
            false,
            false,
            true,
            true,
            false,
            false,
            false,
            false,
            true,
            true,
            false,
            false,
            false,
            false,
            true,
            true,
            false,
            false,
            true,
            true,
            false,
            false,
            true,
            true,
            true,
            true,
            false,
            false,
            true,
            true,
            false,
            false,
            false,
            false,
            false,
            false,
        ];
    },
};
