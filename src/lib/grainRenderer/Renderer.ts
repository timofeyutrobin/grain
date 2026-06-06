import { SimpleImageData } from '@/lib/common';

export abstract class Renderer<Params> {
    protected destImage: SimpleImageData;

    constructor(
        protected srcImage: SimpleImageData,
        protected scale: number,
        protected params: Params,
    ) {
        this.destImage = {
            width: this.srcImage.width * scale,
            height: this.srcImage.height * scale,
            pixels: new Float32Array(this.srcImage.pixels.length * scale ** 2),
        };
    }

    abstract render(): SimpleImageData;
}
