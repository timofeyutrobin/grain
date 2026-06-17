import { Background } from '@/components/Background';
import { ButtonLink } from '@/components/button/ButtonLink';
import { ControlPanel } from '@/components/ControlPanel';
import { DebugOverlay } from '@/components/DebugOverlay';
import { Greeting } from '@/components/Greeting';
import { Intro } from '@/components/intro/Intro';
import { Logo } from '@/components/Logo';
import { WatchIntroButton } from '@/components/WatchIntroButton';
import { ImageType, previewWidth } from '@/lib/common';
import { RandomSpawnGrainRenderParameters } from '@/lib/grainRenderer/randomSpawn/RandomSpawnRenderer';
import welcomeIntroStateAtom, {
    WelcomeIntroState,
} from '@/lib/intro/storage/welcomeIntroStateAtom';
import { useAtom } from 'jotai';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useState } from 'react';

function Home() {
    const [welcomeIntroState] = useAtom(welcomeIntroStateAtom);

    const [loading, setLoading] = useState(false);
    const [resultFilename, setResultFilename] = useState<string | null>(null);

    const handleDevelop = async (
        file: File,
        renderParameters: RandomSpawnGrainRenderParameters,
    ) => {
        setResultFilename(null);
        setLoading(true);

        const formData = new FormData();
        formData.set('img', file);
        formData.set('parameters', JSON.stringify(renderParameters));

        const response = await fetch('/api/renderGrain', {
            method: 'POST',
            body: formData,
        });
        const filename = (await response.json()).filename;

        setLoading(false);
        setResultFilename(filename);
    };

    return (
        <>
            {process.env.NODE_ENV !== 'production' && <DebugOverlay />}
            <Greeting />
            {welcomeIntroState !== WelcomeIntroState.TOUR_STATE_INTRO_SEEN && (
                <Intro
                    className={`absolute top-0 left-0 w-full h-full ${welcomeIntroState === WelcomeIntroState.TOUR_STATE_GREETING_SEEN ? 'visible' : 'invisible'}`}
                />
            )}
            <ControlPanel
                className={`
                    absolute top-0 left-0
                    w-96 h-full
                    transition-transform duration-500
                    ${welcomeIntroState != WelcomeIntroState.TOUR_STATE_INTRO_SEEN ? '-translate-x-full' : ''}
                `}
                onDevelop={handleDevelop}
                loading={loading}
            />
            <main className="absolute w-full h-full pl-96 flex flex-col bg-zinc-900 -z-10">
                <header
                    className={`
                        self-center
                        w-full h-32
                        flex justify-center items-center
                        py-8 px-8
                        transition-all duration-500
                        ${
                            welcomeIntroState === null
                                ? '-translate-x-48'
                                : welcomeIntroState ===
                                    WelcomeIntroState.TOUR_STATE_GREETING_SEEN
                                  ? 'opacity-0 -translate-x-48'
                                  : ''
                        }
                    `}
                >
                    <Logo className="max-w-2xl object-contain" />
                    <WatchIntroButton className="mx-8" />
                </header>
                {resultFilename && (
                    <>
                        <Image
                            src={`/api/images/${resultFilename}/${ImageType.PREVIEW}`}
                            alt="Result preview"
                            width={previewWidth}
                            height={previewWidth}
                            className="mt-8 mx-auto"
                        />
                        <ButtonLink
                            className="mx-auto my-8"
                            href={`api/images/${resultFilename}/${ImageType.RESULT}`}
                            download
                        >
                            Download Result
                        </ButtonLink>
                    </>
                )}
                <Background className="absolute top-0 left-0 w-full h-full -z-10" />
            </main>
        </>
    );
}

export default dynamic(Promise.resolve(Home), { ssr: false });
