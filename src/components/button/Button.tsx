import styles from '@/components/button/button.module.css';
import classNames from 'classnames';
import { ButtonHTMLAttributes } from 'react';

export const Button: React.FC<
    ButtonHTMLAttributes<HTMLButtonElement> & {
        secondary?: boolean;
        small?: boolean;
    }
> = ({ secondary, className, small, ...props }) => {
    return (
        <button
            {...props}
            className={classNames(
                styles.button,
                small && styles.buttonSmall,
                secondary && styles.buttonSecondary,
                className,
            )}
        />
    );
};
