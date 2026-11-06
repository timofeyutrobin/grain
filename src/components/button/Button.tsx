import styles from '@/components/button/button.module.css';
import classNames from 'classnames';
import { ButtonHTMLAttributes } from 'react';

export const Button: React.FC<
    ButtonHTMLAttributes<HTMLButtonElement> & {
        secondary?: boolean;
        small?: boolean;
        smaller?: boolean;
        tiny?: boolean;
    }
> = ({ secondary, className, small, smaller, tiny, ...props }) => {
    return (
        <button
            {...props}
            className={classNames(
                styles.button,
                small && styles.buttonSmall,
                smaller && styles.buttonSmaller,
                tiny && styles.buttonTiny,
                secondary && styles.buttonSecondary,
                className,
            )}
        />
    );
};
