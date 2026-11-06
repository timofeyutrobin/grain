import { readdirSync } from 'node:fs';
import { parse } from 'node:path';

const lutDirectory = new URL('./public/lut/', import.meta.url);
const lutUrls = Object.fromEntries(
    readdirSync(lutDirectory, { withFileTypes: true })
        .filter((entry) => entry.isFile())
        .map((entry) => [parse(entry.name).name, `/lut/${entry.name}`]),
);

/** @type {import('next').NextConfig} */
const nextConfig = {
    /* config options here */
    reactCompiler: true,
    reactStrictMode: true,
    env: {
        LUT_URLS: JSON.stringify(lutUrls),
    },
    turbopack: {
        rules: {
            '*.{vert,frag}': {
                loaders: ['raw-loader'],
                as: '*.js',
            },
        },
    },
};

export default nextConfig;
