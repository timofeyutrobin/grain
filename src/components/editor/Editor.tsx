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
import { useAtom } from 'jotai';
import dynamic from 'next/dynamic';
import { ChangeEventHandler, useRef, useState } from 'react';

function Editor() {
    const [welcomeIntroState] = useAtom(welcomeIntroStateAtom);

    const [controlPanelOpen, setControlPanelOpen] = useState(false);

    const [loading, setLoading] = useState(false);
    const [canvasVisible, setCanvasVisible] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [downloadUrl, setDownloadUrl] = useState<string>('');

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
                    case 'canvasSizeSet':
                        setCanvasVisible(true);
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
        if (!canvasRef.current || !imageBitmap) {
            return;
        }
        setLoading(true);
        setControlPanelOpen(false);
        URL.revokeObjectURL(downloadUrl);
        setDownloadUrl('');
        let workerImageBitmap: ImageBitmap | null = null;
        workerImageBitmap = await createImageBitmap(imageBitmap);
        renderWorker.postMessage(
            {
                type: 'render',
                image: workerImageBitmap,
                params: renderParameters,
            },
            [workerImageBitmap],
        );
        workerImageBitmap.close();
    };

    const [file, setFile] = useState<File | null>(null);
    const [imageBitmap, setImageBitmap] = useState<ImageBitmap | null>(null);

    const handleFileChange: ChangeEventHandler<HTMLInputElement> = async (
        e,
    ) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            setFile(file);
            setImageBitmap(
                await createImageBitmap(file, {
                    imageOrientation: 'flipY',
                }),
            );
            imageBitmap?.close();
        }
    };

    const fileInputLabel = (
        <FileInputLabel className="w-full" htmlFor={FILE_UPLOAD_INPUT_ID}>
            Открыть&nbsp;изображение
        </FileInputLabel>
    );
    const fileInfo = !!file && !!imageBitmap && (
        <FileInfo
            fileName={file.name}
            imageWidth={imageBitmap.width}
            imageHeight={imageBitmap.height}
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
            {welcomeIntroState === WelcomeIntroState.TOUR_STATE_INTRO_SEEN && (
                <>
                    <main className="flex flex-col fixed top-0 left-0 w-full h-full max-h-full md:pl-96">
                        <header className="z-10 w-full flex justify-center md:hidden px-4 pt-10">
                            <Logo className="max-w-sm" />
                        </header>
                        <div
                            className={`max-w-full h-full overflow-y-scroll flex flex-col items-center m-auto p-4 ${canvasVisible ? '' : 'invisible'}`}
                        >
                            <canvas
                                className="max-w-full max-h-[720px]"
                                ref={canvasRef}
                            />
                            <div className="mt-4">{downloadButton}</div>
                        </div>
                        <WatchIntroButton className="shrink-0 self-start m-4" />
                        <footer className="md:hidden w-full p-4 bg-zinc-800">
                            <div className="w-full max-w-96 mb-2">
                                {downloadButton}
                            </div>
                            {fileInfo && (
                                <div className="w-full mb-2">{fileInfo}</div>
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
                </>
            )}
            <ControlPanel
                className={`
                    z-20
                    fixed top-0 left-0
                    md:w-96 w-full h-full
                    transition-transform duration-500
                    ${welcomeIntroState !== WelcomeIntroState.TOUR_STATE_INTRO_SEEN ? '-translate-x-full' : controlPanelOpen ? 'translate-0' : '-translate-x-full md:translate-0'}
                `}
                fileInputLabel={
                    <div className="w-full space-y-1">
                        {fileInputLabel}
                        {fileInfo}
                    </div>
                }
                onDevelop={handleDevelop}
                onClose={() => setControlPanelOpen(false)}
                disabled={loading || !file}
            />
            {welcomeIntroState !== WelcomeIntroState.TOUR_STATE_INTRO_SEEN && (
                <Intro
                    className={`absolute top-0 left-0 w-full h-full ${welcomeIntroState === WelcomeIntroState.TOUR_STATE_GREETING_SEEN ? 'visible' : 'invisible'}`}
                />
            )}
        </>
    );
}

export default dynamic(Promise.resolve(Editor), { ssr: false });
