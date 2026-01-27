import { SimpleImageData } from './common';

const BYTE_MAX = 255;

interface Layer {
    grainSize: number;
    stepsBasis: number;
    grainOffsetMax: number;
    filmResponsePower: number;
    grainColorMin: number;
    grainColorMax: number;
    grainColorAlpha: number;
    minNeighbors: number;
    maxNeighbors: number;
}

interface ColorLayer {
    innerLayers: Layer[];
    color: number;
}

interface GrainOptions {
    layers: Layer[];
    resultGridSize: number;
}

export const defaultGrainOptions: GrainOptions = {
    layers: [
        {
            grainSize: 1,
            stepsBasis: 0,
            grainOffsetMax: 1,
            filmResponsePower: 1.1,
            grainColorMin: BYTE_MAX - 25,
            grainColorMax: BYTE_MAX,
            grainColorAlpha: 0.3,
            minNeighbors: 0,
            maxNeighbors: 0,
        },
        {
            grainSize: 4,
            stepsBasis: 2,
            grainOffsetMax: 4,
            filmResponsePower: 1.8,
            grainColorMin: BYTE_MAX - 25,
            grainColorMax: BYTE_MAX,
            grainColorAlpha: 0.3,
            minNeighbors: 1,
            maxNeighbors: 2,
        },
        {
            grainSize: 9,
            stepsBasis: 10,
            grainOffsetMax: 5,
            filmResponsePower: 5,
            grainColorMin: BYTE_MAX - 25,
            grainColorMax: BYTE_MAX,
            grainColorAlpha: 0.5,
            minNeighbors: 3,
            maxNeighbors: 3,
        },
    ],
    resultGridSize: 4,
};

/**
 * Генерирует двухмерный массив чисел.
 * Представляет собой данные для отрисовки единственного зернышка.
 * Отрисовка начинается с центральной клетки заданной сетки
 * и на каждом шаге двигается в случайном направлении, создавая случайную форму.
 */
function generateGrain(grainSize: number, stepsBasis: number): boolean[][] {
    const minSteps = Math.floor(stepsBasis / 2);
    const steps = Math.random() * (stepsBasis - minSteps) + minSteps;
    const grid = Array.from({ length: grainSize }, () =>
        Array(grainSize).fill(false),
    );

    let x = Math.floor(grainSize / 2);
    let y = Math.floor(grainSize / 2);
    grid[y][x] = true;

    for (let i = 0; i < steps; i++) {
        const dir = Math.floor(Math.random() * 4);
        if (dir === 0) x++;
        if (dir === 1) x--;
        if (dir === 2) y++;
        if (dir === 3) y--;

        x = Math.max(0, Math.min(grainSize - 1, x));
        y = Math.max(0, Math.min(grainSize - 1, y));

        grid[y][x] = true;
    }

    return grid;
}

/**
 * Сглаживание формы зернышка. Числа в массиве меняются на месте.
 */
function smoothGrain(
    grid: boolean[][],
    grainSize: number,
    minNeighbors: number,
    maxNeighbors: number,
) {
    if (grainSize <= 1) {
        return grid;
    }

    const result = grid.map((row) => row.slice());

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
                        grid[ny][nx]
                    ) {
                        neighbors++;
                    }
                }
            }

            if (grid[y][x] && neighbors < minNeighbors) {
                result[y][x] = false;
            }
            if (!grid[y][x] && neighbors >= maxNeighbors) {
                result[y][x] = true;
            }
        }
    }

    return result;
}

/**
 * Отрисовывает одно зернышко внутри заданного ctx
 */
function drawGrain(
    ctx: CanvasRenderingContext2D,
    grain: boolean[][],
    offsetX: number,
    offsetY: number,
    layer: Layer,
    pixelSize = 1,
) {
    const {
        grainSize,
        grainColorMax,
        grainColorMin,
        grainColorAlpha,
        grainOffsetMax,
    } = layer;
    for (let y = 0; y < grainSize; y++) {
        for (let x = 0; x < grainSize; x++) {
            if (grain[y][x]) {
                const grayColor = Math.floor(
                    Math.random() * (grainColorMax - grainColorMin) +
                        grainColorMin,
                );
                ctx.fillStyle = `rgba(${grayColor}, ${grayColor}, ${grayColor}, ${grainColorAlpha})`;

                const randomOffsetX =
                    Math.random() * grainOffsetMax * 2 - grainOffsetMax;
                const randomOffsetY =
                    Math.random() * grainOffsetMax * 2 - grainOffsetMax;

                ctx.fillRect(
                    offsetX + randomOffsetX + x * pixelSize,
                    offsetY + randomOffsetY + y * pixelSize,
                    pixelSize,
                    pixelSize,
                );
            }
        }
    }
}

function filmResponse(pixel: number, filmResponsePower: number) {
    const normalizedPixel = pixel / BYTE_MAX;
    return Math.pow(normalizedPixel, filmResponsePower);
}

function drawLayer(
    ctx: CanvasRenderingContext2D,
    layer: Layer,
    image: SimpleImageData,
    resultGridSize: number,
) {
    for (let i = 0; i < image.height; i++) {
        for (let j = 0; j < image.width; j++) {
            if (
                Math.random() <
                filmResponse(
                    image.pixels[i * image.width + j],
                    layer.filmResponsePower,
                )
            ) {
                const grain = smoothGrain(
                    generateGrain(layer.grainSize, layer.stepsBasis),
                    layer.grainSize,
                    layer.minNeighbors,
                    layer.maxNeighbors,
                );
                drawGrain(
                    ctx,
                    grain,
                    j * Math.ceil(resultGridSize / 2),
                    i * Math.ceil(resultGridSize / 2),
                    layer,
                );
            }
        }
    }
}

export function getGrainImage(
    imageData: SimpleImageData,
    options: GrainOptions,
): { width: number; height: number; dataUrl: string } {
    const { width, height } = imageData;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = width * Math.ceil(options.resultGridSize / 2);
    canvas.height = height * Math.ceil(options.resultGridSize / 2);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    options.layers.forEach((layer) => {
        drawLayer(ctx, layer, imageData, options.resultGridSize);
    });

    return {
        dataUrl: canvas.toDataURL('image/jpeg'),
        width: canvas.width,
        height: canvas.height,
    };
}
