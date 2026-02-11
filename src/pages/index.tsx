import { Settings } from '@/components/Settings';
import {
    Color,
    createColorGrainRenderParameters,
    defaultColors,
    initialGrayscaleRenderParameters,
    RenderMode,
} from '@/lib/grainRenderParameters';
import Link from 'next/link';
import { ChangeEventHandler, useState } from 'react';

export default function Home() {
    const [file, setFile] = useState<File | null>(null);

    const [processing, setProcessing] = useState(false);
    const [resultFilename, setResultFilename] = useState<string | null>(null);

    const [mode, setMode] = useState<RenderMode>('grayscale');
    const [redDyeColor, setRedDyeColor] = useState<Color>(defaultColors.red);
    const [greenDyeColor, setGreenDyeColor] = useState<Color>(
        defaultColors.green,
    );
    const [blueDyeColor, setBlueDyeColor] = useState<Color>(defaultColors.blue);

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

        const renderParameters =
            mode === 'grayscale'
                ? initialGrayscaleRenderParameters
                : createColorGrainRenderParameters(
                      initialGrayscaleRenderParameters,
                      { color: redDyeColor },
                      { color: greenDyeColor },
                      { color: blueDyeColor },
                  );

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
        <main className="absolute w-full h-full">
            <div className="fixed top-0 left-0 flex pl-80 w-full h-full overflow-scroll bg-radial from-gray-500 to-gray-700">
                {resultFilename && (
                    <Link
                        className="m-auto py-1 px-4 text-2xl border cursor-pointer hover:bg-gray-600"
                        href={`api/images/${resultFilename}`}
                        download
                    >
                        Download Result
                    </Link>
                )}
            </div>
            <aside className="fixed top-0 left-0 flex flex-col w-xs h-full bg-gray-800">
                <input
                    className="
                    p-4 bg-gray-900 file:mr-5 file:py-1 file:px-3 file:border file:text-xs file:font-medium
                    file:bg-stone-5 hover:cursor-pointer hover:file:bg-blue-50 hover:file:text-blue-700
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
                    />
                </section>
                <button
                    onClick={handleGenerateClick}
                    className="mt-auto mb-4 mx-4 p-1 text-2xl border cursor-pointer hover:bg-gray-600 disabled:bg-gray-200"
                    disabled={processing}
                >
                    Generate
                </button>
            </aside>
        </main>
    );
}
