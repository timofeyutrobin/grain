import {
    GrainGeneratorParams,
    GrainGeneratorType,
} from '@/lib/grainRenderer/grainGenerators';
import { ParamsBuilder } from '@/lib/grainRenderer/layers/ParamsBuilder';

export class GrainGeneratorParamsBuilder extends ParamsBuilder<GrainGeneratorParams> {
    private grainType: GrainGeneratorType = 'cubic';
    private grainSize: number[] = [];

    build(): GrainGeneratorParams[] {
        return new Array(this.layersCount).fill(0).map((_, index) => ({
            type: this.grainType,
            grainSize: this.grainSize[index],
            smoothing:
                this.grainSize[index] >= 3
                    ? {
                          minNeighbors: 2,
                          maxNeighbors: 4,
                      }
                    : undefined,
        }));
    }

    layers(count: number): this {
        if (count <= 0) {
            throw new RangeError('"count" must be positive');
        }
        if (this.layersCount > 0) {
            throw new RangeError('Cannot set layers count more than one time');
        }

        this.layersCount = Math.floor(count);

        return this;
    }

    type(grainType: GrainGeneratorType) {
        this.grainType = grainType;

        return this;
    }

    size(...grainSize: number[]) {
        this.validateLayersCount(grainSize);
        this.grainSize = grainSize;

        return this;
    }
}
