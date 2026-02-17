/**
 * TextField Component
 * 
 * A wrapper around BaseUI Field that maintains MUI-compatible API.
 * This allows for drop-in replacement of MUI TextField with minimal code changes.
 * 
 * Usage:
 * ```tsx
 * import { TextField } from '@/components/ui/TextField';
 * 
 * <TextField
 *   label="Workspace Name"
 *   value={name}
 *   onChange={(e) => setName(e.target.value)}
 *   error={!!error}
 *   helperText={error}
 *   placeholder="Enter name"
 * />
 * ```
 */

import { Field } from '@base-ui/react/field';
import { forwardRef } from 'react';
import styles from './TextField.module.css';

export interface TextFieldProps {
  /**
   * The label content.
   */
  label?: string;
  
  /**
   * The value of the input element.
   */
  value?: string;
  
  /**
   * Callback fired when the value is changed.
   */
  onChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  
  /**
   * If true, the input will indicate an error.
   * @default false
   */
  error?: boolean;
  
  /**
   * The helper text content.
   */
  helperText?: string;
  
  /**
   * The short hint displayed in the input before the user enters a value.
   */
  placeholder?: string;
  
  /**
   * Type of the input element.
   * @default 'text'
   */
  type?: string;
  
  /**
   * If true, the input element will be disabled.
   * @default false
   */
  disabled?: boolean;
  
  /**
   * If true, the label is displayed as required and the input element is required.
   * @default false
   */
  required?: boolean;
  
  /**
   * The size of the component.
   * @default 'medium'
   */
  size?: 'small' | 'medium';
  
  /**
   * If true, the input will take up the full width of its container.
   * @default false
   */
  fullWidth?: boolean;
  
  /**
   * If true, a textarea element will be rendered instead of an input.
   * @default false
   */
  multiline?: boolean;
  
  /**
   * Number of rows to display when multiline option is set to true.
   */
  rows?: number;
  
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: React.CSSProperties;
  
  /**
   * Additional CSS class name.
   */
  className?: string;
  
  /**
   * The name attribute of the input element.
   */
  name?: string;
  
  /**
   * The id of the input element.
   */
  id?: string;
  
  /**
   * Callback fired when the input is focused.
   */
  onFocus?: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  
  /**
   * Callback fired when the input loses focus.
   */
  onBlur?: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  
  /**
   * Used to reference the DOM element.
   */
  ref?: React.Ref<HTMLInputElement | HTMLTextAreaElement>;
}

/**
 * TextField component that wraps BaseUI Field with MUI-compatible API.
 */
export const TextField = forwardRef<HTMLInputElement | HTMLTextAreaElement, TextFieldProps>(
  (
    {
      label,
      value,
      onChange,
      error = false,
      helperText,
      placeholder,
      type = 'text',
      disabled = false,
      required = false,
      size = 'medium',
      fullWidth = false,
      multiline = false,
      rows,
      sx,
      className = '',
      name,
      id,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const combinedClassName = `${styles.field} ${className}`.trim();

    return (
      <Field.Root
        className={combinedClassName}
        disabled={disabled}
        data-fullwidth={fullWidth || undefined}
        data-size={size}
        data-error={error || undefined}
        style={sx}
      >
        {label && (
          <Field.Label className={styles.label}>
            {label}
            {required && <span className={styles.required}> *</span>}
          </Field.Label>
        )}
        <Field.Control
          render={
            multiline ? (
              <textarea
                ref={ref as React.Ref<HTMLTextAreaElement>}
                className={styles.textarea}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                rows={rows}
                disabled={disabled}
                name={name}
                id={id}
                onFocus={onFocus}
                onBlur={onBlur}
                aria-invalid={error}
                {...props}
              />
            ) : (
              <input
                ref={ref as React.Ref<HTMLInputElement>}
                className={styles.input}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                name={name}
                id={id}
                onFocus={onFocus}
                onBlur={onBlur}
                aria-invalid={error}
                {...props}
              />
            )
          }
        />
        {helperText && (
          <Field.Error className={styles.helperText} data-error={error || undefined}>
            {helperText}
          </Field.Error>
        )}
      </Field.Root>
    );
  }
);

TextField.displayName = 'TextField';
