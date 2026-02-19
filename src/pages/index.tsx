import { Background } from '@/components/Background';
import { Settings } from '@/components/Settings';
import { GrainSize, GrainSpread, ImageType, previewWidth } from '@/lib/common';
import {
    Color,
    createColorGrainRenderParameters,
    createGrayscaleRenderParameters,
    defaultColors,
    RenderMode,
} from '@/lib/grainRenderParameters';
import Image from 'next/image';
import Link from 'next/link';
import { ChangeEventHandler, useState } from 'react';

export default function Home() {
    const [file, setFile] = useState<File | null>(null);

    const [processing, setProcessing] = useState(false);
    const [resultFilename, setResultFilename] = useState<string | null>(null);

    const [mode, setMode] = useState<RenderMode>('grayscale');
    const [grainSize, setGrainSize] = useState<GrainSize>(1);
    const [grainSpread, setGrainSpread] = useState<GrainSpread>(1);
    const [redDyeColor, setRedDyeColor] = useState<Color>(defaultColors.red);
    const [greenDyeColor, setGreenDyeColor] = useState<Color>(
        defaultColors.green,
    );
    const [blueDyeColor, setBlueDyeColor] = useState<Color>(defaultColors.blue);

    const renderParameters =
        mode === 'grayscale'
            ? createGrayscaleRenderParameters(grainSize, grainSpread)
            : createColorGrainRenderParameters(
                  createGrayscaleRenderParameters(grainSize, grainSpread),
                  { color: redDyeColor },
                  { color: greenDyeColor },
                  { color: blueDyeColor },
              );

    const handleFileChange: ChangeEventHandler<HTMLInputElement> = (e) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleGenerateClick = async () => {
        if (!file) {
            return;
        }

        setResultFilename(null);
        setProcessing(true);

        const formData = new FormData();
        formData.set('img', file);
        formData.set('parameters', JSON.stringify(renderParameters));

        const response = await fetch('/api/getGrain', {
            method: 'POST',
            body: formData,
        });
        const filename = (await response.json()).filename;

        setProcessing(false);
        setResultFilename(filename);
    };

    return (
        <main className="fixed flex items-stretch w-full h-full">
            <aside className="w-md flex flex-col bg-zinc-800 overflow-y-scroll">
                <input
                    className="
                    p-4 bg-zinc-800 file:mr-5 file:py-1 file:px-3 file:border file:text-xs file:font-medium
                    file:bg-stone-5 hover:cursor-pointer hover:file:bg-amber-300 hover:file:cursor-pointer hover:file:text-zinc-900
                "
                    type="file"
                    onChange={handleFileChange}
                />
                <section className="m-4">
                    <Settings
                        mode={mode}
                        onModeChange={setMode}
                        redDyeColor={redDyeColor}
                        onRedDyeColorChange={setRedDyeColor}
                        greenDyeColor={greenDyeColor}
                        onGreenDyeColorChange={setGreenDyeColor}
                        blueDyeColor={blueDyeColor}
                        onBlueDyeColorChange={setBlueDyeColor}
                        grainSize={grainSize}
                        onGrainSizeChange={setGrainSize}
                        grainSpread={grainSpread}
                        onGrainSpreadChange={setGrainSpread}
                        renderParameters={renderParameters}
                    />
                </section>
                <button
                    onClick={handleGenerateClick}
                    className="mt-auto mb-4 mx-4 p-1 text-2xl border cursor-pointer hover:bg-zinc-600 disabled:bg-zinc-900 disabled:text-zinc-500 disabled:cursor-not-allowed"
                    disabled={processing || !file}
                >
                    Develop
                </button>
            </aside>
            <div className="relative flex flex-col w-full bg-zinc-900 -z-10">
                <header className="flex h-32 py-4 px-8 ">
                    <Image
                        loading="eager"
                        src="/logo.webp"
                        alt="logo"
                        width={843}
                        height={93}
                        className="w-2/3 m-auto"
                        unoptimized
                    />
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
                        <Link
                            className="mx-auto my-8 py-1 px-4 text-2xl border cursor-pointer hover:bg-zinc-600"
                            href={`api/images/${resultFilename}/${ImageType.RESULT}`}
                            download
                        >
                            Download Result
                        </Link>
                    </>
                )}
                <Background />
            </div>
        </main>
    );
}
