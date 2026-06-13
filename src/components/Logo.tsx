import Image from 'next/image';

export const Logo: React.FC<{ className?: string }> = ({ className }) => {
    return (
        <Image
            className={className}
            loading="eager"
            src="/logo.webp"
            alt="logo"
            width={843}
            height={93}
            unoptimized
        />
    );
};
