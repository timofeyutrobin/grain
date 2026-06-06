import { cleanupDirToSize } from '@/lib/apiHelpers';
import { isError } from '@/lib/common';
import { convertFloatToUint8, convertUint8ToFloat } from '@/lib/convert';
import { RandomSpawnRenderer } from '@/lib/grainRenderer/randomSpawn/RandomSpawnRenderer';
import formidable from 'formidable';
import { existsSync, mkdirSync, readdirSync, rmSync } from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import sharp from 'sharp';
// @ts-ignore
import uniqueFilename from 'unique-filename';

const uploadsDir = process.env.UPLOADS_DIR!;
const resultsDir = process.env.RESULTS_DIR!;
const maxResultsSize = process.env.MAX_RESULTS_SIZE_BYTES!;

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

    if (!existsSync(uploadsDir)) {
        mkdirSync(uploadsDir, { recursive: true });
    }
    if (!existsSync(resultsDir)) {
        mkdirSync(resultsDir, { recursive: true });
    }

    const form = formidable({
        uploadDir: uploadsDir,
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
            res.status(400).json({ error: 'No file or parameters' });
            return;
        }

        const [file] = files.img;
        const parameters = JSON.parse(fields.parameters[0]);

        cleanupDirToSize(resultsDir, Number(maxResultsSize));

        const image = sharp(file.filepath);
        const {
            data,
            info: { width, height },
        } = await image
            .removeAlpha()
            .rotate()
            .raw()
            .toBuffer({ resolveWithObject: true });
        const pixels = convertUint8ToFloat(data);
        const {
            width: resultWidth,
            height: resultHeight,
            pixels: resultPixels,
        } = new RandomSpawnRenderer(
            { width, height, pixels },
            parameters,
        ).render();

        const resultFilename = `${uniqueFilename('')}.png`;

        const outputPath = path.join(resultsDir, resultFilename);

        await sharp(convertFloatToUint8(resultPixels), {
            raw: {
                channels: 3,
                width: resultWidth,
                height: resultHeight,
            },
        })
            .rotate()
            .normalise({ upper: 95 })
            .modulate({ saturation: 5 })
            .toFormat('png')
            .toFile(outputPath);

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
    } finally {
        readdirSync(uploadsDir).forEach((file) =>
            rmSync(`${uploadsDir}/${file}`),
        );
    }
}
