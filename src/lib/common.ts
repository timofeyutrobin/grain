export interface SimpleImageData {
    width: number;
    height: number;
    pixels: Float32Array;
}

export type Channel = 'r' | 'g' | 'b' | 'grayscale';

export type RenderMode = 'grayscale' | 'color';

export interface ColorHSV {
    h: number;
    s: number;
    v: number;
}

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

export const enum ImageType {
    RESULT = 'result',
    PREVIEW = 'preview',
}

export const previewWidth = 600;

export const defaultColors = {
    red: {
        h: 0,
        s: 25,
        v: 50,
    },
    green: {
        h: 120,
        s: 25,
        v: 50,
    },
    blue: {
        h: 240,
        s: 25,
        v: 50,
    },
};

export type PropsWithClassName<T = {}> = { className?: string } & T;

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

export function erf(x: number) {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y =
        1.0 -
        ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
}

export function logNormalDistribution(x: number, mu: number, sigma: number) {
    if (x <= 0) {
        return 0;
    }

    return 0.5 + 0.5 * erf((Math.log(x) - mu) / (Math.sqrt(2) * sigma));
}

export class SeededRandom {
    constructor(private seed: number) {}
    next() {
        this.seed = (this.seed * 1664525 + 1013904223) % 2147483648;
        return this.seed / 2147483648;
    }
}
