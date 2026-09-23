import { Button } from '@/components/button/Button';
import { ButtonAnchor } from '@/components/button/ButtonAnchor';
import { ButtonLabel } from '@/components/button/ButtonLabel';
import { Background } from '@/components/editor/Background';
import { ControlPanel } from '@/components/editor/ControlPanel';
import { Greeting } from '@/components/editor/Greeting';
import { LoadingSpinner } from '@/components/editor/LoadingSpinner';
import { Logo } from '@/components/editor/Logo';
import { PreviewPanel } from '@/components/editor/PreviewPanel';
import { useSettings } from '@/components/editor/settings/useSettings';
import { Intro } from '@/components/intro/Intro';
import { FILE_UPLOAD_INPUT_ID, PREVIEW_SIZE } from '@/lib/common';
import welcomeIntroStateAtom, {
    WelcomeIntroState,
} from '@/lib/intro/storage/welcomeIntroStateAtom';
import { GrainRenderParameters } from '@/lib/rendering/grainRenderer/GrainRenderer';
import { useRenderWorker } from '@/lib/rendering/grainRenderer/useRenderWorker';
import classNames from 'classnames';
import { useAtom } from 'jotai';
import dynamic from 'next/dynamic';
import { ChangeEventHandler, useEffect, useRef, useState } from 'react';

function Editor() {
    const [welcomeIntroState] = useAtom(welcomeIntroStateAtom);

    const [controlPanelOpen, setControlPanelOpen] = useState(false);
    const [previewPanelOpen, setPreviewPanelOpen] = useState(false);
    const settings = useSettings();

    const [loading, setLoading] = useState(false);
    const resultCanvasRef = useRef<HTMLCanvasElement>(null);

    const [downloadUrl, setDownloadUrl] = useState<string>('');

    const [fileName, setFileName] = useState<string | null>(null);
    const [imageSize, setImageSize] = useState<
        [width: number, height: number] | null
    >(null);
    const [previewImage, setPreviewImage] = useState<ImageBitmap | null>();

    useEffect(
        () => () => {
            previewImage?.close();
        },
        [previewImage],
    );

    const renderWorker = useRenderWorker((worker) => {
        worker.postMessage({ type: 'create' });
        worker.addEventListener('message', (event) => {
            switch (event.data.type) {
                case 'ready': {
                    const canvas = resultCanvasRef.current;
                    const blob: Blob = event.data.blob;
                    const image: ImageBitmap = event.data.imageBitmap;
                    if (canvas) {
                        canvas.width = image.width;
                        canvas.height = image.height;
                        canvas
                            .getContext('bitmaprenderer')
                            ?.transferFromImageBitmap(image);
                    }
                    image.close();

                    const url = URL.createObjectURL(blob);
                    setDownloadUrl(url);
                    setLoading(false);
                    break;
                }
            }
        });
    });

    const handleDevelop = async (renderParameters: GrainRenderParameters) => {
        if (!renderWorker) {
            return;
        }

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
        if (!renderWorker) {
            return;
        }

        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            setFileName(file.name);
            const image = await createImageBitmap(file, {
                imageOrientation: 'flipY',
            });
            const width = image.width;
            const height = image.height;
            setImageSize([width, height]);
            renderWorker.postMessage({ type: 'setImage', image }, [image]);
            setPreviewImage(
                await createImageBitmap(
                    file,
                    Math.max(width / 2 - PREVIEW_SIZE / 2, 0),
                    Math.max(height / 2 - PREVIEW_SIZE / 2, 0),
                    Math.min(PREVIEW_SIZE, width),
                    Math.min(PREVIEW_SIZE, height),
                    {
                        imageOrientation: 'flipY',
                        resizeWidth: PREVIEW_SIZE,
                        resizeHeight: PREVIEW_SIZE,
                    },
                ),
            );
        }
    };

    const fileInputLabel = (
        <ButtonLabel
            className={classNames('w-full', { 'pointer-events-none': loading })}
            small
            htmlFor={FILE_UPLOAD_INPUT_ID}
        >
            Открыть&nbsp;изображение
        </ButtonLabel>
    );
    const fileInfo = !!fileName && !!imageSize && (
        <div className="flex justify-between text-xs font-light text-zinc-200">
            <span>{fileName}</span>
            <span>
                {imageSize[0]}x{imageSize[1]}
            </span>
        </div>
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
                disabled={loading}
            />
            <Background className="fixed top-0 left-0 w-full h-full bg-zinc-900 -z-10" />
            <Greeting />
            <main
                className={classNames(
                    'fixed top-0 left-0 w-full h-full max-h-full md:pl-96 xl:pr-96 flex flex-col items-center',
                    {
                        invisible:
                            welcomeIntroState !==
                            WelcomeIntroState.TOUR_STATE_INTRO_SEEN,
                    },
                )}
            >
                <header className="md:hidden m-auto px-4 pt-10">
                    <Logo className="max-w-sm" />
                </header>
                <div className="relative w-full min-h-0 flex-1 flex p-6">
                    <canvas
                        className={classNames(
                            'max-w-full max-h-full m-auto transition-[filter]',
                            loading && 'brightness-25 blur-sm',
                        )}
                        ref={resultCanvasRef}
                    />
                    {loading && (
                        <LoadingSpinner className="absolute w-[120px] h-[120px] inset-0 m-auto opacity-40" />
                    )}
                </div>
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
                settings={settings}
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
                downloadButton={downloadButton}
            />
            <PreviewPanel
                open={previewPanelOpen}
                className={classNames(
                    'z-20',
                    'fixed',
                    'top-0',
                    'right-0',
                    'w-full',
                    'md:w-96',
                    'h-full',
                    'transition-transform',
                    'duration-500',
                    welcomeIntroState !==
                        WelcomeIntroState.TOUR_STATE_INTRO_SEEN
                        ? 'translate-x-full xl:translate-x-full'
                        : previewPanelOpen
                          ? 'translate-0'
                          : 'translate-x-full xl:translate-0',
                )}
                renderParameters={settings.renderParameters}
                image={previewImage}
                toggleOpen={() => setPreviewPanelOpen((open) => !open)}
                isOpenButtonHidden={
                    welcomeIntroState !==
                    WelcomeIntroState.TOUR_STATE_INTRO_SEEN
                }
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
