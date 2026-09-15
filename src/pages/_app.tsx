import '@/styles/globals.css';
import { AppProps } from 'next/app';
import Head from 'next/head';

export default function App({ Component, pageProps }: AppProps) {
    return (
        <>
            <Head>
                <link rel="manifest" href="/manifest.json" />
                <link rel="icon" href="/favicon.ico" />
                <link
                    rel="apple-touch-icon"
                    href="/icons/icon-medium-maskable.png"
                />
                <title>Emulsion Engine</title>
            </Head>
            <Component {...pageProps} />
        </>
    );
}
