// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { isError } from '@/lib/common';
import { convertFloatToUint8, convertUint8ToFloat } from '@/lib/convert';
import { getGrainImage } from '@/lib/grain';
import formidable from 'formidable';
import { NextApiRequest, NextApiResponse } from 'next';
import sharp from 'sharp';
// @ts-ignore
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
        return;
    }

    const form = formidable({
        uploadDir: 'uploads',
        filter: ({ mimetype }) => !!mimetype && mimetype.includes('image'),
        keepExtensions: true,
    });

    try {
        const [fields, files] = await form.parse(req);
        if (
            !files ||
            !files.img ||
            !files.img[0] ||
            !fields ||
            !fields.parameters ||
            !fields.parameters[0]
        ) {
            res.status(400).json({ error: 'No file or options' });
            return;
        }

        const [file] = files.img;
        const options = JSON.parse(fields.parameters[0]);

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
        } = getGrainImage({ width, height, pixels }, options);

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
        const message = isError(err)
            ? err.message
            : typeof err === 'string'
              ? err
              : JSON.stringify(err);
        res.status(500).json({
            error: 'Error during file upload: ' + message,
        });
    }
}
