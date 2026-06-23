import { PropsWithClassName } from '@/lib/common';
import { PropsWithChildren } from 'react';

export const Card: React.FC<PropsWithChildren<PropsWithClassName>> = ({
    children,
    className,
}) => {
    return (
        <section
            className={`px-8 py-6 border border-zinc-300 bg-zinc-800/60 backdrop-blur-lg ${className ?? ''}`}
        >
            {children}
        </section>
    );
};
