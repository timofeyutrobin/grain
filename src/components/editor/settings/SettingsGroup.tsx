import { PropsWithChildren, ReactNode, useState } from 'react';

interface SettingsGroupProps {
    legend: string;
    ariaLabel?: string;
    hint?: ReactNode;
    className?: string;
}

export const SettingsGroup: React.FC<PropsWithChildren<SettingsGroupProps>> = ({
    className,
    children,
    ariaLabel,
    legend,
    hint,
}) => {
    const [isShowed, setIsShowed] = useState(false);

    return (
        <fieldset
            aria-label={ariaLabel}
            className={`p-4 border border-stone-200 ${className ?? ''}`}
        >
            <legend className="p-1">
                {legend}
                {hint && (
                    <button
                        className="inline align-middle ml-2 text-xs text-stone-200 underline cursor-pointer"
                        onClick={() => setIsShowed((isShowed) => !isShowed)}
                    >
                        {isShowed ? 'Скрыть' : 'Подробнее'}
                    </button>
                )}
            </legend>
            {isShowed && <div className="text-xs pb-2 px-2">{hint}</div>}
            {children}
        </fieldset>
    );
};
