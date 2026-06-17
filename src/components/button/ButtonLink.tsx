import { PropsWithClassName } from '@/lib/common';
import Link, { LinkProps } from 'next/link';
import { PropsWithChildren } from 'react';

export const ButtonLink: React.FC<
    PropsWithClassName<PropsWithChildren<LinkProps>> & {
        secondary?: boolean;
        download?: boolean;
        small?: boolean;
    }
> = ({ className, secondary, small, ...props }) => {
    return (
        <Link
            {...props}
            className={`
                py-2 px-4
                ${small ? 'text-md' : 'text-xl'}
                cursor-pointer
                border border-stone-200
                hover:bg-stone-300 hover:border-stone-300
                disabled:bg-stone-500 disabled:border-stone-500 disabled:text-stone-400 disabled:cursor-not-allowed
                ${secondary ? 'bg-stone-800 text-stone-50 hover:bg-stone-700' : 'text-stone-950 bg-stone-200'}
                transition-colors
                ${className ?? ''}`}
        />
    );
};
