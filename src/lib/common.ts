export interface SimpleImageData {
    width: number;
    height: number;
    pixels: Float32Array;
}

export type Channel = 'r' | 'g' | 'b' | 'grayscale';
