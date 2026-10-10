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
import { Toaster } from '@/components/toast/Toaster';
import { addToastAtom } from '@/components/toast/toasterAtom';
import { isError, PREVIEW_SIZE } from '@/lib/common';
import { useDB } from '@/lib/editor/useDB';
import welcomeIntroStateAtom, {
    WelcomeIntroState,
} from '@/lib/intro/storage/welcomeIntroStateAtom';
import {
    RenderWorkerResponse,
    type RendererWorker,
} from '@/lib/rendering/grainRenderer/rendererWorker';
import { useRenderWorker } from '@/lib/rendering/grainRenderer/useRenderWorker';
import classNames from 'classnames';
import { useAtomValue, useSetAtom } from 'jotai';
import dynamic from 'next/dynamic';
import { ChangeEventHandler, useEffect, useRef, useState } from 'react';
import { SampleImage } from './SampleImage';

const FILE_UPLOAD_INPUT_ID = 'upload';

function Editor() {
    const welcomeIntroState = useAtomValue(welcomeIntroStateAtom);
    const addToast = useSetAtom(addToastAtom);

    const database = useDB();
    const settings = useSettings();

    const [controlPanelOpen, setControlPanelOpen] = useState(false);
    const [previewPanelOpen, setPreviewPanelOpen] = useState(false);

    const [loading, setLoading] = useState(false);
    const resultCanvasRef = useRef<HTMLCanvasElement>(null);

    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

    const [fileLoading, setFileLoading] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const [imageSize, setImageSize] = useState<
        [width: number, height: number] | null
    >(null);
    const [previewImage, setPreviewImage] = useState<ImageBitmap | null>(null);
    const [sampleImage, setSampleImage] = useState<ImageBitmap | null>(null);

    useEffect(
        () => () => {
            sampleImage?.close();
        },
        [sampleImage],
    );

    const setResultImage = (image: ImageBitmap, blob: Blob) => {
        const canvas = resultCanvasRef.current;
        if (canvas) {
            canvas.width = image.width;
            canvas.height = image.height;
            canvas.getContext('bitmaprenderer')?.transferFromImageBitmap(image);
        }
        image.close();

        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
        setLoading(false);
    };

    const renderWorker = useRenderWorker((worker) => {
        worker.postMessage({ type: 'create' });
    });

    useEffect(() => {
        if (!renderWorker || !database) {
            return;
        }

        const onMessage = (event: MessageEvent<RenderWorkerResponse>) => {
            switch (event.data.type) {
                case 'ready': {
                    const blob = event.data.blob;
                    const image = event.data.imageBitmap;

                    setResultImage(image, blob);
                    database.persistResultImage(blob);

                    break;
                }
                case 'error': {
                    const error = event.data.error;
                    if (isError(error)) {
                        addToast({ text: error.message });
                    } else {
                        addToast({ text: 'Непредвиденная ошибка' });
                    }
                    setLoading(false);
                    break;
                }
            }
        };

        renderWorker.addEventListener('message', onMessage);
        return () => {
            renderWorker.removeEventListener('message', onMessage);
        };
    }, [renderWorker, database]);

    const setFile = async (renderWorker: RendererWorker, file: File) => {
        const image = await createImageBitmap(file, {
            imageOrientation: 'flipY',
        });

        const width = image.width;
        const height = image.height;

        const previewImageBitmap = await createImageBitmap(
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
        );

        setPreviewImage(previewImageBitmap);
        setFileName(file.name);
        setImageSize([width, height]);
        renderWorker.postMessage({ type: 'setImage', image }, [image]);
    };

    const handleFileChange: ChangeEventHandler<HTMLInputElement> = async (
        e,
    ) => {
        if (previewImage !== sampleImage) {
            previewImage?.close();
        }

        const file = e.target.files?.[0];
        if (!file || !renderWorker) {
            return;
        }

        try {
            setFileLoading(true);
            await setFile(renderWorker, file);
            database?.persistOriginalFile(file);
        } catch (error) {
            if (error instanceof Error && error.name === 'InvalidStateError') {
                addToast({ text: 'Тип изображения не поддерживается' });
            }
        } finally {
            setFileLoading(false);
        }
    };

    useEffect(() => {
        if (!renderWorker || !sampleImage || !database) {
            return;
        }

        if (previewImage) {
            return;
        }

        (async () => {
            try {
                setFileLoading(true);
                const originalFile = await database.loadOriginalFile();
                if (!originalFile) {
                    setPreviewImage(sampleImage);
                } else {
                    await setFile(renderWorker, originalFile);
                }
            } catch (error) {
                if (
                    error instanceof Error &&
                    error.name === 'InvalidStateError'
                ) {
                    setPreviewImage(sampleImage);
                }
            } finally {
                setFileLoading(false);
            }

            const initialSettings = await database.loadSettings();
            if (initialSettings) {
                settings.set(initialSettings);
            } else {
                settings.setDefaults();
            }

            const resultBlob = await database.loadResultImage();
            if (!resultBlob) {
                return;
            }
            const resultImageBitmap = await createImageBitmap(resultBlob);
            setResultImage(resultImageBitmap, resultBlob);
        })();
    }, [renderWorker, sampleImage, database]);

    const handleDevelop = async () => {
        if (
            !renderWorker ||
            !settings.hasAllSettingsParameters(settings) ||
            !settings.renderParameters
        ) {
            return;
        }

        setLoading(true);
        setControlPanelOpen(false);
        downloadUrl && URL.revokeObjectURL(downloadUrl);
        setDownloadUrl(null);

        database?.persistSettings({
            mode: settings.mode,
            contrast: settings.contrast,
            sensitivity: settings.sensitivity,
            grainSize: settings.grainSize,
            grainCount: settings.grainCount,
            sharpness: settings.sharpness,
            redDyeColor: settings.redDyeColor,
            greenDyeColor: settings.greenDyeColor,
            blueDyeColor: settings.blueDyeColor,
        });

        renderWorker.postMessage({
            type: 'render',
            params: settings.renderParameters,
        });
    };

    const isFileReady = !!fileName && !!imageSize;
    const isResultReady = !!downloadUrl && !loading;
    const isFileInputDisabled = loading || fileLoading;

    const fileInputLabel = (
        <div className="flex gap-2">
            <ButtonLabel
                className={classNames('w-full', {
                    'pointer-events-none bg-stone-500 border-stone-500 text-stone-400 cursor-not-allowed':
                        isFileInputDisabled,
                })}
                small
                htmlFor={FILE_UPLOAD_INPUT_ID}
                title="Upload Image"
            >
                Открыть&nbsp;изображение
            </ButtonLabel>
            {isFileReady && (
                <Button
                    className={classNames({
                        'pointer-events-none': loading,
                    })}
                    small
                    secondary
                    title="Close"
                    onClick={() => {
                        database?.deleteOriginalFile();
                        setFileName(null);
                        setImageSize(null);
                        setPreviewImage(sampleImage);
                    }}
                    disabled={isFileInputDisabled}
                >
                    &#x2715;
                </Button>
            )}
        </div>
    );
    const fileInfo = isFileReady && (
        <div className="flex justify-between text-xs font-light text-zinc-200">
            <span>{fileName}</span>
            <span>
                {imageSize[0]}x{imageSize[1]}
            </span>
        </div>
    );
    const downloadButton = isResultReady && (
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
            <SampleImage
                width={PREVIEW_SIZE}
                height={PREVIEW_SIZE}
                onLoad={async (e) => {
                    setSampleImage(
                        await createImageBitmap(e.currentTarget, {
                            imageOrientation: 'flipY',
                        }),
                    );
                }}
            />
            <input
                id={FILE_UPLOAD_INPUT_ID}
                className="hidden"
                type="file"
                onChange={handleFileChange}
                disabled={isFileInputDisabled}
            />
            <Toaster />
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
                <div className="relative w-full min-h-0 flex-1 flex flex-col p-6">
                    {isResultReady && (
                        <Button
                            tiny
                            secondary
                            className="absolute top-6 right-6"
                            onClick={() => {
                                resultCanvasRef.current
                                    ?.getContext('bitmaprenderer')
                                    ?.transferFromImageBitmap(null);
                                URL.revokeObjectURL(downloadUrl);
                                setDownloadUrl(null);
                                database?.deleteResultImage();
                                database?.deleteSettings();
                            }}
                        >
                            Удалить
                        </Button>
                    )}
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
                disabled={isFileInputDisabled || !isFileReady}
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
