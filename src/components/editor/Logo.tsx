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
            <div>
                <Image
                    loading="eager"
                    src="/logo.webp"
                    alt="emulsion engine"
                    width={843}
                    height={93}
                    unoptimized
                />
            </div>
            <WatchIntroButton className="ml-4 shrink-0" />
        </div>
    );
};
