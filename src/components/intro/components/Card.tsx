import { PropsWithClassName } from '@/lib/common';
import classNames from 'classnames';
import { PropsWithChildren } from 'react';

export const Card: React.FC<PropsWithChildren<PropsWithClassName>> = ({
    children,
    className,
}) => {
    return (
        <section
            className={classNames(
                'px-8 py-6 bg-zinc-800 md:border md:border-zinc-300 md:bg-zinc-800/60 md:backdrop-blur-lg',
                className,
            )}
        >
            {children}
        </section>
    );
};
