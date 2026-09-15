import '@/styles/globals.css';
import { AppProps } from 'next/app';
import Head from 'next/head';

export default function App({ Component, pageProps }: AppProps) {
    return (
        <>
            <Head>
                <link rel="manifest" href="/manifest.json" />
                <link rel="icon" type="image/x-icon" href="/favicon.ico" />
                <link
                    rel="apple-touch-icon"
                    sizes="180x180"
                    href="/icons/apple-touch-icon.png"
                />
                <title>Emulsion Engine</title>
            </Head>
            <Component {...pageProps} />
        </>
    );
}
