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
