import {
    CharacteristicCurveParams,
    CharacteristicCurveType,
} from '@/lib/grainRenderer/characteristicCurves';
import { ParamsBuilder } from '@/lib/grainRenderer/layers/ParamsBuilder';

export class CharacteristicCurveParamsBuilder extends ParamsBuilder<CharacteristicCurveParams> {
    private curveType: CharacteristicCurveType = 'linear';
    private curveContrast: number[] = [];
    private curveSensitivity: number[] = [];

    build(): CharacteristicCurveParams[] {
        return new Array(this.layersCount).fill(0).map((_, index) => ({
            type: this.curveType,
            contrast: this.curveContrast[index],
            sensitivity: this.curveSensitivity[index],
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

    contrast(...contrasts: number[]): this {
        this.validateLayersCount(contrasts);

        this.curveContrast = contrasts;

        return this;
    }

    sensitivity(...sensitivities: number[]): this {
        this.validateLayersCount(sensitivities);
        this.curveSensitivity = sensitivities;

        return this;
    }

    type(curveType: CharacteristicCurveType): this {
        this.curveType = curveType;

        return this;
    }
}
