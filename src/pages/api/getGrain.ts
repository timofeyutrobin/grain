// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { convertFloatToUint8, convertUint8ToFloat } from '@/lib/convert';
import { getGrainImage } from '@/lib/grain';
import { testColorPreset } from '@/lib/presets';
import formidable from 'formidable';
import { NextApiRequest, NextApiResponse } from 'next';
import sharp from 'sharp';
import uniqueFilename from 'unique-filename';

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
    }

    const form = formidable({
        uploadDir: 'uploads',
        filter: ({ mimetype }) => mimetype && mimetype.includes('image'),
        keepExtensions: true,
    });

    try {
        const [, files] = await form.parse(req);
        if (!files || !files.img) {
            throw new Error('No file');
        }

        const [file] = files.img;

        const image = sharp(file.filepath);
        const {
            data,
            info: { width, height },
        } = await image
            .removeAlpha()
            .raw()
            .toBuffer({ resolveWithObject: true });
        const pixels = convertUint8ToFloat(data);
        const {
            width: resultWidth,
            height: resultHeight,
            pixels: resultPixels,
        } = getGrainImage(
            { width, height, pixels },
            testColorPreset.getOptions(),
        );

        const resultFilename = `${uniqueFilename('')}.webp`;

        await sharp(convertFloatToUint8(resultPixels), {
            raw: {
                channels: 3,
                width: resultWidth,
                height: resultHeight,
            },
        })
            .resize({ kernel: 'linear', width: Math.floor(resultWidth / 2) })
            .toFormat('webp', { lossless: true })
            .toFile(`public/images/${resultFilename}`);

        res.status(200).json({ filename: resultFilename });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: 'Error during file upload: ' + err.message,
        });
    }
}
