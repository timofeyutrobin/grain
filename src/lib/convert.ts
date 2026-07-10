export function convertFloatToUint8RgbToRgba(source: Float32Array) {
    const result: number[] = [];

    for (let i = 0; i < source.length; i += 3) {
        result.push(Math.max(0, Math.min(255, source[i] * 255)));
        result.push(Math.max(0, Math.min(255, source[i + 1] * 255)));
        result.push(Math.max(0, Math.min(255, source[i + 2] * 255)));
        result.push(255);
    }

    return new Uint8ClampedArray(result);
}
