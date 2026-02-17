/**
 * Divider Component
 * 
 * A wrapper that renders an hr element with divider styling.
 * This maintains MUI-compatible API while using native HTML hr element.
 * 
 * Usage:
 * ```tsx
 * import { Divider } from '@/components/ui/Divider';
 * 
 * <Divider />
 * <Divider orientation="vertical" />
 * ```
 */

import { forwardRef } from 'react';
import styles from './Divider.module.css';

export interface DividerProps {
  /**
   * The orientation of the divider.
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical';
  
  /**
   * Additional CSS class name.
   */
  className?: string;
  
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: React.CSSProperties;
}

/**
 * Divider component that renders an hr element with divider styling.
 */
export const Divider = forwardRef<HTMLHRElement, DividerProps>(
  (
    {
      orientation = 'horizontal',
      className = '',
      sx,
      ...props
    },
    ref
  ) => {
    const combinedClassName = `${styles.divider} ${className}`.trim();

    return (
      <hr
        ref={ref}
        className={combinedClassName}
        data-orientation={orientation}
        style={sx}
        {...props}
      />
    );
  }
);

Divider.displayName = 'Divider';
