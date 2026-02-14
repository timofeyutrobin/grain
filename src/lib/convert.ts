export function convertUint8ToFloat(source: Uint8Array) {
    const floatBuffer = new Float32Array(source.length);

    for (let i = 0; i < source.length; i++) {
        floatBuffer[i] = source[i] / 255;
    }

    return floatBuffer;
}

export function convertFloatToUint8(source: Float32Array) {
    const uInt8Buffer = new Uint8ClampedArray(source.length);
    for (let i = 0; i < source.length; i++) {
        uInt8Buffer[i] = Math.max(0, Math.min(255, source[i] * 255));
    }

    return uInt8Buffer;
}

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
