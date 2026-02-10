import { Channel } from './common';

export function* nextPixel(rgbaPixels: Float32Array, channel: Channel) {
    for (let i = 0; i < rgbaPixels.length; i += 3) {
        const r = rgbaPixels[i];
        const g = rgbaPixels[i + 1];
        const b = rgbaPixels[i + 2];

        if (channel === 'grayscale') {
            yield 0.299 * r + 0.587 * g + 0.114 * b;
        } else if (channel === 'r') {
            yield r;
        } else if (channel === 'g') {
            yield g;
        } else if (channel === 'b') {
            yield b;
        }
    }
}

export function addPixelHsl(
    rgbaPixels: Float32Array,
    width: number,
    x: number,
    y: number,
    hue: number,
    saturation: number,
    value: number,
    alpha: number = 1,
) {
    const rIndex = Math.min((x + y * width) * 3, rgbaPixels.length - 4);
    const gIndex = rIndex + 1;
    const bIndex = gIndex + 1;

    const r = rgbaPixels[rIndex];
    const g = rgbaPixels[gIndex];
    const b = rgbaPixels[bIndex];
    hsvToRgb(hue, saturation, value, rgbaPixels, rIndex);

    rgbaPixels[rIndex] = blend(r, rgbaPixels[rIndex], alpha);
    rgbaPixels[gIndex] = blend(g, rgbaPixels[gIndex], alpha);
    rgbaPixels[bIndex] = blend(b, rgbaPixels[bIndex], alpha);
}

function hsvToRgb(
    h: number,
    s: number,
    v: number,
    out: Float32Array,
    rIndex: number,
) {
    h = ((h % 360) + 360) % 360;
    s = Math.min(100, Math.max(0, s)) / 100;
    v = Math.min(100, Math.max(0, v)) / 100;

    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;

    let r1 = 0,
        g1 = 0,
        b1 = 0;

    if (h < 60) {
        r1 = c;
        g1 = x;
        b1 = 0;
    } else if (h < 120) {
        r1 = x;
        g1 = c;
        b1 = 0;
    } else if (h < 180) {
        r1 = 0;
        g1 = c;
        b1 = x;
    } else if (h < 240) {
        r1 = 0;
        g1 = x;
        b1 = c;
    } else if (h < 300) {
        r1 = x;
        g1 = 0;
        b1 = c;
    } else {
        r1 = c;
        g1 = 0;
        b1 = x;
    }

    out[rIndex] = r1 + m;
    out[rIndex + 1] = g1 + m;
    out[rIndex + 2] = b1 + m;
}

function blend(originalColor: number, newColor: number, alpha: number): number {
    return newColor * alpha + originalColor * (1 - alpha);
}
