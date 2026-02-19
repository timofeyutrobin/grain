export interface SimpleImageData {
    width: number;
    height: number;
    pixels: Float32Array;
}

export type Channel = 'r' | 'g' | 'b' | 'grayscale';

export function isError(value: unknown): value is Error {
    return (
        value instanceof Error ||
        (typeof value === 'object' &&
            value !== null &&
            'message' in value &&
            typeof (value as any).message === 'string')
    );
}

export const enum GrainSize {
    s = 1,
    m = 2,
    l = 3,
}

export const enum GrainSpread {
    s = 1,
    m = 2,
    l = 3,
    xl = 4,
}

export const enum ImageType {
    RESULT = 'result',
    PREVIEW = 'preview',
}

export const previewWidth = 600;
