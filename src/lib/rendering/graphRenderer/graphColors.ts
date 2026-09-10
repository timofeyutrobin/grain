import { Color } from '@/lib/common';

const colorsForLayers: Color[] = [
    { r: 0.4196078431372549, g: 0.12941176470588237, b: 0.6588235294117647 },
    { r: 0.023529411764705882, g: 0.37254901960784315, b: 0.27450980392156865 },
    { r: 0.7058823529411765, g: 0.3254901960784314, b: 0.03529411764705882 },
    { r: 0.7450980392156863, g: 0.07058823529411765, b: 0.23529411764705882 },
];

export function getColorForLayer(layerIndex: number): Color {
    return colorsForLayers[layerIndex % colorsForLayers.length];
}
