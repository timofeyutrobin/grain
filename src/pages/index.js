import { useLayoutEffect, useRef, useState } from 'react';
import { getGrainImage } from '@/lib/grain';

export default function Home() {
    const imageRef = useRef();
    const [file, setFile] = useState(null);

    const handleFileChange = (e) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    useLayoutEffect(() => {
        if (!file) {
            return;
        }

        getGrainImage(file).then(({ data }) => {
            imageRef.current.src = data;
        });
    }, [file]);

    return (
        <main className="absolute w-full h-full flex flex-col align-middle">
            <input
                className="
                    p-4 file:mr-5 file:py-1 file:px-3 file:border file:text-xs file:font-medium
                    file:bg-stone-5 hover:file:cursor-pointer hover:file:bg-blue-50 hover:file:text-blue-700
                "
                type="file"
                onChange={handleFileChange}
            />
            <img ref={imageRef} />
        </main>
    );
}
