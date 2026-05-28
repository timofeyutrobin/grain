export type CharacteristicCurveParams =
    | {
          type: 'linear';
      }
    | {
          type: 'power';
          power: number;
      };

export type CharacteristicCurveType = CharacteristicCurveParams['type'];
export type CharacteristicCurve = (pixel: number) => number;

export function getCharacteristicCurve(
    params: CharacteristicCurveParams,
): CharacteristicCurve {
    switch (params.type) {
        case 'linear':
            return (x) => x;
        case 'power':
            return (x) => Math.pow(x, params.power);
    }
}

export class CharacteristicCurveParamsBuilder {
    private layersCount: number = 0;
    private curveType: CharacteristicCurveType = 'linear';
    private curvePowers: number[] = [];

    private validateLayersCount(value: unknown[]) {
        if (this.layersCount === 0) {
            throw new RangeError('Set layers() first');
        }
        if (value.length !== this.layersCount) {
            throw new RangeError(
                'Layers count in value must be equal to general layers count',
            );
        }
    }

    build(): CharacteristicCurveParams[] {
        return new Array(this.layersCount).fill(0).map((_, index) => ({
            type: this.curveType,
            power: this.curvePowers[index],
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

    powers(...powers: number[]): this {
        this.validateLayersCount(powers);

        this.curvePowers = powers;

        return this;
    }

    powerScale(scale: number): this {
        this.curvePowers = this.curvePowers.map((power) => power * scale);

        return this;
    }

    type(curveType: CharacteristicCurveType): this {
        this.curveType = curveType;

        return this;
    }
}
