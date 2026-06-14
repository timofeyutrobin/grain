import { Background } from '@/components/Background';
import { ButtonLink } from '@/components/button/ButtonLink';
import { ControlPanel } from '@/components/ControlPanel';
import { Greeting } from '@/components/Greeting';
import { Logo } from '@/components/Logo';
import { Presentation } from '@/components/presentation/Presentation';
import { ImageType, previewWidth } from '@/lib/common';
import { RandomSpawnGrainRenderParameters } from '@/lib/grainRenderer/randomSpawn/RandomSpawnRenderer';
import welcomeTourStateAtom, {
    WelcomeIntroState,
} from '@/lib/storage/welcomeTourStateAtom';
import { useAtom } from 'jotai';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useState } from 'react';

function Home() {
    const [welcomeTourState] = useAtom(welcomeTourStateAtom);

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
            <Greeting />
            <div className={`fixed flex items-stretch w-full h-full`}>
                {welcomeTourState ===
                    WelcomeIntroState.TOUR_STATE_INTRO_SEEN && (
                    <ControlPanel onDevelop={handleDevelop} loading={loading} />
                )}
                <main className="relative basis-full shrink flex flex-col bg-zinc-900 -z-10">
                    {welcomeTourState !==
                        WelcomeIntroState.TOUR_STATE_GREETING_SEEN && (
                        <header className="self-center w-1/2 h-32 py-8 px-8">
                            <Logo className="min-w-80" />
                        </header>
                    )}
                    {welcomeTourState !==
                        WelcomeIntroState.TOUR_STATE_INTRO_SEEN && (
                        <Presentation
                            className={`absolute top-0 left-0 w-full h-full ${welcomeTourState === WelcomeIntroState.TOUR_STATE_GREETING_SEEN ? 'visible' : 'invisible'}`}
                        />
                    )}
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
            </div>
        </>
    );
}

export default dynamic(Promise.resolve(Home), { ssr: false });
