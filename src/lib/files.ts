import { SimpleImageData } from './common';

export function getPixelsRGB(
    file: File,
    readingPixelSize = 1,
): Promise<SimpleImageData> {
    return new Promise((resolve, reject) => {
        if (!file.type.startsWith('image/')) {
            reject(new Error('Файл не является изображением'));
            return;
        }

        const img = new Image();
        const reader = new FileReader();

        reader.onload = () => {
            img.src = reader.result as string;
        };

        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width / Math.ceil(readingPixelSize / 2);
            canvas.height = img.height / Math.ceil(readingPixelSize / 2);

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(
                0,
                0,
                canvas.width,
                canvas.height,
            );

            resolve({
                width: imageData.width,
                height: imageData.height,
                pixels: imageData.data,
            });
        };

        img.onerror = reject;
        reader.onerror = reject;

        reader.readAsDataURL(file);
    });
}

export async function getPixelsGrayscale(
    file: File,
    readingPixelSize = 1,
): Promise<SimpleImageData> {
    const {
        width,
        height,
        pixels: RGBAPixels,
    } = await getPixelsRGB(file, readingPixelSize);
    const pixels = new Uint8ClampedArray(width * height);
    for (let i = 0, j = 0; i < RGBAPixels.length; i += 4, j++) {
        const r = RGBAPixels[i];
        const g = RGBAPixels[i + 1];
        const b = RGBAPixels[i + 2];

        pixels[j] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    }
    return { width, height, pixels };
}
