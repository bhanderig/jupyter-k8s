/**
 * Paper Component
 * 
 * A wrapper that renders a div with paper styling and elevation support.
 * This maintains MUI-compatible API while using native HTML div element.
 * 
 * Usage:
 * ```tsx
 * import { Paper } from '@/components/ui/Paper';
 * 
 * <Paper elevation={3}>
 *   <p>Paper content goes here</p>
 * </Paper>
 * ```
 */

import { forwardRef } from 'react';
import styles from './Paper.module.css';

export interface PaperProps {
  /**
   * The content of the component.
   */
  children?: React.ReactNode;
  
  /**
   * The elevation (shadow depth) of the paper.
   * @default 1
   */
  elevation?: number;
  
  /**
   * Additional CSS class name.
   */
  className?: string;
  
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: React.CSSProperties;
  
  /**
   * If true, rounded corners are disabled.
   * @default false
   */
  square?: boolean;
  
  /**
   * The variant to use.
   * @default 'elevation'
   */
  variant?: 'elevation' | 'outlined';
  
  /**
   * onClick event handler.
   */
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  
  /**
   * onKeyDown event handler.
   */
  onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  
  /**
   * Tab index for keyboard navigation.
   */
  tabIndex?: number;
  
  /**
   * ARIA role.
   */
  role?: string;
  
  /**
   * ARIA pressed state.
   */
  'aria-pressed'?: boolean;
  
  /**
   * ARIA label.
   */
  'aria-label'?: string;
}

/**
 * Paper component that renders a div with paper styling.
 */
export const Paper = forwardRef<HTMLDivElement, PaperProps>(
  (
    {
      children,
      elevation = 1,
      className = '',
      sx,
      square = false,
      variant = 'elevation',
      onClick,
      onKeyDown,
      tabIndex,
      role,
      'aria-pressed': ariaPressed,
      'aria-label': ariaLabel,
      ...props
    },
    ref
  ) => {
    const combinedClassName = `${styles.paper} ${className}`.trim();

    return (
      <div
        ref={ref}
        className={combinedClassName}
        data-elevation={variant === 'elevation' ? elevation : undefined}
        data-variant={variant}
        data-square={square || undefined}
        style={sx}
        onClick={onClick}
        onKeyDown={onKeyDown}
        tabIndex={tabIndex}
        role={role}
        aria-pressed={ariaPressed}
        aria-label={ariaLabel}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Paper.displayName = 'Paper';
