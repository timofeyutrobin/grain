import styles from '@/components/range/range.module.css';
import { PropsWithClassName } from '@/lib/common';

interface RangeProps {
    min: number;
    max: number;
    step: number;
    value: number;
    id?: string;
    label?: string;
    onChange: (value: number) => void;
}

export const Range: React.FC<PropsWithClassName<RangeProps>> = ({
    id,
    label,
    min,
    max,
    step,
    value,
    onChange,
    className,
}) => {
    const progressWidthInPercent = ((value - min) / (max - min)) * 100;
    return (
        <div className={className}>
            <label htmlFor={id} className="block mb-2 text-sm text-zinc-300">
                {label}
            </label>
            <div className="relative h-1">
                <input
                    id={id}
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
        </div>
    );
};
