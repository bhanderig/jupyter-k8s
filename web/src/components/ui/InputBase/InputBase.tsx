/**
 * InputBase Component
 * 
 * A minimal input component without borders or labels.
 */

import { forwardRef } from 'react';
import styles from './InputBase.module.css';

export interface InputBaseProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  className?: string;
  sx?: React.CSSProperties;
}

export const InputBase = forwardRef<HTMLInputElement, InputBaseProps>(
  ({ value, onChange, placeholder, fullWidth, disabled, inputProps, className = '', sx, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`${styles.input} ${className}`.trim()}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        data-fullwidth={fullWidth || undefined}
        style={sx}
        {...inputProps}
        {...props}
      />
    );
  }
);

InputBase.displayName = 'InputBase';
