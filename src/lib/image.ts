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
