import { Channel } from '@/lib/common';

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
            return (pixel) => pixel;
        case 'power':
            return (pixel) => Math.pow(pixel, params.power);
    }
}

export class CharacteristicCurveParamsBuilder {
    private curvePowers = [1.1, 1.8, 5];

    private powerScales: Record<Channel, number> = {
        r: 0.9,
        g: 1,
        b: 1.1,
        grayscale: 1,
    };

    private params: CharacteristicCurveParams[] = [
        { type: 'linear' },
        { type: 'linear' },
        { type: 'linear' },
    ];

    private validateLayersCount(value: unknown[]) {
        if (value.length !== this.params.length) {
            throw new RangeError(
                'Layers count in value must be equal to general layers count',
            );
        }
    }

    build() {
        return this.params;
    }

    layers(count: number) {
        this.params =
            count <= this.params.length
                ? this.params.slice(0, count)
                : [
                      ...this.params,
                      ...new Array(count - this.params.length).fill({
                          type: 'linear',
                      }),
                  ];

        return this;
    }

    powers(powers: number[]) {
        this.validateLayersCount(powers);

        this.curvePowers = powers;
    }

    type(curveType: CharacteristicCurveType) {
        if (curveType === 'power') {
            this.params = this.params.map((paramsForLayer, index) => ({
                ...paramsForLayer,
                type: 'power',
                power: this.curvePowers[index],
            }));
        }
        if (curveType === 'linear') {
            this.params = this.params.map((paramsForLayer) => ({
                ...paramsForLayer,
                type: 'linear',
            }));
        }

        return this;
    }

    color(channel: Channel) {
        this.params = this.params.map((paramsForLayer) => {
            if (paramsForLayer.type !== 'power') {
                return paramsForLayer;
            }

            return {
                ...paramsForLayer,
                power: paramsForLayer.power * this.powerScales[channel],
            };
        });

        return this;
    }
}
