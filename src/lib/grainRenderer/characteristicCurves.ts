export type CharacteristicCurveParams =
    | {
          type: 'linear';
      }
    | {
          type: 'sigmoid';
          contrast: number;
          sensitivity: number;
      };

export type CharacteristicCurveType = CharacteristicCurveParams['type'];
export type CharacteristicCurve = (pixel: number) => number;

export function getCharacteristicCurve(
    params: CharacteristicCurveParams,
): CharacteristicCurve {
    switch (params.type) {
        case 'linear':
            return (x) => x;
        case 'sigmoid':
            return (x) =>
                (Math.pow(x, params.contrast) /
                    (Math.pow(x, params.contrast) +
                        Math.pow(1 - x, params.contrast))) *
                Math.pow(x, params.sensitivity);
    }
}
