import { Channel, ColorHSV, randomFromTo } from '@/lib/common';
import {
    CharacteristicCurveParams,
    getCharacteristicCurve,
} from '@/lib/grainRenderer/characteristicCurves';
import {
    getGrainGenerator,
    GrainGeneratorParams,
} from '@/lib/grainRenderer/grainGenerators';
import { Renderer } from '@/lib/grainRenderer/Renderer';
import { addPixelHsl, nextPixel } from '@/lib/image';

export interface Layer {
    grainGeneratorParams: GrainGeneratorParams;
    curveParams: CharacteristicCurveParams;
    grainSpread: number;
    grainColorAlpha: number;
    color?: ColorHSV;
    channel: Channel;
}

export interface LayersRenderParameters {
    layers: Layer[];
}

export class LayersRenderer extends Renderer<LayersRenderParameters> {
    private drawGrain(x: number, y: number, layer: Layer) {
        addPixelHsl(
            this.destImage.pixels,
            this.destImage.width,
            x,
            y,
            layer.color?.h || 0,
            layer.color?.s || 0,
            layer.color?.v || 80,
            layer.grainColorAlpha,
        );
    }

    private drawLayer(layer: Layer) {
        const { grainGeneratorParams, curveParams, channel, grainSpread } =
            layer;
        const curve = getCharacteristicCurve(curveParams.type);
        const contrast =
            curveParams.type === 'sigmoid' ? curveParams.contrast : 0;
        const sensitivity =
            curveParams.type === 'sigmoid' ? curveParams.sensitivity : 0;

        const grainGenerator = getGrainGenerator(grainGeneratorParams.type);

        let i = 0;
        for (let pixel of nextPixel(this.srcImage.pixels, layer.channel)) {
            const x = (i % this.destImage.width) * this.scale;
            const y = Math.floor(i / this.destImage.width) * this.scale;
            const randomOffsetX = Math.round(randomFromTo(0, grainSpread));
            const randomOffsetY = Math.round(randomFromTo(0, grainSpread));

            if (Math.random() < curve(pixel, contrast, sensitivity)) {
                grainGenerator(
                    grainGeneratorParams.grainSize,
                    x + randomOffsetX,
                    y + randomOffsetY,
                    channel,
                    (x, y) => this.drawGrain(x, y, layer),
                );
            }
            i++;
        }
    }

    render() {
        this.params.layers.forEach((layer) => {
            this.drawLayer(layer);
        });

        return this.destImage;
    }
}
