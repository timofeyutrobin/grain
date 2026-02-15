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
    SMALL = 1,
    MEDIUM = 2,
    LARGE = 3,
}

export const enum ImageType {
    RESULT = 'result',
    PREVIEW = 'preview',
}
