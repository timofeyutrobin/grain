import { GrainSize, randomFromTo, SimpleImageData } from '@/lib/common';
import {
    CharacteristicCurve,
    CharacteristicCurveType,
    getCharacteristicCurve,
} from '@/lib/grainRenderer/characteristicCurves';
import {
    getGrainGenerator,
    GrainGeneratorType,
} from '@/lib/grainRenderer/grainGenerators';
import { Renderer } from '@/lib/grainRenderer/Renderer';
import { traverse } from '@/lib/grainUtilities';
import { addPixelHsl, getPixel } from '@/lib/image';

export interface RandomSpawnGrainRenderParameters {
    relativeGrainCount: number;
    grainSize: GrainSize;
    curveType: CharacteristicCurveType;
    grainType: GrainGeneratorType;
}

export class RandomSpawnRenderer extends Renderer<RandomSpawnGrainRenderParameters> {
    constructor(
        srcImage: SimpleImageData,
        params: RandomSpawnGrainRenderParameters,
    ) {
        super(srcImage, 1, params);
    }

    private activateGrain(
        grain: boolean[],
        size: number,
        posX: number,
        posY: number,
        curve: CharacteristicCurve,
        alpha: number,
    ) {
        let exposure = 0;
        let steps = 0;
        traverse(grain, size, (x, y) => {
            steps++;
            exposure += getPixel(
                (posY + y) * this.srcImage.width + (posX + x),
                this.srcImage.pixels,
                'grayscale',
            );
        });
        exposure /= steps;

        if (Math.random() < curve(exposure)) {
            traverse(grain, size, (x, y) => {
                addPixelHsl(
                    this.destImage.pixels,
                    this.destImage.width,
                    posX + x,
                    posY + y,
                    0,
                    0,
                    Math.floor(randomFromTo(80, 100)),
                    alpha,
                );
            });
        }
    }

    private spawnGrain() {
        const grainCount = Math.floor(
            this.srcImage.width *
                this.srcImage.height *
                this.params.relativeGrainCount,
        );
        for (let i = 0; i < grainCount; i++) {
            const x = Math.floor(randomFromTo(0, this.destImage.width + 1));
            const y = Math.floor(randomFromTo(0, this.destImage.height + 1));
            const grainGeneratorParams = {
                grainSize:
                    this.params.grainSize * Math.floor(randomFromTo(1, 4)),
                type: this.params.grainType,
            };
            const size = grainGeneratorParams.grainSize;
            const grain = getGrainGenerator(grainGeneratorParams)();
            const curve = getCharacteristicCurve({
                type: this.params.curveType,
                contrast: grainGeneratorParams.grainSize / 1.2,
                sensitivity: 1 / grainGeneratorParams.grainSize,
            });
            const alpha = 0.1;
            this.activateGrain(grain, size, x, y, curve, alpha);
        }
    }

    render(): SimpleImageData {
        this.spawnGrain();
        return this.destImage;
    }
}
