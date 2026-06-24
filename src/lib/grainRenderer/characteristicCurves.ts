export type CharacteristicCurveParams =
    | {
          type: 'linear';
      }
    | {
          type: 'sigmoid';
          contrast: number;
          sensitivity: number;
      };

export type CharacteristicCurveType = 'linear' | 'sigmoid';

export type CharacteristicCurve = {
    linear: (x: number) => number;
    sigmoid: (x: number, contrast: number, sensitivity: number) => number;
};

export function getCharacteristicCurve<T extends CharacteristicCurveType>(
    type: T,
): CharacteristicCurve[T] {
    switch (type) {
        case 'linear':
            return ((x: number) => x) as CharacteristicCurve[T];
        case 'sigmoid':
            return ((x: number, contrast: number, sensitivity: number) =>
                (Math.pow(x, contrast) /
                    (Math.pow(x, contrast) + Math.pow(1 - x, contrast))) *
                Math.pow(x, sensitivity)) as CharacteristicCurve[T];
    }
}
