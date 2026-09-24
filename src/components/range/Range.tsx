import styles from '@/components/range/range.module.css';

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
    const progressWidthInPercent = ((value - min) / (max - min)) * 100;
    return (
        <div className="relative">
            <input
                className={styles.range}
                type="range"
                max={max}
                min={min}
                step={step}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
            />
            <div
                className="absolute top-0 left-0 h-1 w-full bg-stone-200"
                style={{ width: `${progressWidthInPercent}%` }}
            ></div>
        </div>
    );
};
