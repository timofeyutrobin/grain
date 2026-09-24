import classNames from 'classnames';
import { PropsWithChildren, ReactNode, useState } from 'react';

interface SettingsGroupProps {
    legend: string;
    hint?: ReactNode;
    className?: string;
}

export const SettingsGroup: React.FC<PropsWithChildren<SettingsGroupProps>> = ({
    className,
    children,
    legend,
    hint,
}) => {
    const [isShowed, setIsShowed] = useState(false);

    return (
        <fieldset
            aria-label={legend}
            className={classNames(
                'p-4 pb-6 border border-stone-200',
                className,
            )}
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
            {isShowed && (
                <article className="text-xs p-3 mb-4 *:not-first:mt-2 bg-zinc-900">
                    {hint}
                </article>
            )}
            {children}
        </fieldset>
    );
};
