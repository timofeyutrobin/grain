interface RangeProps {
    min: number;
    max: number;
    step: number;
    value: number;
    onChange: (value: number) => void;
}

export const Range: React.FC<RangeProps> = ({
    min,
    max,
    step,
    value,
    onChange,
}) => {
    return (
        <input
            className="w-full"
            type="range"
            max={max}
            min={min}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
        />
    );
};
