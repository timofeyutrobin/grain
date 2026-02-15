import { ImageType } from '@/lib/common';
import { existsSync, readdirSync } from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import sharp from 'sharp';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    const { filename, type } = req.query;

    if (!filename || typeof filename !== 'string') {
        res.status(400).json({ error: 'No filename provided' });
        return;
    }

    if (!type || typeof type !== 'string') {
        res.status(400).json({
            error: 'No type of image provided (full/preview)',
        });
        return;
    }

    const existedFiles = readdirSync(process.env.RESULTS_DIR!);
    const existedFilename = existedFiles.find((name) => name === filename);

    const filePath = existedFilename
        ? path.join(process.env.RESULTS_DIR!, existedFilename)
        : null;

    if (!filePath || !existsSync(filePath)) {
        res.status(404).json({ error: 'Image not found' });
        return;
    }

    try {
        const image = sharp(filePath);
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'public, max-age=3600');

        if (type === ImageType.RESULT) {
            res.status(200).send(await image.toBuffer());
        } else if (type === ImageType.PREVIEW) {
            res.status(200).send(
                await image
                    .rotate()
                    .resize(600, 600, {
                        fit: 'contain',
                        background: 'transparent',
                    })
                    .toBuffer(),
            );
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to read image' });
    }
}
