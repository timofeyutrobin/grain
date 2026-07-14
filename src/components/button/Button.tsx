import styles from '@/components/button/button.module.css';
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
            className={`
                ${className ?? ''}
                ${styles.button}
                ${small ? styles.buttonSmall : ''}
                ${secondary ? styles.buttonSecondary : ''}
            `}
        />
    );
};
