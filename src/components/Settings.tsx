import React from 'react';

interface SettingsProps {
    mode: 'grayscale' | 'color';
    onModeChange: (mode: 'grayscale' | 'color') => void;
}

export const Settings: React.FC<SettingsProps> = ({ mode, onModeChange }) => {
    const select = (m: 'grayscale' | 'color') => {
        onModeChange(m);
    };

    return (
        <div className="flex" role="radiogroup" aria-label="Color mode">
            <button
                type="button"
                role="radio"
                aria-checked={mode === 'grayscale'}
                onClick={() => select('grayscale')}
                className={`grow px-4 py-2 text-sm border transition-colors focus:outline-none cursor-pointer ${
                    mode === 'grayscale' &&
                    'bg-amber-300  border-amber-300 hover:bg-amber-300 text-gray-800'
                }`}
            >
                Grayscale
            </button>
            <button
                type="button"
                role="radio"
                aria-checked={mode === 'color'}
                onClick={() => select('color')}
                className={`grow px-4 py-2 text-sm border transition-colors focus:outline-none cursor-pointer ${
                    mode === 'color' &&
                    'bg-amber-300  border-amber-300 hover:bg-amber-300 text-gray-800'
                }`}
            >
                Color
            </button>
        </div>
    );
};
