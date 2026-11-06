import { WatchIntroButton } from '@/components/editor/WatchIntroButton';
import { PropsWithClassName } from '@/lib/common';
import classNames from 'classnames';
import Image from 'next/image';

export const Logo: React.FC<PropsWithClassName> = ({ className }) => {
    return (
        <div
            className={classNames(
                'flex items-center justify-center',
                className,
            )}
        >
            <div className="relative">
                <Image
                    preload
                    loading="eager"
                    src="/logo.webp"
                    alt="emulsion engine"
                    width={843}
                    height={93}
                    unoptimized
                />
                <i className="absolute -bottom-4 -right-3 p-1 bg-green-600/80 text-sm text-zinc-300 not-italic uppercase">
                    Beta
                </i>
            </div>
            <WatchIntroButton className="ml-4 shrink-0" />
        </div>
    );
};
