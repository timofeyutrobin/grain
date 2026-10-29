export type RenderMode = 'grayscale' | 'color';

export type Channel = 'r' | 'g' | 'b' | 'grayscale';

export type Color = { r: number; g: number; b: number };

export type NonNullableObject<T extends object> = {
    [K in keyof T]: NonNullable<T[K]>;
};

export type Setter<T> = (value: T) => void;

export type PropsWithClassName<T = {}> = { className?: string } & T;

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
