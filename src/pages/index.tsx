import { Background } from '@/components/Background';
import { ControlPanel } from '@/components/ControlPanel';
import { DebugOverlay } from '@/components/DebugOverlay';
import { Greeting } from '@/components/Greeting';
import { Intro } from '@/components/intro/Intro';
import { Logo } from '@/components/Logo';
import { WatchIntroButton } from '@/components/WatchIntroButton';
import { isError } from '@/lib/common';
import { useRenderWorker } from '@/lib/grainRenderer/randomSpawnShader/useRenderWorker';
import welcomeIntroStateAtom, {
    WelcomeIntroState,
} from '@/lib/intro/storage/welcomeIntroStateAtom';
import { useAtom } from 'jotai';
import dynamic from 'next/dynamic';
import { useRef, useState } from 'react';

function Home() {
    const [welcomeIntroState] = useAtom(welcomeIntroStateAtom);

    const [loading, setLoading] = useState(false);
    const [canvasVisible, setCanvasVisible] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const renderWorker = useRenderWorker((worker) => {
        try {
            const resultCanvas =
                canvasRef.current?.transferControlToOffscreen();
            if (!resultCanvas) {
                return;
            }
            worker.postMessage(
                { type: 'create', resultCanvas },
                { transfer: [resultCanvas] },
            );
        } catch (err) {
            if (isError(err) && err.name === 'InvalidStateError') {
                return;
            }
            throw err;
        }
    });

    const handleDevelop = async (file: File) => {
        if (!canvasRef.current) {
            return;
        }
        setLoading(true);
        let imageBitmap: ImageBitmap | null = null;
        try {
            imageBitmap = await createImageBitmap(file, {
                imageOrientation: 'flipY',
            });
            renderWorker.postMessage(
                {
                    type: 'render',
                    image: imageBitmap,
                    params: {
                        layers: [
                            {
                                contrast: 0.14,
                                sensitivity: 0.1,
                                grainSize: 2,
                                spawnRate: 4,
                            },
                            {
                                contrast: 0.8,
                                sensitivity: 0.2,
                                grainSize: 1,
                                spawnRate: 6,
                            },
                            {
                                contrast: 1.6,
                                sensitivity: 1,
                                grainSize: 1,
                                spawnRate: 8,
                            },
                        ],
                    },
                },
                [imageBitmap],
            );
        } finally {
            imageBitmap?.close();
        }

        renderWorker.addEventListener('message', (event) => {
            if (event.data.type === 'ready') {
                setLoading(false);
            }
            if (event.data.type === 'canvasSizeSet') {
                setCanvasVisible(true);
            }
        });
    };

    return (
        <>
            {process.env.NODE_ENV !== 'production' && <DebugOverlay />}
            <Background className="fixed top-0 left-0 w-full h-full bg-zinc-900 -z-10" />
            <Greeting />
            <main className="fixed w-full h-full pl-96 flex flex-col">
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
                    {welcomeIntroState ===
                        WelcomeIntroState.TOUR_STATE_INTRO_SEEN && (
                        <WatchIntroButton disabled={loading} className="mx-8" />
                    )}
                </header>
                {welcomeIntroState ===
                    WelcomeIntroState.TOUR_STATE_INTRO_SEEN && (
                    <canvas
                        ref={canvasRef}
                        className={`self-center mx-32 max-h-4/5 ${canvasVisible ? '' : 'invisible'}`}
                    />
                )}
            </main>
            <ControlPanel
                className={`
                    fixed top-0 left-0
                    w-96 h-full
                    transition-transform duration-500
                    ${welcomeIntroState != WelcomeIntroState.TOUR_STATE_INTRO_SEEN ? '-translate-x-full' : ''}
                `}
                onDevelop={handleDevelop}
                loading={loading}
            />
            {welcomeIntroState !== WelcomeIntroState.TOUR_STATE_INTRO_SEEN && (
                <Intro
                    className={`absolute top-0 left-0 w-full h-full ${welcomeIntroState === WelcomeIntroState.TOUR_STATE_GREETING_SEEN ? 'visible' : 'invisible'}`}
                />
            )}
        </>
    );
}

export default dynamic(Promise.resolve(Home), { ssr: false });
