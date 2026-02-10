import { PropsWithChildren, ReactNode, useState } from 'react';

interface SettingsGroupProps {
    legend: string;
    ariaLabel?: string;
    hint?: ReactNode;
}

export const SettingsGroup: React.FC<PropsWithChildren<SettingsGroupProps>> = ({
    children,
    ariaLabel,
    legend,
    hint,
}) => {
    const [isShowed, setIsShowed] = useState(false);

    return (
        <fieldset aria-label={ariaLabel} className="mt-4 p-4 border">
            <legend className="p-1">
                {legend}
                {hint && (
                    <button
                        className="inline align-middle ml-2 text-xs text-amber-300 underline cursor-pointer"
                        onClick={() => setIsShowed((isShowed) => !isShowed)}
                    >
                        {isShowed ? 'Close' : 'Learn more'}
                    </button>
                )}
            </legend>
            {isShowed && <div className="text-xs pb-2 px-2">{hint}</div>}
            {children}
        </fieldset>
    );
};
