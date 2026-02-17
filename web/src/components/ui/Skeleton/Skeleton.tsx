/**
 * Skeleton Component
 * 
 * A wrapper that renders a div with skeleton loading animation.
 * This maintains MUI-compatible API while using CSS animations.
 * 
 * Usage:
 * ```tsx
 * import { Skeleton } from '@/components/ui/Skeleton';
 * 
 * <Skeleton variant="text" width={200} />
 * <Skeleton variant="circular" width={40} height={40} />
 * <Skeleton variant="rectangular" width="100%" height={200} />
 * ```
 */

import { forwardRef } from 'react';
import styles from './Skeleton.module.css';

export interface SkeletonProps {
  /**
   * The type of content that will be rendered.
   * @default 'text'
   */
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  
  /**
   * Width of the skeleton.
   * Useful when the skeleton is inside an inline element with no width of its own.
   */
  width?: number | string;
  
  /**
   * Height of the skeleton.
   * Useful when you don't want to adapt the skeleton to a text element but for instance a card.
   */
  height?: number | string;
  
  /**
   * The animation effect.
   * @default 'pulse'
   */
  animation?: 'pulse' | 'wave' | false;
  
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
 * Skeleton component that renders a div with skeleton loading animation.
 */
export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      variant = 'text',
      width,
      height,
      animation = 'pulse',
      className = '',
      sx,
      ...props
    },
    ref
  ) => {
    const combinedClassName = `${styles.skeleton} ${className}`.trim();

    const inlineStyles: React.CSSProperties = {
      ...sx,
      ...(width !== undefined && { width: typeof width === 'number' ? `${width}px` : width }),
      ...(height !== undefined && { height: typeof height === 'number' ? `${height}px` : height }),
    };

    return (
      <div
        ref={ref}
        className={combinedClassName}
        data-variant={variant}
        data-animation={animation || undefined}
        style={Object.keys(inlineStyles).length > 0 ? inlineStyles : undefined}
        aria-busy="true"
        aria-live="polite"
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';
