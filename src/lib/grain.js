const BYTE_MAX = 255;

/**
 * @typedef {{
 *      grainSize: number;
 *      stepsBasis: number;
 *      grainOffsetMax: number;
 *      filmResponsePower: number;
 *      grainColorMin: number;
 *      grainColorMax: number;
 *      grainColorAlpha: number;
 *      minNeighbors: number;
 *      maxNeighbors: number;
 * }} Layer
 * @typedef {{ layers: Layer[]; resultGridSize: number; }} GrainOptions
 * @typedef {{ width: number; height: number; pixels: Uint8Array<ArrayBuffer>; }} ImageData
 */

/**
 * @type {GrainOptions}
 */
export const defaultGrainOptions = {
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
 * @param {number} grainSize Размер сетки в пикселях, которую занимает одно зернышко.
 * @param {number} stepsBasis Среднее количество пикселей в зернышке, которое будет генерироваться при пошаговой отрисовке.
 * @returns {boolean[][]}
 */
function generateGrain(grainSize, stepsBasis) {
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
 * @param {boolean[][]} grid
 * @param {number} grainSize
 * @param {number} minNeighbors
 * @param {number} maxNeighbors
 * @returns Исходный массив grid
 */
function smoothGrain(grid, grainSize, minNeighbors, maxNeighbors) {
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

/**
 * Отрисовывает одно зернышко внутри заданного ctx
 * @param {CanvasRenderingContext2D} ctx
 * @param {number[][]} grain
 * @param {number} offsetX
 * @param {number} offsetY
 * @param {Layer} layer
 */
function drawGrain(ctx, grain, offsetX, offsetY, layer, pixelSize = 1) {
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

function filmResponse(pixel, filmResponsePower) {
    const normalizedPixel = pixel / BYTE_MAX;
    return Math.pow(normalizedPixel, filmResponsePower);
}

/**
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Layer} layer
 * @param {ImageData} image
 * @param {number} resultGridSize
 */
function drawLayer(ctx, layer, image, resultGridSize) {
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

/**
 *
 * @param { ImageData } imageData
 * @param { GrainOptions } options
 * @returns {{ width: number; height: number; dataUrl: string; }}
 */
export function getGrainImage(imageData, options) {
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
