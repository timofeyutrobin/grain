import {
    Color,
    defaultColors,
    GrainSize,
    GrainSpread,
    RenderMode,
} from '@/lib/common';
import {
    CharacteristicCurveParams,
    CharacteristicCurveParamsBuilder,
    CharacteristicCurveType,
} from '@/lib/grainRenderer/characteristicCurves';
import {
    GrainGeneratorParams,
    GrainGeneratorParamsBuilder,
    GrainGeneratorType,
} from '@/lib/grainRenderer/grainGenerators';
import {
    GrainRenderParameters,
    Layer,
} from '@/lib/grainRenderer/grainRenderParameters';
import { useState } from 'react';

export function useSettings() {
    const [mode, setMode] = useState<RenderMode>('grayscale');

    const [grainType, setGrainType] = useState<GrainGeneratorType>('cubic');
    const [grainSize, setGrainSize] = useState<GrainSize>(1);
    const [grainSpread, setGrainSpread] = useState<GrainSpread>(1);

    const [redDyeColor, setRedDyeColor] = useState<Color>(defaultColors.red);
    const [greenDyeColor, setGreenDyeColor] = useState<Color>(
        defaultColors.green,
    );
    const [blueDyeColor, setBlueDyeColor] = useState<Color>(defaultColors.blue);

    const [curveType, setCurveType] =
        useState<CharacteristicCurveType>('power');

    const characteristicCurveParamsBuilder =
        new CharacteristicCurveParamsBuilder().type(curveType);

    const grayscaleRenderParameters = createGrayscaleRenderParameters(
        new GrainGeneratorParamsBuilder()
            .type(grainType)
            .size(grainSize)
            .build(),
        characteristicCurveParamsBuilder.color('grayscale').build(),
        grainSpread,
    );

    const renderParameters =
        mode === 'grayscale'
            ? grayscaleRenderParameters
            : createColorGrainRenderParameters(
                  grayscaleRenderParameters,
                  {
                      color: redDyeColor,
                      curveParams: characteristicCurveParamsBuilder
                          .color('r')
                          .build(),
                  },
                  {
                      color: greenDyeColor,
                      curveParams: characteristicCurveParamsBuilder
                          .color('g')
                          .build(),
                  },
                  {
                      color: blueDyeColor,
                      curveParams: characteristicCurveParamsBuilder
                          .color('b')
                          .build(),
                  },
              );

    return {
        mode,
        setMode,
        grainType,
        setGrainType,
        curveType,
        setCurveType,
        grainSize,
        setGrainSize,
        grainSpread,
        setGrainSpread,
        redDyeColor,
        setRedDyeColor,
        greenDyeColor,
        setGreenDyeColor,
        blueDyeColor,
        setBlueDyeColor,

        renderParameters,
    };
}

function createGrayscaleRenderParameters(
    grainGeneratorParams: GrainGeneratorParams[],
    curveParams: CharacteristicCurveParams[],
    grainSpread: number = 1,
): GrainRenderParameters {
    if (grainSpread < 1) {
        throw new TypeError(
            'Wrong "grainSpread": use only numbers larger than 1',
        );
    }
    if (curveParams.length !== 3) {
        throw new TypeError('Layers count in curveParams must be 3');
    }
    if (grainGeneratorParams.length !== 3) {
        throw new TypeError('Layers count in grainGeneratorParams must be 3');
    }

    grainSpread = Math.floor(grainSpread);

    return {
        layers: [
            {
                grainGeneratorParams: grainGeneratorParams[0],
                curveParams: curveParams[0],
                grainSpread,
                grainColorAlpha: 0.3,
                channel: 'grayscale',
            },
            {
                grainGeneratorParams: grainGeneratorParams[1],
                curveParams: curveParams[1],
                grainSpread: 2 * grainSpread,
                grainColorAlpha: 0.3,
                channel: 'grayscale',
            },
            {
                grainGeneratorParams: grainGeneratorParams[2],
                curveParams: curveParams[2],
                grainSpread: 5 * grainSpread,
                grainColorAlpha: 0.5,
                channel: 'grayscale',
            },
        ],
        resultGridSize: 2,
    };
}

interface ColorParams {
    color: Color;
    curveParams: CharacteristicCurveParams[];
}
function createColorGrainRenderParameters(
    grayscaleParameters: GrainRenderParameters,
    redParams: ColorParams,
    greenParams: ColorParams,
    blueParams: ColorParams,
): GrainRenderParameters {
    const layers: Layer[] = [];

    grayscaleParameters.layers.forEach((layer, index) => {
        layers.push({
            ...layer,
            curveParams: redParams.curveParams[index],
            grainColorAlpha: layer.grainColorAlpha * 0.5,
            color: redParams.color,
            channel: 'r',
        });
    });

    grayscaleParameters.layers.forEach((layer, index) => {
        layers.push({
            ...layer,
            curveParams: greenParams.curveParams[index],
            grainColorAlpha: layer.grainColorAlpha * 0.3,
            color: greenParams.color,
            channel: 'g',
        });
    });

    grayscaleParameters.layers.forEach((layer, index) => {
        layers.push({
            ...layer,
            curveParams: blueParams.curveParams[index],
            grainColorAlpha: layer.grainColorAlpha * 0.2,
            color: blueParams.color,
            channel: 'b',
        });
    });

    return {
        ...grayscaleParameters,
        layers,
    };
}
