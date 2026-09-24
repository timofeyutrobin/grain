export type Channel = 'r' | 'g' | 'b' | 'grayscale';

export type RenderMode = 'grayscale' | 'color';

export type Color = { r: number; g: number; b: number };

export const enum GrainSize {
    min = 1,
    max = 3,
    step = 1,
    default = min,
}

export const enum GrainCount {
    min = 1,
    max = 3,
    step = 1,
    default = max,
}

export const enum Sharpness {
    min = 1,
    max = 16,
    step = 5,
    default = 11,
}

export const enum Contrast {
    min = 0.3,
    max = 0.9,
    step = 0.2,
    default = 0.5,
}

export const enum Sensitivity {
    min = 0.5,
    max = 1.5,
    step = 0.5,
    default = 1,
}

export type Setter<T> = (value: T) => void;

export type PropsWithClassName<T = {}> = { className?: string } & T;

export const FILE_UPLOAD_INPUT_ID = 'upload';

export const DEFAULT_COLORS: Record<string, Color> = {
    red: { r: 255, g: 50, b: 50 },
    green: { r: 50, g: 255, b: 50 },
    blue: { r: 50, g: 50, b: 255 },
};

export const PREVIEW_SIZE = 240;

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
