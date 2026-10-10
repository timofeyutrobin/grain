import { PropsWithChildren } from 'react';

interface ToastProps {
    offset: number;
}

export const Toast: React.FC<PropsWithChildren<ToastProps>> = ({
    children,
    offset,
}) => {
    return (
        <div
            className="
                fixed inset-4 w-full max-w-100 mx-auto min-h-[50px] h-fit
                flex items-center justify-center
                px-4
                bg-zinc-800
                shadow-zinc-950/50 shadow-lg
                transition-all duration-200 scale-100 opacity-100 starting:opacity-0 starting:scale-50
                z-1000
            "
            style={{ transform: `translateY(${66 * offset}px)` }}
        >
            <i className="not-italic text-sm">{children}</i>
        </div>
    );
};
