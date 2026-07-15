import styles from '@/components/button/button.module.css';
import { PropsWithClassName } from '@/lib/common';
import classNames from 'classnames';
import { AnchorHTMLAttributes, PropsWithChildren } from 'react';

export const ButtonAnchor: React.FC<
    PropsWithClassName<
        PropsWithChildren<AnchorHTMLAttributes<HTMLAnchorElement>>
    > & {
        secondary?: boolean;
        small?: boolean;
    }
> = ({ className, secondary, small, ...props }) => {
    return (
        <a
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
