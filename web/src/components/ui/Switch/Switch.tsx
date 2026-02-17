/**
 * Switch Component
 * 
 * A wrapper around BaseUI Switch that maintains MUI-compatible API.
 * This allows for drop-in replacement of MUI Switch with minimal code changes.
 * 
 * Usage:
 * ```tsx
 * import { Switch } from '@/components/ui/Switch';
 * 
 * <Switch
 *   checked={enabled}
 *   onChange={(e) => setEnabled(e.target.checked)}
 *   disabled={false}
 *   color="primary"
 * />
 * ```
 */

import { Switch as BaseSwitch } from '@base-ui/react/switch';
import { forwardRef } from 'react';
import styles from './Switch.module.css';

export interface SwitchProps {
  /**
   * If true, the component is checked.
   */
  checked?: boolean;
  
  /**
   * The default checked state. Use when the component is not controlled.
   */
  defaultChecked?: boolean;
  
  /**
   * Callback fired when the state is changed.
   * @param event The event source of the callback.
   */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  
  /**
   * If true, the component is disabled.
   * @default false
   */
  disabled?: boolean;
  
  /**
   * The color of the component.
   * @default 'primary'
   */
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'success' | 'info' | 'default';
  
  /**
   * The size of the component.
   * @default 'medium'
   */
  size?: 'small' | 'medium';
  
  /**
   * If true, the ripple effect is disabled.
   * @default false
   */
  disableRipple?: boolean;
  
  /**
   * The value of the component.
   */
  value?: string;
  
  /**
   * The name attribute of the input element.
   */
  name?: string;
  
  /**
   * The id of the input element.
   */
  id?: string;
  
  /**
   * If true, the component appears indeterminate.
   * @default false
   */
  indeterminate?: boolean;
  
  /**
   * Attributes applied to the input element.
   */
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  
  /**
   * Props applied to the input element.
   */
  slotProps?: {
    input?: React.InputHTMLAttributes<HTMLInputElement>;
  };
  
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: React.CSSProperties;
  
  /**
   * Additional CSS class name.
   */
  className?: string;
  
  /**
   * Used to reference the DOM element.
   */
  ref?: React.Ref<HTMLButtonElement>;
}

/**
 * Switch component that wraps BaseUI Switch with MUI-compatible API.
 */
export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      checked,
      defaultChecked,
      onChange,
      disabled = false,
      color = 'primary',
      size = 'medium',
      value,
      name,
      id,
      inputProps,
      slotProps,
      sx,
      className = '',
      ...props
    },
    ref
  ) => {
    const combinedClassName = `${styles.switch} ${className}`.trim();
    
    // Merge inputProps and slotProps.input
    const mergedInputProps = {
      ...inputProps,
      ...slotProps?.input,
      name,
      id,
      value,
    };
    
    // Adapter for onChange to match MUI's signature
    const handleChange = (checked: boolean, eventDetails: { event: Event }) => {
      if (onChange) {
        // Create a synthetic event that matches React's ChangeEvent
        const target = eventDetails.event.target as HTMLInputElement;
        const syntheticEvent = {
          target: {
            checked,
            value: value || '',
            name: name || '',
          },
          currentTarget: target,
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        
        onChange(syntheticEvent);
      }
    };

    return (
      <BaseSwitch.Root
        ref={ref}
        className={combinedClassName}
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={handleChange}
        disabled={disabled}
        data-color={color}
        data-size={size}
        style={sx}
        {...props}
      >
        <BaseSwitch.Thumb className={styles.thumb} />
        <input {...mergedInputProps} />
      </BaseSwitch.Root>
    );
  }
);

Switch.displayName = 'Switch';
