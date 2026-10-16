import { Color } from '@/lib/common';

const colorsForLayers: Color[] = [
    {
        r: 0.2797385620915033,
        g: 0.08627450980392158,
        b: 0.4392156862745098,
    },
    {
        r: 0.01568627450980392,
        g: 0.24836601307189543,
        b: 0.18300653594771243,
    },
    {
        r: 0.4705882352941177,
        g: 0.2169934640522876,
        b: 0.023529411764705882,
    },
    {
        r: 0.49673202614379086,
        g: 0.047058823529411764,
        b: 0.1568627450980392,
    },
];

export function getColorForLayer(layerIndex: number): Color {
    return colorsForLayers[layerIndex % colorsForLayers.length];
}

export const averageGraphColor: Color = { r: 0.8, g: 0.8, b: 0.8 };
