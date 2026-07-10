import React, { PropsWithChildren } from 'react';

interface SegmentsProps {
    name: string;
}

interface SegmentProps {
    onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
    isSelected?: boolean;
    disabled?: boolean;
}

export const Segments: React.FC<PropsWithChildren<SegmentsProps>> & {
    Segment: React.FC<PropsWithChildren<SegmentProps>>;
} = ({ children, name }) => {
    return (
        <div className="flex" role="radiogroup" aria-label={name}>
            {children}
        </div>
    );
};

Segments.Segment = ({ children, onClick, isSelected, disabled }) => {
    return (
        <button
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={onClick}
            className={`
                grow px-4 py-2
                text-sm border transition-colors
                focus:outline-none
                cursor-pointer
                ${isSelected && 'bg-stone-200 border-stone-200 hover:bg-stone-200 text-stone-800'}
                disabled:bg-stone-500 disabled:border-stone-500 disabled:text-stone-400 disabled:cursor-not-allowed
            `}
            disabled={disabled}
        >
            {children}
        </button>
    );
};
