import { Background } from '@/components/Background';
import { Settings } from '@/components/Settings';
import { GrainSize } from '@/lib/common';
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
    const [grainSpread, setGrainSpread] = useState(1);
    const [redDyeColor, setRedDyeColor] = useState<Color>(defaultColors.red);
    const [greenDyeColor, setGreenDyeColor] = useState<Color>(
        defaultColors.green,
    );
    const [blueDyeColor, setBlueDyeColor] = useState<Color>(defaultColors.blue);

    const renderParameters =
        mode === 'grayscale'
            ? createGrayscaleRenderParameters(
                  grainSize,
                  grainSpread === 1 ? 1 : grainSpread * 2,
              )
            : createColorGrainRenderParameters(
                  createGrayscaleRenderParameters(
                      grainSize,
                      grainSpread === 1 ? 1 : grainSpread * 2,
                  ),
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
                    className="mt-auto mb-4 mx-4 p-1 text-2xl border cursor-pointer hover:bg-zinc-600 disabled:bg-zinc-200"
                    disabled={processing}
                >
                    Develop
                </button>
            </aside>
            <div className="relative w-full bg-zinc-900">
                <Background />
                <div className="absolute top-1/4 left-1/2 w-2/3 -translate-1/2 py-4 px-8 bg-black shadow-2xl">
                    <Image
                        loading="eager"
                        src="/logo.webp"
                        alt="logo"
                        width={1685}
                        height={186}
                        className="w-full h-full"
                    />
                </div>
                {resultFilename && (
                    <Link
                        className="absolute top-1/2 left-1/2 -translate-1/2 py-1 px-4 text-2xl border cursor-pointer hover:bg-zinc-600"
                        href={`api/images/${resultFilename}`}
                        download
                    >
                        Download Result
                    </Link>
                )}
            </div>
        </main>
    );
}
