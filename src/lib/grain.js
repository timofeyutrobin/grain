import { getPixelsGrayscale } from './files';

const BYTE_MAX = 255;

const grainSize = 9;
const stepsBasis = 10;
const minSteps = Math.floor(stepsBasis / 2);

const minNeighbors = 3;
const maxNeighbors = 3;

const pixelSize = 1; // масштаб для визуализации

const readingPixelSize = 1;
const resultGridSize = 4;

const grainOffsetMaxPixels = 10;

const filmResponsePower = 1.8;

const grainColorMin = BYTE_MAX - 25;
const grainColorMax = BYTE_MAX;

/**
 * Генерирует двухмерный массив чисел.
 * Представляет собой данные для отрисовки единственного зернышка
 * @returns {boolean[][]}
 */
function generateGrain() {
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
 * Сглаживание формы зернышка
 * @param {boolean[][]} grid
 * @returns Исходный массив grid, измененный in place
 */
function smoothGrain(grid) {
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

            if (grid[y][x] === 1 && neighbors < minNeighbors) {
                result[y][x] = false;
            }
            if (grid[y][x] === 0 && neighbors >= maxNeighbors) {
                result[y][x] = true;
            }
        }
    }

    return result;
}

function drawGrain(ctx, offsetX, offsetY) {
    const grain = smoothGrain(generateGrain());

    for (let y = 0; y < grainSize; y++) {
        for (let x = 0; x < grainSize; x++) {
            if (grain[y][x]) {
                const grayColor = Math.floor(
                    Math.random() * (grainColorMax - grainColorMin) +
                        grainColorMin,
                );
                ctx.fillStyle = `rgb(${grayColor}, ${grayColor}, ${grayColor})`;

                const randomOffsetX =
                    Math.random() * grainOffsetMaxPixels * 2 -
                    grainOffsetMaxPixels;
                const randomOffsetY =
                    Math.random() * grainOffsetMaxPixels * 2 -
                    grainOffsetMaxPixels;

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

function filmResponse(pixel) {
    const normalizedPixel = pixel / BYTE_MAX;
    return Math.pow(normalizedPixel, filmResponsePower);
}

export async function getGrainImage(file) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const { width, height, pixels } = await getPixelsGrayscale(
        file,
        readingPixelSize,
    );
    canvas.width = width * Math.ceil(resultGridSize / 2);
    canvas.height = height * Math.ceil(resultGridSize / 2);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            if (Math.random() < filmResponse(pixels[i * width + j])) {
                drawGrain(
                    ctx,
                    j * Math.ceil(resultGridSize / 2),
                    i * Math.ceil(resultGridSize / 2),
                );
            }
        }
    }
    return {
        data: canvas.toDataURL('image/jpeg'),
        width: canvas.width,
        height: canvas.height,
    };
}
