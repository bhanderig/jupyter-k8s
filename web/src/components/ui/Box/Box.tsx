/**
 * Box Component
 * 
 * A wrapper that renders a div with sx prop support and common layout props.
 * This maintains MUI-compatible API while using native HTML div element.
 * 
 * Usage:
 * ```tsx
 * import { Box } from '@/components/ui/Box';
 * 
 * <Box display="flex" flexDirection="column" gap={2} padding={3}>
 *   <div>Content 1</div>
 *   <div>Content 2</div>
 * </Box>
 * ```
 */

import { forwardRef } from 'react';
import styles from './Box.module.css';

export interface BoxProps {
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
   * The CSS display property.
   */
  display?: 'block' | 'inline' | 'inline-block' | 'flex' | 'inline-flex' | 'grid' | 'inline-grid' | 'none';
  
  /**
   * The CSS flex-direction property.
   */
  flexDirection?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  
  /**
   * The CSS align-items property.
   */
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
  
  /**
   * The CSS justify-content property.
   */
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  
  /**
   * The CSS gap property (spacing between children).
   * Can be a number (multiplied by 8px) or a string.
   */
  gap?: number | string;
  
  /**
   * The CSS padding property.
   * Can be a number (multiplied by 8px) or a string.
   */
  padding?: number | string;
  
  /**
   * The CSS padding-top property.
   * Can be a number (multiplied by 8px) or a string.
   */
  paddingTop?: number | string;
  
  /**
   * The CSS padding-right property.
   * Can be a number (multiplied by 8px) or a string.
   */
  paddingRight?: number | string;
  
  /**
   * The CSS padding-bottom property.
   * Can be a number (multiplied by 8px) or a string.
   */
  paddingBottom?: number | string;
  
  /**
   * The CSS padding-left property.
   * Can be a number (multiplied by 8px) or a string.
   */
  paddingLeft?: number | string;
  
  /**
   * The CSS padding-inline property (horizontal padding).
   * Can be a number (multiplied by 8px) or a string.
   */
  paddingX?: number | string;
  
  /**
   * The CSS padding-block property (vertical padding).
   * Can be a number (multiplied by 8px) or a string.
   */
  paddingY?: number | string;
  
  /**
   * The CSS margin property.
   * Can be a number (multiplied by 8px) or a string.
   */
  margin?: number | string;
  
  /**
   * The CSS margin-top property.
   * Can be a number (multiplied by 8px) or a string.
   */
  marginTop?: number | string;
  
  /**
   * The CSS margin-right property.
   * Can be a number (multiplied by 8px) or a string.
   */
  marginRight?: number | string;
  
  /**
   * The CSS margin-bottom property.
   * Can be a number (multiplied by 8px) or a string.
   */
  marginBottom?: number | string;
  
  /**
   * The CSS margin-left property.
   * Can be a number (multiplied by 8px) or a string.
   */
  marginLeft?: number | string;
  
  /**
   * The CSS margin-inline property (horizontal margin).
   * Can be a number (multiplied by 8px) or a string.
   */
  marginX?: number | string;
  
  /**
   * The CSS margin-block property (vertical margin).
   * Can be a number (multiplied by 8px) or a string.
   */
  marginY?: number | string;
  
  /**
   * The CSS width property.
   */
  width?: number | string;
  
  /**
   * The CSS height property.
   */
  height?: number | string;
  
  /**
   * The CSS min-width property.
   */
  minWidth?: number | string;
  
  /**
   * The CSS min-height property.
   */
  minHeight?: number | string;
  
  /**
   * The CSS max-width property.
   */
  maxWidth?: number | string;
  
  /**
   * The CSS max-height property.
   */
  maxHeight?: number | string;
  
  /**
   * The CSS overflow property.
   */
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
  
  /**
   * The CSS overflow-x property.
   */
  overflowX?: 'visible' | 'hidden' | 'scroll' | 'auto';
  
  /**
   * The CSS overflow-y property.
   */
  overflowY?: 'visible' | 'hidden' | 'scroll' | 'auto';
  
  /**
   * The CSS position property.
   */
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  
  /**
   * The CSS top property.
   */
  top?: number | string;
  
  /**
   * The CSS right property.
   */
  right?: number | string;
  
  /**
   * The CSS bottom property.
   */
  bottom?: number | string;
  
  /**
   * The CSS left property.
   */
  left?: number | string;
  
  /**
   * The CSS z-index property.
   */
  zIndex?: number;
  
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
 * Box component that renders a div with layout props and sx support.
 */
export const Box = forwardRef<HTMLDivElement, BoxProps>(
  (
    {
      children,
      sx,
      className = '',
      display,
      flexDirection,
      alignItems,
      justifyContent,
      gap,
      padding,
      paddingTop,
      paddingRight,
      paddingBottom,
      paddingLeft,
      paddingX,
      paddingY,
      margin,
      marginTop,
      marginRight,
      marginBottom,
      marginLeft,
      marginX,
      marginY,
      width,
      height,
      minWidth,
      minHeight,
      maxWidth,
      maxHeight,
      overflow,
      overflowX,
      overflowY,
      position,
      top,
      right,
      bottom,
      left,
      zIndex,
      component,
      onClick,
      ...props
    },
    ref
  ) => {
    const Component = component || 'div';
    const combinedClassName = `${styles.box} ${className}`.trim();

    // Build inline styles from props
    const inlineStyles: React.CSSProperties = {
      ...sx,
      ...(display && { display }),
      ...(flexDirection && { flexDirection }),
      ...(alignItems && { alignItems }),
      ...(justifyContent && { justifyContent }),
      ...(gap !== undefined && { gap: getSpacingValue(gap) }),
      ...(width !== undefined && { width: typeof width === 'number' ? `${width}px` : width }),
      ...(height !== undefined && { height: typeof height === 'number' ? `${height}px` : height }),
      ...(minWidth !== undefined && { minWidth: typeof minWidth === 'number' ? `${minWidth}px` : minWidth }),
      ...(minHeight !== undefined && { minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight }),
      ...(maxWidth !== undefined && { maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth }),
      ...(maxHeight !== undefined && { maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight }),
      ...(overflow && { overflow }),
      ...(overflowX && { overflowX }),
      ...(overflowY && { overflowY }),
      ...(position && { position }),
      ...(top !== undefined && { top: typeof top === 'number' ? `${top}px` : top }),
      ...(right !== undefined && { right: typeof right === 'number' ? `${right}px` : right }),
      ...(bottom !== undefined && { bottom: typeof bottom === 'number' ? `${bottom}px` : bottom }),
      ...(left !== undefined && { left: typeof left === 'number' ? `${left}px` : left }),
      ...(zIndex !== undefined && { zIndex }),
    };

    // Handle padding props
    if (padding !== undefined) {
      inlineStyles.padding = getSpacingValue(padding);
    }
    if (paddingTop !== undefined) {
      inlineStyles.paddingTop = getSpacingValue(paddingTop);
    }
    if (paddingRight !== undefined) {
      inlineStyles.paddingRight = getSpacingValue(paddingRight);
    }
    if (paddingBottom !== undefined) {
      inlineStyles.paddingBottom = getSpacingValue(paddingBottom);
    }
    if (paddingLeft !== undefined) {
      inlineStyles.paddingLeft = getSpacingValue(paddingLeft);
    }
    if (paddingX !== undefined) {
      const value = getSpacingValue(paddingX);
      inlineStyles.paddingLeft = value;
      inlineStyles.paddingRight = value;
    }
    if (paddingY !== undefined) {
      const value = getSpacingValue(paddingY);
      inlineStyles.paddingTop = value;
      inlineStyles.paddingBottom = value;
    }

    // Handle margin props
    if (margin !== undefined) {
      inlineStyles.margin = getSpacingValue(margin);
    }
    if (marginTop !== undefined) {
      inlineStyles.marginTop = getSpacingValue(marginTop);
    }
    if (marginRight !== undefined) {
      inlineStyles.marginRight = getSpacingValue(marginRight);
    }
    if (marginBottom !== undefined) {
      inlineStyles.marginBottom = getSpacingValue(marginBottom);
    }
    if (marginLeft !== undefined) {
      inlineStyles.marginLeft = getSpacingValue(marginLeft);
    }
    if (marginX !== undefined) {
      const value = getSpacingValue(marginX);
      inlineStyles.marginLeft = value;
      inlineStyles.marginRight = value;
    }
    if (marginY !== undefined) {
      const value = getSpacingValue(marginY);
      inlineStyles.marginTop = value;
      inlineStyles.marginBottom = value;
    }

    return (
      <Component
        ref={ref}
        className={combinedClassName}
        style={Object.keys(inlineStyles).length > 0 ? inlineStyles : undefined}
        onClick={onClick}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Box.displayName = 'Box';
