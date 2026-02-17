/**
 * Grid Component
 * 
 * A wrapper that renders a div with CSS Grid layout.
 * This maintains MUI-compatible API while using CSS Grid.
 */

import { forwardRef } from 'react';
import styles from './Grid.module.css';

export interface GridProps {
  children?: React.ReactNode;
  container?: boolean;
  size?: { xs?: number; sm?: number; md?: number; lg?: number; xl?: number };
  spacing?: number;
  className?: string;
  sx?: React.CSSProperties;
}

export const Grid = forwardRef<HTMLDivElement, GridProps>(
  ({ children, container, size, spacing = 0, className = '', sx, ...props }, ref) => {
    const combinedClassName = `${styles.grid} ${className}`.trim();

    if (container) {
      return (
        <div
          ref={ref}
          className={combinedClassName}
          data-container
          style={{
            gap: `${spacing * 8}px`,
            ...sx,
          }}
          {...props}
        >
          {children}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={combinedClassName}
        data-xs={size?.xs}
        data-sm={size?.sm}
        data-md={size?.md}
        data-lg={size?.lg}
        data-xl={size?.xl}
        style={sx}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Grid.displayName = 'Grid';
