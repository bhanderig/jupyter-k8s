/**
 * CircularProgress Component
 * 
 * A wrapper that renders a div with circular progress animation.
 * This maintains MUI-compatible API while using CSS animations.
 * 
 * Usage:
 * ```tsx
 * import { CircularProgress } from '@/components/ui/CircularProgress';
 * 
 * <CircularProgress />
 * <CircularProgress size={60} color="primary" />
 * ```
 */

import { forwardRef } from 'react';
import styles from './CircularProgress.module.css';

export interface CircularProgressProps {
  /**
   * The size of the component.
   * @default 40
   */
  size?: number | string;
  
  /**
   * The color of the component.
   * @default 'primary'
   */
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'success' | 'info' | 'inherit';
  
  /**
   * The thickness of the circle.
   * @default 3.6
   */
  thickness?: number;
  
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
 * CircularProgress component that renders a div with circular progress animation.
 */
export const CircularProgress = forwardRef<HTMLDivElement, CircularProgressProps>(
  (
    {
      size = 40,
      color = 'primary',
      thickness = 3.6,
      className = '',
      sx,
      ...props
    },
    ref
  ) => {
    const combinedClassName = `${styles.progress} ${className}`.trim();
    
    const sizeValue = typeof size === 'number' ? `${size}px` : size;
    const circleSize = typeof size === 'number' ? size : 40;
    const strokeWidth = thickness;
    const radius = (circleSize - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    return (
      <div
        ref={ref}
        className={combinedClassName}
        data-color={color}
        style={{
          width: sizeValue,
          height: sizeValue,
          ...sx,
        }}
        role="progressbar"
        aria-busy="true"
        {...props}
      >
        <svg
          className={styles.svg}
          viewBox={`0 0 ${circleSize} ${circleSize}`}
        >
          <circle
            className={styles.circle}
            cx={circleSize / 2}
            cy={circleSize / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={circumference * 0.25}
          />
        </svg>
      </div>
    );
  }
);

CircularProgress.displayName = 'CircularProgress';
