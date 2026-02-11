import { existsSync, readFileSync, readdirSync } from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const { filename } = req.query;

    if (!filename || typeof filename !== 'string') {
        res.status(400).json({ error: 'No filename provided' });
        return;
    }

    const existedFiles = readdirSync(process.env.RESULTS_DIR!);
    const existedFilename = existedFiles.find((name) => name === filename);

    const filePath = existedFilename
        ? path.join(process.env.RESULTS!, existedFilename)
        : null;

    if (!filePath || !existsSync(filePath)) {
        res.status(404).json({ error: 'File not found' });
        return;
    }

    try {
        const fileData = readFileSync(filePath);
        res.setHeader('Content-Type', 'image/webp');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.status(200).send(fileData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to read file' });
    }
}
