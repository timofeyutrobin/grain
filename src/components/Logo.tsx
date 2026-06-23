import { PropsWithClassName } from '@/lib/common';
import Image from 'next/image';

export const Logo: React.FC<PropsWithClassName> = ({ className }) => {
    return (
        <Image
            className={className}
            loading="eager"
            src="/logo.webp"
            alt="emulsion engine"
            width={843}
            height={93}
            unoptimized
        />
    );
};
