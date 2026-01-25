export function getPixelsGrayscale(file, readingPixelSize) {
    return new Promise((resolve, reject) => {
        if (!file.type.startsWith('image/')) {
            reject(new Error('Файл не является изображением'));
            return;
        }

        const img = new Image();
        const reader = new FileReader();

        reader.onload = () => {
            img.src = reader.result;
        };

        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width / Math.ceil(readingPixelSize / 2);
            canvas.height = img.height / Math.ceil(readingPixelSize / 2);

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            const { data, width, height } = ctx.getImageData(
                0,
                0,
                canvas.width,
                canvas.height,
            );

            const pixels = new Uint8Array(width * height);

            for (let i = 0, j = 0; i < data.length; i += 4, j++) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                pixels[j] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
            }

            resolve({
                width,
                height,
                pixels,
            });
        };

        img.onerror = reject;
        reader.onerror = reject;

        reader.readAsDataURL(file);
    });
}
