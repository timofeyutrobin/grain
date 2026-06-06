import { Channel, Color, randomFromTo } from '@/lib/common';
import {
    CharacteristicCurveParams,
    getCharacteristicCurve,
} from '@/lib/grainRenderer/characteristicCurves';
import {
    getGrainGenerator,
    GrainGeneratorParams,
} from '@/lib/grainRenderer/grainGenerators';
import { Renderer } from '@/lib/grainRenderer/Renderer';
import { traverse } from '@/lib/grainUtilities';
import { addPixelHsl, nextPixel } from '@/lib/image';

export interface Layer {
    grainGeneratorParams: GrainGeneratorParams;
    curveParams: CharacteristicCurveParams;
    grainSpread: number;
    grainColorAlpha: number;
    color?: Color;
    channel: Channel;
}

export interface LayersRenderParameters {
    layers: Layer[];
}

export class LayersRenderer extends Renderer<LayersRenderParameters> {
    private drawGrain(
        grain: boolean[],
        offsetX: number,
        offsetY: number,
        layer: Layer,
    ) {
        const {
            grainGeneratorParams: { grainSize },
            grainColorAlpha,
            grainSpread,
            color,
        } = layer;
        const { width, pixels } = this.destImage;
        const randomOffsetX = Math.round(randomFromTo(0, grainSpread));
        const randomOffsetY = Math.round(randomFromTo(0, grainSpread));
        traverse(grain, grainSize, (x, y) => {
            const brightness = color
                ? color.v
                : Math.floor(randomFromTo(80, 100));

            const finalX = offsetX + randomOffsetX + x;
            const finalY = offsetY + randomOffsetY + y;

            addPixelHsl(
                pixels,
                width,
                finalX,
                finalY,
                color?.h ?? 0,
                color?.s ?? 0,
                brightness,
                grainColorAlpha,
            );
        });
    }

    private drawLayer(layer: Layer) {
        const { grainGeneratorParams, curveParams } = layer;

        let i = 0;
        for (let pixel of nextPixel(this.srcImage.pixels, layer.channel)) {
            if (Math.random() < getCharacteristicCurve(curveParams)(pixel)) {
                const grain = getGrainGenerator(grainGeneratorParams)();
                this.drawGrain(
                    grain,
                    (i % this.destImage.width) * this.scale,
                    Math.floor(i / this.destImage.width) * this.scale,
                    layer,
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
