import styles from '@/components/button/button.module.css';
import classNames from 'classnames';
import { LabelHTMLAttributes } from 'react';

export const ButtonLabel: React.FC<
    LabelHTMLAttributes<HTMLLabelElement> & {
        secondary?: boolean;
        small?: boolean;
    }
> = ({ secondary, className, small, ...props }) => {
    return (
        <label
            {...props}
            className={classNames(
                'block text-center',
                styles.button,
                small && styles.buttonSmall,
                secondary && styles.buttonSecondary,
                className,
            )}
        />
    );
};
