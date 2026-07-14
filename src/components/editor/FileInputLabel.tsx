import { ButtonLabel } from '@/components/button/ButtonLabel';
import { PropsWithClassName } from '@/lib/common';
import { PropsWithChildren } from 'react';

interface FileInputLabelProps {
    htmlFor: string;
}

export const FileInputLabel: React.FC<
    PropsWithChildren<PropsWithClassName<FileInputLabelProps>>
> = ({ htmlFor, className, children }) => {
    return (
        <ButtonLabel className={className} small htmlFor={htmlFor}>
            {children}
        </ButtonLabel>
    );
};
