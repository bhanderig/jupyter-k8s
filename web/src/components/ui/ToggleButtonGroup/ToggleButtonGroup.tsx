/**
 * ToggleButtonGroup Component
 * 
 * A wrapper around BaseUI ToggleGroup that maintains MUI-compatible API.
 * This allows for drop-in replacement of MUI ToggleButtonGroup with minimal code changes.
 * 
 * Usage:
 * ```tsx
 * import { ToggleButtonGroup, ToggleButton } from '@/components/ui/ToggleButtonGroup';
 * 
 * <ToggleButtonGroup
 *   value={accessType}
 *   exclusive
 *   onChange={(_, v) => v && setAccessType(v)}
 *   size="small"
 * >
 *   <ToggleButton value="Public">Public</ToggleButton>
 *   <ToggleButton value="OwnerOnly">Private</ToggleButton>
 * </ToggleButtonGroup>
 * ```
 */

import { ToggleGroup } from '@base-ui/react/toggle-group';
import { Toggle } from '@base-ui/react/toggle';
import { forwardRef, Children, cloneElement, isValidElement } from 'react';
import styles from './ToggleButtonGroup.module.css';

export interface ToggleButtonGroupProps {
  /**
   * The value of the selected button(s).
   * For exclusive mode, this should be a single value.
   * For non-exclusive mode, this should be an array of values.
   */
  value?: string | string[];
  
  /**
   * Callback fired when the value changes.
   * @param event The event source of the callback.
   * @param value The new value.
   */
  onChange?: (event: React.MouseEvent<HTMLElement>, value: string | string[]) => void;
  
  /**
   * If true, only one button can be selected at a time.
   * @default false
   */
  exclusive?: boolean;
  
  /**
   * The size of the component.
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';
  
  /**
   * The color of the component.
   * @default 'standard'
   */
  color?: 'standard' | 'primary' | 'secondary' | 'error' | 'warning' | 'success' | 'info';
  
  /**
   * If true, the button group will take up the full width of its container.
   * @default false
   */
  fullWidth?: boolean;
  
  /**
   * If true, the buttons will be disabled.
   * @default false
   */
  disabled?: boolean;
  
  /**
   * The component orientation.
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical';
  
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
}

export interface ToggleButtonProps {
  /**
   * The value to associate with the button.
   */
  value: string;
  
  /**
   * If true, the button will be disabled.
   * @default false
   */
  disabled?: boolean;
  
  /**
   * If true, the button is selected.
   */
  selected?: boolean;
  
  /**
   * Callback fired when the button is clicked.
   */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  
  /**
   * The content of the button.
   */
  children: React.ReactNode;
  
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
 * ToggleButtonGroup component that wraps BaseUI ToggleGroup with MUI-compatible API.
 */
export const ToggleButtonGroup = forwardRef<HTMLDivElement, ToggleButtonGroupProps>(
  (
    {
      value,
      onChange,
      exclusive = false,
      size = 'medium',
      color = 'standard',
      fullWidth = false,
      disabled = false,
      orientation = 'horizontal',
      children,
      sx,
      className = '',
      ...props
    },
    ref
  ) => {
    const combinedClassName = `${styles.toggleGroup} ${className}`.trim();
    
    // Convert value to array format for BaseUI
    const valueArray = exclusive 
      ? (value ? [value as string] : [])
      : (Array.isArray(value) ? value : (value ? [value as string] : []));
    
    // Adapter for onChange to match MUI's signature
    const handleValueChange = (newValue: string[]) => {
      if (onChange) {
        // Create a synthetic event
        const event = new MouseEvent('click') as unknown as React.MouseEvent<HTMLElement>;
        
        if (exclusive) {
          // For exclusive mode, return single value or null
          onChange(event, newValue[0] || '');
        } else {
          // For non-exclusive mode, return array
          onChange(event, newValue);
        }
      }
    };

    // Pass size, color, and disabled props to children
    const enhancedChildren = Children.map(children, (child) => {
      if (isValidElement<ToggleButtonProps>(child)) {
        return cloneElement(child, {
          ...child.props,
          disabled: disabled || child.props.disabled,
          // Pass internal props via data attributes
          ['data-size' as string]: size,
          ['data-color' as string]: color,
        });
      }
      return child;
    });

    return (
      <ToggleGroup
        ref={ref}
        className={combinedClassName}
        value={valueArray}
        onValueChange={handleValueChange}
        multiple={!exclusive}
        disabled={disabled}
        data-size={size}
        data-color={color}
        data-fullwidth={fullWidth || undefined}
        data-orientation={orientation}
        style={sx}
        {...props}
      >
        {enhancedChildren}
      </ToggleGroup>
    );
  }
);

ToggleButtonGroup.displayName = 'ToggleButtonGroup';

/**
 * ToggleButton component for use within ToggleButtonGroup.
 */
export const ToggleButton = forwardRef<HTMLButtonElement, ToggleButtonProps>(
  (
    {
      value,
      disabled = false,
      selected,
      onClick,
      children,
      className = '',
      sx,
      ...props
    },
    ref
  ) => {
    const combinedClassName = `${styles.toggleButton} ${className}`.trim();

    return (
      <Toggle
        ref={ref}
        className={combinedClassName}
        value={value}
        disabled={disabled}
        onClick={onClick}
        style={sx}
        {...props}
      >
        {children}
      </Toggle>
    );
  }
);

ToggleButton.displayName = 'ToggleButton';
