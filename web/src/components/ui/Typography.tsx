/**
 * Typography Component
 * 
 * A wrapper that renders semantic HTML elements with typography styles from CSS variables.
 * This maintains MUI-compatible API while using native HTML elements instead of BaseUI.
 * 
 * Usage:
 * ```tsx
 * import { Typography } from '@/components/ui/Typography';
 * 
 * <Typography variant="h1">Page Title</Typography>
 * <Typography variant="body1">Body text</Typography>
 * <Typography variant="caption" color="textSecondary">Caption text</Typography>
 * ```
 */

import { forwardRef } from 'react';
import styles from './Typography.module.css';

export interface TypographyProps {
  /**
   * The variant to use.
   * @default 'body1'
   */
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body1' | 'body2' | 'caption' | 'subtitle1' | 'subtitle2';
  
  /**
   * The color of the text.
   * @default 'textPrimary'
   */
  color?: 'textPrimary' | 'textSecondary' | 'primary' | 'secondary' | 'error' | 'warning' | 'success' | 'info' | 'inherit';
  
  /**
   * The content of the component.
   */
  children: React.ReactNode;
  
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: React.CSSProperties;
  
  /**
   * Additional CSS class name.
   */
  className?: string;
  
  /**
   * Controls the display type.
   */
  display?: 'initial' | 'block' | 'inline';
  
  /**
   * If true, the text will not wrap, but instead will truncate with a text overflow ellipsis.
   */
  noWrap?: boolean;
  
  /**
   * Align the text.
   */
  align?: 'left' | 'center' | 'right' | 'justify' | 'inherit';
  
  /**
   * Set the text-transform style.
   */
  gutterBottom?: boolean;
  
  /**
   * The component used for the root node. Either a string to use a HTML element or a component.
   */
  component?: React.ElementType;
}

/**
 * Typography component that renders semantic HTML elements with typography styles.
 */
export const Typography = forwardRef<HTMLElement, TypographyProps>(
  (
    {
      variant = 'body1',
      color = 'textPrimary',
      children,
      sx,
      className = '',
      display,
      noWrap = false,
      align,
      gutterBottom = false,
      component,
      ...props
    },
    ref
  ) => {
    // Determine the HTML element to render based on variant
    const getDefaultComponent = (): React.ElementType => {
      switch (variant) {
        case 'h1':
          return 'h1';
        case 'h2':
          return 'h2';
        case 'h3':
          return 'h3';
        case 'h4':
          return 'h4';
        case 'h5':
          return 'h5';
        case 'h6':
          return 'h6';
        case 'body1':
        case 'body2':
        case 'subtitle1':
        case 'subtitle2':
          return 'p';
        case 'caption':
          return 'span';
        default:
          return 'p';
      }
    };

    const Component = component || getDefaultComponent();
    const combinedClassName = `${styles.typography} ${className}`.trim();

    // Combine inline styles
    const combinedStyle: React.CSSProperties = {
      ...sx,
      ...(display && { display }),
      ...(align && { textAlign: align }),
    };

    return (
      <Component
        ref={ref}
        className={combinedClassName}
        data-variant={variant}
        data-color={color}
        data-nowrap={noWrap || undefined}
        data-gutter-bottom={gutterBottom || undefined}
        style={Object.keys(combinedStyle).length > 0 ? combinedStyle : undefined}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Typography.displayName = 'Typography';
