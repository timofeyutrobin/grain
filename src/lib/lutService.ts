import { DatabaseWrapper } from '@/lib/storage/db';

export const lutNameToUrl: Record<string, string> = JSON.parse(
    process.env.LUT_URLS ?? '{}',
);
export const DEFAULT_LUT_NAME = 'kodak_portra_400_+';

async function loadLutFromServer(url: string): Promise<Blob> {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error("Can't load LUT from server");
    }
    return res.blob();
}

export async function getLut(
    database: DatabaseWrapper | null,
    url: string,
): Promise<ImageBitmap> {
    let lutImageBlob = await database?.load('lut', url);
    if (!lutImageBlob) {
        lutImageBlob = await loadLutFromServer(url);
        database?.persist('lut', url, lutImageBlob);
    }
    return createImageBitmap(lutImageBlob);
}
