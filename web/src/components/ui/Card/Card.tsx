/**
 * Card Component
 * 
 * A wrapper that renders a div with card styling.
 * This maintains MUI-compatible API while using native HTML div element.
 * 
 * Usage:
 * ```tsx
 * import { Card, CardContent } from '@/components/ui/Card';
 * 
 * <Card elevation={2}>
 *   <CardContent>
 *     <h3>Card Title</h3>
 *     <p>Card content goes here</p>
 *   </CardContent>
 * </Card>
 * ```
 */

import { forwardRef } from 'react';
import styles from './Card.module.css';

export interface CardProps {
  /**
   * The content of the component.
   */
  children?: React.ReactNode;
  
  /**
   * The elevation (shadow depth) of the card.
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
   * onClick event handler.
   */
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  
  /**
   * ARIA label for accessibility.
   */
  'aria-label'?: string;
}

/**
 * Card component that renders a div with card styling.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      elevation = 1,
      className = '',
      sx,
      onClick,
      ...props
    },
    ref
  ) => {
    const combinedClassName = `${styles.card} ${className}`.trim();

    return (
      <div
        ref={ref}
        className={combinedClassName}
        data-elevation={elevation}
        style={sx}
        onClick={onClick}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export interface CardContentProps {
  /**
   * The content of the component.
   */
  children?: React.ReactNode;
  
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
 * CardContent component that renders a div with card content styling.
 */
export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  (
    {
      children,
      className = '',
      sx,
      ...props
    },
    ref
  ) => {
    const combinedClassName = `${styles.cardContent} ${className}`.trim();

    return (
      <div
        ref={ref}
        className={combinedClassName}
        style={sx}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardContent.displayName = 'CardContent';
