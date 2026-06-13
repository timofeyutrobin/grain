import { Button } from '@/components/button/Button';
import { Settings } from '@/components/settings/Settings';
import { useSettings } from '@/hooks/useSettings';
import { RandomSpawnGrainRenderParameters } from '@/lib/grainRenderer/randomSpawn/RandomSpawnRenderer';
import { ChangeEventHandler, useState } from 'react';

interface ControlPanelProps {
    onDevelop: (
        file: File,
        renderParameters: RandomSpawnGrainRenderParameters,
    ) => void;
    loading?: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
    onDevelop,
    loading,
}) => {
    const [file, setFile] = useState<File | null>(null);
    const handleFileChange: ChangeEventHandler<HTMLInputElement> = (e) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

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

    const handleDevelopClick = () => {
        if (!file) {
            return;
        }

        onDevelop(file, renderParameters);
    };

    return (
        <aside className="w-96 shrink-0 flex flex-col bg-zinc-800">
            <input
                className="
                            p-4 bg-zinc-800 file:mr-5 file:py-1 file:px-3 file:border file:text-xs file:font-medium
                            file:bg-stone-5 hover:cursor-pointer hover:file:bg-stone-200 hover:file:cursor-pointer hover:file:text-stone-900
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
            <Button
                onClick={handleDevelopClick}
                className="mt-auto mb-4 mx-4"
                disabled={loading || !file}
            >
                Develop
            </Button>
        </aside>
    );
};
