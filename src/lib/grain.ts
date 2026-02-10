import { SimpleImageData } from './common';
import { GrainRenderParameters, Layer } from './grainRenderParameters';
import { addPixelHsl, nextPixel } from './image';

/**
 * Генерирует двухмерный булевых значений.
 * Представляет собой данные для отрисовки единственного зернышка.
 * Отрисовка начинается с центральной клетки заданной сетки
 * и на каждом шаге двигается в случайном направлении, создавая случайную форму.
 */
function generateGrain(grainSize: number, stepsBasis: number): boolean[][] {
    const minSteps = Math.ceil(stepsBasis / 2);
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

function drawGrain(
    dest: SimpleImageData,
    grain: boolean[][],
    offsetX: number,
    offsetY: number,
    layer: Layer,
) {
    const {
        grainSize,
        grainBrightnessMax = 100,
        grainBrightnessMin = 80,
        grainColorAlpha,
        grainOffsetMax,
        color,
    } = layer;
    const { width, pixels } = dest;
    for (let y = 0; y < grainSize; y++) {
        for (let x = 0; x < grainSize; x++) {
            if (grain[y][x]) {
                const brightness = color
                    ? color.v
                    : Math.floor(
                          Math.random() *
                              (grainBrightnessMax - grainBrightnessMin) +
                              grainBrightnessMin,
                      );

                const randomOffsetX = Math.round(
                    Math.random() * grainOffsetMax * 2 - grainOffsetMax,
                );
                const randomOffsetY = Math.round(
                    Math.random() * grainOffsetMax * 2 - grainOffsetMax,
                );

                const finalX = offsetX + randomOffsetX + x;
                const finalY = offsetY + randomOffsetY + y;

                addPixelHsl(
                    pixels,
                    width,
                    finalX,
                    finalY,
                    color?.h ?? 0,
                    color?.s ?? 0,
                    brightness,
                    grainColorAlpha,
                );
            }
        }
    }
}

function filmResponse(pixel: number, filmResponsePower: number) {
    return Math.pow(pixel, filmResponsePower);
}

function drawLayer(
    layer: Layer,
    src: SimpleImageData,
    dest: SimpleImageData,
    resultGridSize: number,
) {
    let i = 0;
    for (let pixel of nextPixel(src.pixels, layer.channel)) {
        {
            if (Math.random() < filmResponse(pixel, layer.filmResponsePower)) {
                const grain = smoothGrain(
                    generateGrain(layer.grainSize, layer.stepsBasis),
                    layer.grainSize,
                    layer.minNeighbors,
                    layer.maxNeighbors,
                );
                drawGrain(
                    dest,
                    grain,
                    (i % src.width) * resultGridSize,
                    Math.floor(i / src.width) * resultGridSize,
                    layer,
                );
            }
        }
        i++;
    }
}

export function getGrainImage(
    srcImage: SimpleImageData,
    renderParameters: GrainRenderParameters,
): SimpleImageData {
    const destImage = {
        width: srcImage.width * renderParameters.resultGridSize,
        height: srcImage.height * renderParameters.resultGridSize,
        pixels: new Float32Array(
            srcImage.pixels.length * renderParameters.resultGridSize ** 2,
        ),
    };

    renderParameters.layers.forEach((layer) => {
        drawLayer(layer, srcImage, destImage, renderParameters.resultGridSize);
    });

    return destImage;
}
