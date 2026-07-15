import { Button } from '@/components/button/Button';
import { ButtonAnchor } from '@/components/button/ButtonAnchor';
import { Background } from '@/components/editor/Background';
import { ControlPanel } from '@/components/editor/ControlPanel';
import { FileInfo } from '@/components/editor/FileInfo';
import { FileInputLabel } from '@/components/editor/FileInputLabel';
import { Greeting } from '@/components/editor/Greeting';
import { Logo } from '@/components/editor/Logo';
import { WatchIntroButton } from '@/components/editor/WatchIntroButton';
import { Intro } from '@/components/intro/Intro';
import { FILE_UPLOAD_INPUT_ID, isError } from '@/lib/common';
import { GrainRenderParameters } from '@/lib/grainRenderer/GrainRenderer';
import { useRenderWorker } from '@/lib/grainRenderer/useRenderWorker';
import welcomeIntroStateAtom, {
    WelcomeIntroState,
} from '@/lib/intro/storage/welcomeIntroStateAtom';
import classNames from 'classnames';
import { useAtom } from 'jotai';
import dynamic from 'next/dynamic';
import { ChangeEventHandler, useRef, useState } from 'react';

function Editor() {
    const [welcomeIntroState] = useAtom(welcomeIntroStateAtom);

    const [controlPanelOpen, setControlPanelOpen] = useState(false);

    const [loading, setLoading] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [downloadUrl, setDownloadUrl] = useState<string>('');

    const [fileName, setFileName] = useState<string | null>(null);
    const [imageSize, setImageSize] = useState<
        [width: number, height: number] | null
    >(null);

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
            worker.addEventListener('message', (event) => {
                switch (event.data.type) {
                    case 'ready':
                        worker.postMessage({ type: 'getBlob' });
                        break;
                    case 'blobReady':
                        const blob: Blob = event.data.blob;
                        const url = URL.createObjectURL(blob);
                        setDownloadUrl(url);
                        setLoading(false);
                        break;
                }
            });
        } catch (err) {
            if (isError(err) && err.name === 'InvalidStateError') {
                return;
            }
            throw err;
        }
    });

    const handleDevelop = async (renderParameters: GrainRenderParameters) => {
        setLoading(true);
        setControlPanelOpen(false);
        URL.revokeObjectURL(downloadUrl);
        setDownloadUrl('');
        renderWorker.postMessage({
            type: 'render',
            params: renderParameters,
        });
    };

    const handleFileChange: ChangeEventHandler<HTMLInputElement> = async (
        e,
    ) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            setFileName(file.name);
            const image = await createImageBitmap(file, {
                imageOrientation: 'flipY',
            });
            setImageSize([image.width, image.height]);
            renderWorker.postMessage({ type: 'setImage', image }, [image]);
            image.close();
        }
    };

    const fileInputLabel = (
        <FileInputLabel className="w-full" htmlFor={FILE_UPLOAD_INPUT_ID}>
            Открыть&nbsp;изображение
        </FileInputLabel>
    );
    const fileInfo = !!fileName && !!imageSize && (
        <FileInfo
            fileName={fileName}
            imageWidth={imageSize[0]}
            imageHeight={imageSize[1]}
        />
    );
    const downloadButton = downloadUrl && !loading && (
        <ButtonAnchor
            small
            download="result.png"
            className="block w-full text-center"
            href={downloadUrl}
        >
            Скачать
        </ButtonAnchor>
    );

    return (
        <>
            <input
                id={FILE_UPLOAD_INPUT_ID}
                className="hidden"
                type="file"
                onChange={handleFileChange}
            />
            <Background className="fixed top-0 left-0 w-full h-full bg-zinc-900 -z-10" />
            <Greeting />
            <main
                className={classNames(
                    'flex flex-col fixed top-0 left-0 w-full h-full max-h-full md:pl-96',
                    {
                        invisible:
                            welcomeIntroState !==
                            WelcomeIntroState.TOUR_STATE_INTRO_SEEN,
                    },
                )}
            >
                <header className="z-10 w-full flex justify-center md:hidden px-4 pt-10">
                    <Logo className="max-w-sm" />
                </header>
                <div
                    className={classNames(
                        'max-w-full h-full overflow-y-scroll flex flex-col items-center m-auto p-4',
                    )}
                >
                    <canvas
                        className="max-w-full max-h-[720px]"
                        ref={canvasRef}
                    />
                    <div className="hidden mt-4 md:block">{downloadButton}</div>
                </div>
                <WatchIntroButton className="shrink-0 self-start m-4" />
                <footer className="md:hidden w-full p-4 bg-zinc-800">
                    {fileInfo && <div className="w-full mb-2">{fileInfo}</div>}
                    {downloadButton && (
                        <div className="w-full max-w-96 mb-2 mx-auto">
                            {downloadButton}
                        </div>
                    )}
                    <div className="mx-auto max-w-96 flex items-center gap-4">
                        <Button
                            secondary
                            small
                            className="w-full"
                            onClick={() => setControlPanelOpen(true)}
                        >
                            Проявка
                        </Button>
                        {fileInputLabel}
                    </div>
                </footer>
            </main>
            <ControlPanel
                className={classNames(
                    'z-20',
                    'fixed',
                    'top-0',
                    'left-0',
                    'md:w-96',
                    'w-full',
                    'h-full',
                    'transition-transform',
                    'duration-500',
                    welcomeIntroState !==
                        WelcomeIntroState.TOUR_STATE_INTRO_SEEN
                        ? '-translate-x-full'
                        : controlPanelOpen
                          ? 'translate-0'
                          : '-translate-x-full md:translate-0',
                )}
                fileInputLabel={
                    <div className="w-full space-y-1">
                        {fileInputLabel}
                        {fileInfo}
                    </div>
                }
                onDevelop={handleDevelop}
                onClose={() => setControlPanelOpen(false)}
                disabled={loading || !fileName}
            />
            {welcomeIntroState !== WelcomeIntroState.TOUR_STATE_INTRO_SEEN && (
                <Intro
                    className={classNames(
                        'absolute top-0 left-0 w-full h-full',
                        {
                            invisible:
                                welcomeIntroState !==
                                WelcomeIntroState.TOUR_STATE_GREETING_SEEN,
                        },
                    )}
                />
            )}
        </>
    );
}

export default dynamic(Promise.resolve(Editor), { ssr: false });
