import { ChangeEventHandler, useLayoutEffect, useRef, useState } from 'react';
import { readImageData } from '@/lib/files';
import { baseGrayscalePreset, testColorPreset } from '@/lib/presets';

export default function Home() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [offscreenCanvas, setOffscreenCanvas] = useState<OffscreenCanvas>();
    const [file, setFile] = useState<File>(null);
    const workerRef = useRef<Worker>(null);

    const [processing, setProcessing] = useState(false);

    useLayoutEffect(() => {
        setOffscreenCanvas(canvasRef.current.transferControlToOffscreen());

        return () => {
            workerRef.current?.terminate();
        };
    }, []);

    const handleFileChange: ChangeEventHandler<HTMLInputElement> = (e) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleGenerateClick = () => {
        if (!file) {
            return;
        }

        setProcessing(true);

        readImageData(file).then((imageData) => {
            if (!workerRef.current) {
                workerRef.current = new Worker(
                    new URL('@/lib/grainWorker.ts', import.meta.url),
                );

                workerRef.current.onmessage = (e) => {
                    e.data && setProcessing(false);
                };

                workerRef.current.postMessage(
                    {
                        canvas: offscreenCanvas,
                        imageData,
                        options: testColorPreset.getOptions(),
                    },
                    [offscreenCanvas],
                );
            } else {
                workerRef.current.postMessage({
                    imageData,
                    options: testColorPreset.getOptions(),
                });
            }
        });
    };

    return (
        <main className="absolute w-full h-full">
            <div className="fixed top-0 left-0 flex pl-80 w-full h-full overflow-scroll bg-radial from-gray-500 to-gray-700">
                <canvas
                    width={0}
                    height={0}
                    ref={canvasRef}
                    className="m-auto"
                />
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
