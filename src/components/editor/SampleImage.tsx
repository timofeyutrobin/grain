import Image from 'next/image';
import { ReactEventHandler, Ref } from 'react';

interface SampleImageProps {
    width: number;
    height: number;
    onLoad?: ReactEventHandler<HTMLImageElement>;
    ref?: Ref<HTMLImageElement>;
}

export const SampleImage: React.FC<SampleImageProps> = ({
    width,
    height,
    onLoad,
    ref,
}) => {
    return (
        <Image
            ref={ref}
            preload
            className="hidden"
            src="/images/sunflowers.jpeg"
            alt="sunflowers"
            width={width}
            height={height}
            onLoad={onLoad}
        />
    );
};
