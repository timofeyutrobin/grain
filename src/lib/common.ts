export type Channel = 'r' | 'g' | 'b' | 'grayscale';

export type RenderMode = 'grayscale' | 'color';

export type Color = { r: number; g: number; b: number };

export const enum GrainSize {
    s = 1,
    m = 2,
    l = 3,
}

export const enum GrainCount {
    s = 1,
    m = 2,
    l = 3,
}

export const enum Sharpness {
    blurry = 1,
    normal = 2,
    sharp = 3,
}

export type PropsWithClassName<T = {}> = { className?: string } & T;

export const FILE_UPLOAD_INPUT_ID = 'upload';

export const defaultColors: Record<string, Color> = {
    red: { r: 255, g: 50, b: 50 },
    green: { r: 50, g: 255, b: 50 },
    blue: { r: 50, g: 50, b: 255 },
};

export function isError(value: unknown): value is Error {
    return (
        value instanceof Error ||
        (typeof value === 'object' &&
            value !== null &&
            'message' in value &&
            typeof (value as any).message === 'string')
    );
}

export function randomFromTo(from: number, to: number): number {
    return Math.random() * (to - from) + from;
}

export function clamp(number: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, number));
}

export function radians(degrees: number): number {
    return (Math.PI / 180) * degrees;
}

export function animate<P>(
    frame: (value: P) => void,
    states: P[],
    currentState: number,
) {
    frame(states[currentState]);
}
