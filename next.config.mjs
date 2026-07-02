/** @type {import('next').NextConfig} */
const nextConfig = {
    /* config options here */
    reactCompiler: true,
    reactStrictMode: true,
    output: 'standalone',
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
