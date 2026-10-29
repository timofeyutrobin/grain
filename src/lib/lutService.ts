import { DatabaseWrapper } from '@/lib/storage/db';

export const lutNameToUrl: Record<string, string> = JSON.parse(
    process.env.LUT_URLS ?? '{}',
);
export const DEFAULT_LUT_NAME = 'kodak_portra_400_+';

export async function getLut(
    database: DatabaseWrapper | null,
    url: string,
): Promise<ImageBitmap> {
    let lutImage = await database?.load('lut', url);
    if (!lutImage) {
        lutImage = await loadLutFromServer(url);
        database?.persist('lut', url, lutImage);
    }
    return lutImage;
}

async function loadLutFromServer(url: string): Promise<ImageBitmap> {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error("Can't load LUT from server");
    }
    const blob = await res.blob();
    return createImageBitmap(blob);
}
