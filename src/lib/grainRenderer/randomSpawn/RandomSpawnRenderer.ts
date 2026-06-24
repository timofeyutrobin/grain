import {
    Channel,
    ColorHSV,
    GrainSize,
    logNormalDistribution,
    SeededRandom,
    SimpleImageData,
} from '@/lib/common';
import {
    CharacteristicCurveType,
    getCharacteristicCurve,
} from '@/lib/grainRenderer/characteristicCurves';
import {
    getGrainGenerator,
    GrainGeneratorType,
} from '@/lib/grainRenderer/grainGenerators';
import { Renderer } from '@/lib/grainRenderer/Renderer';
import { addPixelHsl, getPixel } from '@/lib/image';

export interface RandomSpawnGrainRenderParameters {
    isColor: boolean;
    relativeGrainCount: number;
    grainSize: GrainSize;
    curveType: CharacteristicCurveType;
    grainType: GrainGeneratorType;
    color: Record<Channel, ColorHSV>;
}

export class RandomSpawnRenderer extends Renderer<RandomSpawnGrainRenderParameters> {
    private sizes: number = 3;
    private alpha: number =
        1 / (this.params.relativeGrainCount * this.params.grainSize ** 2);

    constructor(
        srcImage: SimpleImageData,
        params: RandomSpawnGrainRenderParameters,
    ) {
        super(srcImage, 1, params);
    }

    private drawPixel = (x: number, y: number, channel: Channel) => {
        addPixelHsl(
            this.destImage.pixels,
            this.destImage.width,
            x,
            y,
            this.params.color[channel].h,
            this.params.color[channel].s,
            this.params.color[channel].v,
            this.alpha,
        );
    };

    private calculateGrainCounts(count: number) {
        const weights = [];
        let totalWeight = 0;

        for (let i = 1; i <= this.sizes; i++) {
            const lowerEdge = i === 1 ? 0 : (2 * i - 1) / 2;
            const upperEdge = i === this.sizes - 1 ? Infinity : (2 * i + 1) / 2;

            const p =
                logNormalDistribution(upperEdge, 0.1, 0.4) -
                logNormalDistribution(lowerEdge, 0.1, 0.4);
            weights[i - 1] = p;
            totalWeight += p;
        }

        const counts: number[] = [];
        let allocatedGrains = 0;

        for (let i = 0; i < this.sizes; i++) {
            const exactCount = count * (weights[i] / totalWeight);
            counts[i] = Math.round(exactCount);
            allocatedGrains += counts[i];
        }

        let diff = count - allocatedGrains;
        if (diff !== 0) {
            counts[Math.floor(this.sizes / 2)] += diff;
        }

        return counts;
    }

    private spawnGrain(channel: Channel) {
        const grainCount = Math.floor(
            this.srcImage.width *
                this.srcImage.height *
                this.params.relativeGrainCount,
        );
        const grainCountDistribution = this.calculateGrainCounts(grainCount);

        const grainGenerator = getGrainGenerator(this.params.grainType);
        const curve = getCharacteristicCurve(this.params.curveType);
        const rng = new SeededRandom(performance.now());

        grainCountDistribution.forEach((count, grainSize) => {
            for (let i = 0; i < count; i++) {
                const posX = Math.floor(
                    rng.next() * (this.destImage.width + 1),
                );
                const posY = Math.floor(
                    rng.next() * (this.destImage.height + 1),
                );

                // TODO: сделать правильный замер экспозиции под зернышком
                const exposure = getPixel(
                    posY * this.srcImage.width + posX,
                    this.srcImage.pixels,
                    channel,
                );

                if (Math.random() < curve(exposure, 1, 0.2)) {
                    grainGenerator(
                        (grainSize + 1) * this.params.grainSize,
                        posX,
                        posY,
                        channel,
                        this.drawPixel,
                    );
                }
            }
        });
    }

    render(): SimpleImageData {
        if (this.params.isColor) {
            this.spawnGrain('r');
            this.spawnGrain('g');
            this.spawnGrain('b');
        } else {
            this.spawnGrain('grayscale');
        }

        return this.destImage;
    }
}
