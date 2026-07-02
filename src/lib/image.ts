import { Channel } from './common';

export function* nextPixel(rgbPixels: Float32Array, channel: Channel) {
    for (let i = 0; i < rgbPixels.length; i += 3) {
        const r = rgbPixels[i];
        const g = rgbPixels[i + 1];
        const b = rgbPixels[i + 2];

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

export function getPixel(
    index: number,
    rgbPixels: Float32Array,
    channel: Channel,
) {
    index = index * 3;
    const r = rgbPixels[index];
    const g = rgbPixels[index + 1];
    const b = rgbPixels[index + 2];

    if (channel === 'grayscale') {
        return 0.299 * r + 0.587 * g + 0.114 * b;
    } else if (channel === 'r') {
        return r;
    } else if (channel === 'g') {
        return g;
    } else if (channel === 'b') {
        return b;
    }

    return 0;
}

export function addPixelHsl(
    rgbPixels: Float32Array,
    width: number,
    x: number,
    y: number,
    hue: number,
    saturation: number,
    value: number,
    alpha: number = 1,
) {
    const rIndex = Math.min((x + y * width) * 3, rgbPixels.length);
    const gIndex = rIndex + 1;
    const bIndex = gIndex + 1;

    const r = rgbPixels[rIndex];
    const g = rgbPixels[gIndex];
    const b = rgbPixels[bIndex];
    hsvToRgb(hue, saturation, value, rgbPixels, rIndex);

    rgbPixels[rIndex] = blend(r, rgbPixels[rIndex], alpha);
    rgbPixels[gIndex] = blend(g, rgbPixels[gIndex], alpha);
    rgbPixels[bIndex] = blend(b, rgbPixels[bIndex], alpha);
}

export function generateSampleImageBuffer(
    width: number,
    height: number,
): Float32Array {
    if (width <= 0 || height <= 0) {
        throw new TypeError('Width and height must be positive');
    }

    width = Math.floor(width);
    height = Math.floor(height);

    const buffer = new Float32Array(width * height * 3);
    const step = 360 / width;

    let hue = 0;
    for (let i = 0; i < buffer.length; i += 3) {
        hsvToRgb(hue, 50, 50, buffer, i);
        hue = (hue + step) % 360;
    }

    return buffer;
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
