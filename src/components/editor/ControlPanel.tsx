import { Button } from '@/components/button/Button';
import { Settings } from '@/components/editor/settings/Settings';
import { SettingsGroup } from '@/components/editor/settings/SettingsGroup';
import { useSettings } from '@/components/editor/settings/useSettings';
import { GrainRenderParameters } from '@/lib/grainRenderer/GrainRenderer';
import { ChangeEventHandler, useState } from 'react';

interface ControlPanelProps {
    onDevelop: (file: File, renderParameters: GrainRenderParameters) => void;
    loading?: boolean;
    className?: string;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
    onDevelop,
    loading,
    className,
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
        <aside className={`flex flex-col bg-zinc-800 ${className ?? ''}`}>
            <section className="my-4 px-4 overflow-y-scroll space-y-4">
                <SettingsGroup legend="File">
                    <input
                        className="w-full
                            file:mr-5 file:py-1 file:px-3 file:border file:text-xs file:font-medium
                            file:bg-stone-5 hover:cursor-pointer hover:file:bg-stone-200 hover:file:cursor-pointer hover:file:text-stone-900
                        "
                        type="file"
                        onChange={handleFileChange}
                    />
                </SettingsGroup>
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
