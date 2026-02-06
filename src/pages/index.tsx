import { Settings } from '@/components/Settings';
import { baseColorPreset, baseGrayscalePreset } from '@/lib/presets';
import { ChangeEventHandler, useState } from 'react';

export default function Home() {
    const [file, setFile] = useState<File>(null);

    const [processing, setProcessing] = useState(false);
    const [resultFilename, setResultFilename] = useState<string>(null);

    const [mode, setMode] = useState<'grayscale' | 'color'>('grayscale');

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
        const options =
            mode === 'grayscale'
                ? baseGrayscalePreset.getOptions()
                : baseColorPreset.getOptions();
        formData.set('img', file);
        formData.set('options', JSON.stringify(options));

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
                    <a
                        className="m-auto py-1 px-4 text-2xl border cursor-pointer hover:bg-gray-600"
                        href={`/images/${resultFilename}`}
                        download
                    >
                        Download Result
                    </a>
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
                    <Settings mode={mode} onModeChange={setMode} />
                </section>
                <button
                    onClick={handleGenerateClick}
                    className="mt-auto mb-4 mx-4 p-1 text-2xl border cursor-pointer hover:bg-gray-600 disabled:bg-amber-300"
                    disabled={processing}
                >
                    Generate
                </button>
            </aside>
        </main>
    );
}
