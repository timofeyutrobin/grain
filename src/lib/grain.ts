import { Layer, Channel, GrainOptions } from './grainOptions';

const BYTE_MAX = 255;

/**
 * Генерирует двухмерный массив чисел.
 * Представляет собой данные для отрисовки единственного зернышка.
 * Отрисовка начинается с центральной клетки заданной сетки
 * и на каждом шаге двигается в случайном направлении, создавая случайную форму.
 */
function generateGrain(grainSize: number, stepsBasis: number): boolean[][] {
    const minSteps = Math.floor(stepsBasis / 2);
    const steps = Math.random() * (stepsBasis - minSteps) + minSteps;
    const grid: boolean[][] = Array.from({ length: grainSize }, () =>
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
        grainBrightnessMax,
        grainBrightnessMin,
        grainColorAlpha,
        grainOffsetMax,
        color,
    } = layer;
    for (let y = 0; y < grainSize; y++) {
        for (let x = 0; x < grainSize; x++) {
            if (grain[y][x]) {
                const brightness = Math.floor(
                    Math.random() * (grainBrightnessMax - grainBrightnessMin) +
                        grainBrightnessMin,
                );

                ctx.fillStyle = `hsla(${color?.hue ?? 0}, ${color?.saturation ?? 0}%, ${brightness}%, ${grainColorAlpha})`;

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

function* nextPixel(rgbaPixels: Uint8ClampedArray, channel: Channel) {
    for (let i = 0, j = 0; i < rgbaPixels.length; i += 4, j++) {
        const r = rgbaPixels[i];
        const g = rgbaPixels[i + 1];
        const b = rgbaPixels[i + 2];

        if (channel === 'grayscale') {
            yield Math.round(0.299 * r + 0.587 * g + 0.114 * b);
        } else if (channel === 'r') {
            yield r;
        } else if (channel === 'g') {
            yield g;
        } else if (channel === 'b') {
            yield b;
        }
    }
}

function drawLayer(
    ctx: CanvasRenderingContext2D,
    layer: Layer,
    image: SimpleImageData,
    resultGridSize: number,
) {
    let i = 0;
    for (let pixel of nextPixel(image.pixels, layer.channel)) {
        {
            if (Math.random() < filmResponse(pixel, layer.filmResponsePower)) {
                const grain = smoothGrain(
                    generateGrain(layer.grainSize, layer.stepsBasis),
                    layer.grainSize,
                    layer.minNeighbors,
                    layer.maxNeighbors,
                );
                drawGrain(
                    ctx,
                    grain,
                    (i % image.width) * resultGridSize,
                    Math.floor(i / image.width) * resultGridSize,
                    layer,
                );
            }
        }
        i++;
    }
}

export function getGrainImage(
    imageData: SimpleImageData,
    options: GrainOptions,
): { width: number; height: number; dataUrl: string } {
    const { width, height } = imageData;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = width * options.resultGridSize;
    canvas.height = height * options.resultGridSize;

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
