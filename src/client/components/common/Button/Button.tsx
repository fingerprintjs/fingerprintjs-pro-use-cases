import React, { memo } from 'react';
import styles from './Button.module.scss';
import classNames from 'classnames';
import Link from 'next/link';

export const isLocalLink = (link: string) => /^\/(?!\/)/.test(link);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'black' | 'white' | 'dark' | 'ghost' | 'green' | 'danger';
  outlined?: boolean;
  size?: 'large' | 'medium' | 'small';
  href?: string;
  children?: React.ReactNode;
  label?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  download?: boolean;
  openNewTab?: boolean;
  disabled?: boolean;
  buttonId?: string;
}

const Button = memo(function Button({
  variant = 'primary',
  outlined = false,
  size = 'large',
  href,
  className = '',
  children,
  type,
  label = '',
  onClick,
  download,
  openNewTab,
  disabled,
  buttonId,
  title,
  ...props
}: ButtonProps) {
  const classes = classNames(
    styles.button,
    { [styles.primary]: variant === 'primary' && !outlined },
    { [styles.primaryOutlined]: variant === 'primary' && outlined },
    { [styles.black]: variant === 'black' && !outlined },
    { [styles.blackOutlined]: variant === 'black' && outlined },
    { [styles.white]: variant === 'white' && !outlined },
    { [styles.whiteOutlined]: variant === 'white' && outlined },
    { [styles.dark]: variant === 'dark' && !outlined },
    { [styles.darkOutlined]: variant === 'dark' && outlined },
    { [styles.ghost]: variant === 'ghost' && !outlined },
    { [styles.green]: variant === 'green' && !outlined },
    { [styles.danger]: variant === 'danger' && !outlined },
    { [styles.small]: size === 'small' },
    { [styles.medium]: size === 'medium' },
    { [styles.large]: size === 'large' },
    { [styles.disabled]: disabled },
    className,
  );
  const newTabProps = openNewTab && { target: '_blank', rel: 'noreferrer' };

  return href ? (
    isLocalLink(href) ? (
      <Link
        id={buttonId}
        href={href}
        className={classes}
        onClick={onClick}
        aria-label={label}
        download={download}
        title={title}
        {...newTabProps}
      >
        <span>{children}</span>
      </Link>
    ) : (
      <a
        id={buttonId}
        href={href}
        className={classes}
        onClick={onClick}
        aria-label={label}
        download={download}
        title={title}
        {...newTabProps}
      >
        <span>{children}</span>
      </a>
    )
  ) : (
    <button id={buttonId} type={type} className={classes} onClick={onClick} aria-label={label} title={title} {...props}>
      <span>{children}</span>
    </button>
  );
});

export default Button;
