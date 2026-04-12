import { Channel, Color } from '@/lib/common';
import { CharacteristicCurveParams } from '@/lib/grainRenderer/characteristicCurves';
import { GrainGeneratorParams } from '@/lib/grainRenderer/grainGenerators';

export interface Layer {
    grainGeneratorParams: GrainGeneratorParams;
    curveParams: CharacteristicCurveParams;
    grainSpread: number;
    grainColorAlpha: number;
    color?: Color;
    channel: Channel;
}

export interface GrainRenderParameters {
    layers: Layer[];
    /**
     * Side length
     */
    resultGridSize: number;
}
