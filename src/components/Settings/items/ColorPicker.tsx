import { Color } from '@/lib/common';
import { colord } from 'colord';

interface ColorPickerProps {
    title: string;
    value: Color;
    defaultColor: Color;
    onChange: (color: Color) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
    title,
    value,
    defaultColor,
    onChange,
}) => {
    return (
        <div className="p-2 flex align-middle cursor-pointer hover:bg-zinc-600 transition-colors">
            <label htmlFor="red-color" className="cursor-pointer">
                {title}
            </label>
            <button
                title="Restore default"
                className="ml-auto mr-1 text-xs text-amber-300 underline cursor-pointer"
                onClick={() => onChange(defaultColor)}
            >
                &#9166;
            </button>
            <input
                id="red-color"
                type="color"
                value={colord(value).toHex()}
                onChange={(event) =>
                    onChange(colord(event.target.value).toHsv())
                }
                className="mr-0 cursor-pointer"
            />
        </div>
    );
};
