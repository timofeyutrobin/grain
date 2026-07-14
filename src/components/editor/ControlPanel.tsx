import { Button } from '@/components/button/Button';
import { Logo } from '@/components/editor/Logo';
import { Settings } from '@/components/editor/settings/Settings';
import { SettingsGroup } from '@/components/editor/settings/SettingsGroup';
import { useSettings } from '@/components/editor/settings/useSettings';
import { GrainRenderParameters } from '@/lib/grainRenderer/GrainRenderer';
import { ReactNode } from 'react';

interface ControlPanelProps {
    onDevelop: (renderParameters: GrainRenderParameters) => void;
    onClose: () => void;
    fileInputLabel: ReactNode;
    disabled?: boolean;
    className?: string;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
    onDevelop,
    disabled,
    className,
    onClose,
    fileInputLabel,
}) => {
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
        onDevelop(renderParameters);
    };

    return (
        <aside className={`flex flex-col bg-zinc-800 ${className ?? ''}`}>
            <Logo className="hidden md:block w-full px-4 pt-4 object-contain" />
            <section className="self-center w-full max-w-96 my-4 px-4 overflow-y-scroll space-y-4">
                <SettingsGroup className="hidden md:block" legend="Файл">
                    {fileInputLabel}
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
            <footer className="self-center max-w-96 w-full flex gap-4 mt-auto p-4">
                <Button
                    secondary
                    small
                    className="md:hidden w-full"
                    onClick={onClose}
                >
                    Закрыть
                </Button>
                <Button
                    small
                    className="w-full"
                    onClick={handleDevelopClick}
                    disabled={disabled}
                >
                    Проявить
                </Button>
            </footer>
        </aside>
    );
};
