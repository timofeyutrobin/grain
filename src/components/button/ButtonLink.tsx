import styles from '@/components/button/button.module.css';
import { PropsWithClassName } from '@/lib/common';
import classNames from 'classnames';
import Link, { LinkProps } from 'next/link';
import { PropsWithChildren } from 'react';

export const ButtonLink: React.FC<
    PropsWithClassName<PropsWithChildren<LinkProps>> & {
        secondary?: boolean;
        download?: boolean;
        small?: boolean;
    }
> = ({ className, secondary, small, ...props }) => {
    return (
        <Link
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
