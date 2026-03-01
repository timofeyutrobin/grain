import React, { PropsWithChildren } from 'react';

interface SegmentsProps {
    name: string;
}

interface SegmentProps {
    onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
    isSelected?: boolean;
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

Segments.Segment = ({ children, onClick, isSelected }) => {
    return (
        <button
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={onClick}
            className={`grow px-4 py-2 text-sm border transition-colors focus:outline-none cursor-pointer ${
                isSelected &&
                'bg-amber-300  border-amber-300 hover:bg-amber-300 text-zinc-800'
            }`}
        >
            {children}
        </button>
    );
};
