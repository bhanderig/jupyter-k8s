/**
 * Button Component
 * 
 * A wrapper around BaseUI Button that maintains MUI-compatible API.
 * This allows for drop-in replacement of MUI Button with minimal code changes.
 * 
 * Usage:
 * ```tsx
 * import { Button } from '@/components/ui/Button';
 * 
 * <Button variant="contained" color="primary" startIcon={<Icon />}>
 *   Click me
 * </Button>
 * ```
 */

import { Button as BaseButton } from '@base-ui/react/button';
import { forwardRef } from 'react';
import styles from './Button.module.css';

export interface ButtonProps {
  /**
   * The variant to use.
   * @default 'text'
   */
  variant?: 'text' | 'outlined' | 'contained';
  
  /**
   * The color of the component.
   * @default 'primary'
   */
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'success' | 'info' | 'inherit';
  
  /**
   * The size of the component.
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';
  
  /**
   * Element placed before the children.
   */
  startIcon?: React.ReactNode;
  
  /**
   * Element placed after the children.
   */
  endIcon?: React.ReactNode;
  
  /**
   * If true, the button will take up the full width of its container.
   * @default false
   */
  fullWidth?: boolean;
  
  /**
   * If true, the button will be disabled.
   * @default false
   */
  disabled?: boolean;
  
  /**
   * The content of the button.
   */
  children: React.ReactNode;
  
  /**
   * Callback fired when the button is clicked.
   */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: React.CSSProperties;
  
  /**
   * Additional CSS class name.
   */
  className?: string;
  
  /**
   * The type of button.
   * @default 'button'
   */
  type?: 'button' | 'submit' | 'reset';
  
  /**
   * Used to reference the DOM element.
   */
  ref?: React.Ref<HTMLButtonElement>;
}

/**
 * Button component that wraps BaseUI Button with MUI-compatible API.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'text',
      color = 'primary',
      size = 'medium',
      startIcon,
      endIcon,
      fullWidth = false,
      disabled = false,
      onClick,
      children,
      sx,
      className = '',
      type = 'button',
      ...props
    },
    ref
  ) => {
    const combinedClassName = `${styles.button} ${className}`.trim();

    return (
      <BaseButton
        ref={ref}
        className={combinedClassName}
        data-variant={variant}
        data-color={color}
        data-size={size}
        data-fullwidth={fullWidth || undefined}
        disabled={disabled}
        onClick={onClick}
        style={sx}
        type={type}
        {...props}
      >
        {startIcon && <span className={styles.startIcon}>{startIcon}</span>}
        <span className={styles.label}>{children}</span>
        {endIcon && <span className={styles.endIcon}>{endIcon}</span>}
      </BaseButton>
    );
  }
);

Button.displayName = 'Button';
