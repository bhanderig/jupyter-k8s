/**
 * Stack Component
 * 
 * A wrapper that renders a div with flexbox layout for stacking elements.
 * This maintains MUI-compatible API while using native HTML div element with flexbox CSS.
 * 
 * Usage:
 * ```tsx
 * import { Stack } from '@/components/ui/Stack';
 * 
 * <Stack direction="row" spacing={2} alignItems="center">
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 * </Stack>
 * ```
 */

import { forwardRef } from 'react';
import styles from './Stack.module.css';

export interface StackProps {
  /**
   * The content of the component.
   */
  children?: React.ReactNode;
  
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: React.CSSProperties;
  
  /**
   * Additional CSS class name.
   */
  className?: string;
  
  /**
   * Defines the flex-direction style property.
   * It is applied for all screen sizes.
   * @default 'column'
   */
  direction?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  
  /**
   * Defines the space between immediate children.
   * Can be a number (multiplied by 8px) or a string.
   * @default 0
   */
  spacing?: number | string;
  
  /**
   * Alias for spacing. Defines the space between immediate children.
   * Can be a number (multiplied by 8px) or a string.
   */
  gap?: number | string;
  
  /**
   * Defines the align-items style property.
   * @default 'stretch'
   */
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
  
  /**
   * Defines the justify-content style property.
   * @default 'flex-start'
   */
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  
  /**
   * If true, the CSS flexbox gap is used instead of applying margin to children.
   * @default true
   */
  useFlexGap?: boolean;
  
  /**
   * Add an element between each child.
   */
  divider?: React.ReactNode;
  
  /**
   * The component used for the root node.
   * @default 'div'
   */
  component?: React.ElementType;
  
  /**
   * onClick event handler.
   */
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

/**
 * Helper function to convert spacing values to CSS values.
 * Numbers are multiplied by 8px (MUI's spacing unit).
 * Strings are passed through as-is.
 */
const getSpacingValue = (value: number | string | undefined): string | undefined => {
  if (value === undefined) return undefined;
  if (typeof value === 'number') return `${value * 8}px`;
  return value;
};

/**
 * Stack component that renders a div with flexbox layout.
 */
export const Stack = forwardRef<HTMLDivElement, StackProps>(
  (
    {
      children,
      sx,
      className = '',
      direction = 'column',
      spacing = 0,
      gap,
      alignItems = 'stretch',
      justifyContent = 'flex-start',
      useFlexGap = true,
      divider,
      component,
      onClick,
      ...props
    },
    ref
  ) => {
    const Component = component || 'div';
    const combinedClassName = `${styles.stack} ${className}`.trim();
    
    // Use gap if provided, otherwise use spacing
    const effectiveSpacing = gap !== undefined ? gap : spacing;

    // Build inline styles from props
    const inlineStyles: React.CSSProperties = {
      ...sx,
      display: 'flex',
      flexDirection: direction,
      alignItems,
      justifyContent,
    };

    // Handle spacing
    if (effectiveSpacing !== 0) {
      if (useFlexGap) {
        // Use CSS gap property
        inlineStyles.gap = getSpacingValue(effectiveSpacing);
      } else {
        // Use margin on children (legacy approach)
        // This is handled by adding margin to children in the render
        // For simplicity, we'll use gap by default
        inlineStyles.gap = getSpacingValue(effectiveSpacing);
      }
    }

    // If divider is provided, we need to intersperse it between children
    let content = children;
    if (divider && children) {
      const childArray = Array.isArray(children) ? children : [children];
      const validChildren = childArray.filter(child => child != null);
      
      if (validChildren.length > 1) {
        content = validChildren.reduce((acc: React.ReactNode[], child, index) => {
          acc.push(child);
          if (index < validChildren.length - 1) {
            acc.push(
              <div key={`divider-${index}`} className={styles.divider}>
                {divider}
              </div>
            );
          }
          return acc;
        }, []);
      }
    }

    return (
      <Component
        ref={ref}
        className={combinedClassName}
        style={Object.keys(inlineStyles).length > 0 ? inlineStyles : undefined}
        onClick={onClick}
        {...props}
      >
        {content}
      </Component>
    );
  }
);

Stack.displayName = 'Stack';
