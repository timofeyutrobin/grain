import { PropsWithClassName } from '@/lib/common';
import Image from 'next/image';

export const LoadingSpinner: React.FC<PropsWithClassName> = ({ className }) => {
    return (
        <Image
            className={className}
            src="/loading.webp"
            alt="loading"
            width={300}
            height={300}
            loading="eager"
            preload
            unoptimized
        />
    );
};
