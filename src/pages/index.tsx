import { Background } from '@/components/Background';
import { Settings } from '@/components/Settings/Settings';
import { useSettings } from '@/hooks/useSettings';
import { ImageType, previewWidth } from '@/lib/common';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { ChangeEventHandler, useState } from 'react';

const Presentation = dynamic(
    () => import('@/components/presentation/Presentation'),
    { ssr: false },
);

export default function Home() {
    const [file, setFile] = useState<File | null>(null);

    const [processing, setProcessing] = useState(false);
    const [resultFilename, setResultFilename] = useState<string | null>(null);

    const {
        mode,
        setMode,
        curveType,
        setCurveType,
        grainSize,
        setGrainSize,
        grainCount,
        setGrainCount,
        redDyeColor,
        setRedDyeColor,
        greenDyeColor,
        setGreenDyeColor,
        blueDyeColor,
        setBlueDyeColor,

        renderParameters,
    } = useSettings();

    const handleFileChange: ChangeEventHandler<HTMLInputElement> = (e) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleDevelopClick = async () => {
        if (!file) {
            return;
        }

        setResultFilename(null);
        setProcessing(true);

        const formData = new FormData();
        formData.set('img', file);
        formData.set('parameters', JSON.stringify(renderParameters));

        const response = await fetch('/api/renderGrain', {
            method: 'POST',
            body: formData,
        });
        const filename = (await response.json()).filename;

        setProcessing(false);
        setResultFilename(filename);
    };

    return (
        <div className="fixed flex items-stretch w-full h-full">
            <aside className="w-96 shrink-0 flex flex-col bg-zinc-800">
                <input
                    className="
                    p-4 bg-zinc-800 file:mr-5 file:py-1 file:px-3 file:border file:text-xs file:font-medium
                    file:bg-stone-5 hover:cursor-pointer hover:file:bg-amber-300 hover:file:cursor-pointer hover:file:text-zinc-900
                "
                    type="file"
                    onChange={handleFileChange}
                />
                <section className="my-4 px-4 overflow-y-scroll">
                    <Settings
                        mode={mode}
                        onModeChange={setMode}
                        curveType={curveType}
                        onCurveTypeChange={setCurveType}
                        redDyeColor={redDyeColor}
                        onRedDyeColorChange={setRedDyeColor}
                        greenDyeColor={greenDyeColor}
                        onGreenDyeColorChange={setGreenDyeColor}
                        blueDyeColor={blueDyeColor}
                        onBlueDyeColorChange={setBlueDyeColor}
                        grainSize={grainSize}
                        onGrainSizeChange={setGrainSize}
                        grainCount={grainCount}
                        onGrainCountChange={setGrainCount}
                        renderParameters={renderParameters}
                    />
                </section>
                <button
                    onClick={handleDevelopClick}
                    className="mt-auto mb-4 mx-4 p-1 text-2xl border cursor-pointer hover:bg-zinc-600 disabled:bg-zinc-900 disabled:text-zinc-500 disabled:cursor-not-allowed"
                    disabled={processing || !file}
                >
                    Develop
                </button>
            </aside>
            <main className="relative basis-full shrink flex flex-col bg-zinc-900 -z-10">
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
                <div className="h-125 mx-9 mt-9 border border-white bg-black/20">
                    <Presentation />
                </div>
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
            </main>
        </div>
    );
}
