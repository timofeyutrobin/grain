import { Button } from '@/components/button/Button';
import { Logo } from '@/components/editor/Logo';
import { Settings } from '@/components/editor/settings/Settings';
import { SettingsGroup } from '@/components/editor/settings/SettingsGroup';
import { SettingsParameters } from '@/components/editor/settings/useSettings';
import { PropsWithClassName } from '@/lib/common';
import { GrainRenderParameters } from '@/lib/rendering/grainRenderer/GrainRenderer';
import classNames from 'classnames';
import { ReactNode } from 'react';

interface ControlPanelProps {
    settings: SettingsParameters;
    onDevelop: (renderParameters: GrainRenderParameters) => void;
    onClose: () => void;
    fileInputLabel: ReactNode;
    downloadButton: ReactNode;
    disabled?: boolean;
}

export const ControlPanel: React.FC<PropsWithClassName<ControlPanelProps>> = ({
    settings,
    onDevelop,
    disabled,
    className,
    onClose,
    fileInputLabel,
    downloadButton,
}) => {
    const handleDevelopClick = () => {
        onDevelop(settings.renderParameters);
    };

    return (
        <aside
            className={classNames(
                'flex flex-col items-center bg-zinc-800',
                className,
            )}
        >
            <Logo className="hidden md:flex w-full px-4 pt-4" />
            <section className="w-full max-w-96 my-4 pl-4 pr-9 md:pr-4 overflow-y-scroll space-y-4">
                <SettingsGroup className="hidden md:block" legend="Файл">
                    {fileInputLabel}
                </SettingsGroup>
                <Settings settings={settings} />
            </section>
            <footer className="max-w-96 w-full mt-auto p-4">
                <div className="hidden md:block w-full mb-4">
                    {downloadButton}
                </div>
                <div className="flex gap-4">
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
                </div>
            </footer>
        </aside>
    );
};
