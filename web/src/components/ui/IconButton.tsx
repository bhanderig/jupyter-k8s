import { Button as BaseButton } from '@base-ui/react/button';
import { forwardRef } from 'react';
import styles from './IconButton.module.css';

export interface IconButtonProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'success' | 'default';
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  sx?: React.CSSProperties;
  className?: string;
  'aria-label'?: string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ size = 'medium', color = 'default', disabled, onClick, children, sx, className, ...props }, ref) => {
    return (
      <BaseButton
        ref={ref}
        className={`${styles.iconButton} ${className || ''}`}
        data-size={size}
        data-color={color}
        disabled={disabled}
        onClick={onClick}
        style={sx}
        {...props}
      >
        {children}
      </BaseButton>
    );
  }
);

IconButton.displayName = 'IconButton';
