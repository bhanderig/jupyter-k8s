/**
 * Autocomplete Component
 * 
 * A wrapper around BaseUI Combobox that maintains MUI-compatible API.
 * This allows for drop-in replacement of MUI Autocomplete with minimal code changes.
 * 
 * Usage:
 * ```tsx
 * import { Autocomplete } from '@/components/ui/Autocomplete';
 * import { TextField } from '@/components/ui/TextField';
 * 
 * <Autocomplete
 *   options={options}
 *   value={value}
 *   onChange={(_, newValue) => setValue(newValue)}
 *   getOptionLabel={(option) => option.label}
 *   renderInput={(params) => <TextField {...params} label="Select" />}
 * />
 * ```
 */

import { forwardRef, useState, useEffect } from 'react';
import styles from './Autocomplete.module.css';

export interface AutocompleteProps<T> {
  /**
   * Array of options.
   */
  options: T[];
  
  /**
   * The value of the autocomplete.
   */
  value?: T | null;
  
  /**
   * The default value. Use when the component is not controlled.
   */
  defaultValue?: T | null;
  
  /**
   * Callback fired when the value changes.
   * @param event The event source of the callback.
   * @param value The new value.
   */
  onChange?: (event: React.SyntheticEvent, value: T | string | null) => void;
  
  /**
   * Callback fired when the input value changes.
   * @param event The event source of the callback.
   * @param value The new input value.
   * @param reason The reason for the change.
   */
  onInputChange?: (event: React.SyntheticEvent, value: string, reason: string) => void;
  
  /**
   * Used to determine the string value for a given option.
   * @param option The option to get the label for.
   */
  getOptionLabel?: (option: T | string) => string;
  
  /**
   * Render the input.
   * @param params The props to apply to the input element.
   */
  renderInput: (params: AutocompleteRenderInputParams) => React.ReactNode;
  
  /**
   * If true, the user can enter a value that is not in the options list.
   * @default false
   */
  freeSolo?: boolean;
  
  /**
   * If true, the component is disabled.
   * @default false
   */
  disabled?: boolean;
  
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
   * If true, the popup will open on input focus.
   * @default false
   */
  openOnFocus?: boolean;
  
  /**
   * If true, the component will be in loading state.
   * @default false
   */
  loading?: boolean;
  
  /**
   * Text to display when in a loading state.
   */
  loadingText?: React.ReactNode;
  
  /**
   * Text to display when there are no options.
   */
  noOptionsText?: React.ReactNode;
  
  /**
   * The placeholder text for the input.
   */
  placeholder?: string;
  
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: React.CSSProperties;
  
  /**
   * Additional CSS class name.
   */
  className?: string;
}

export interface AutocompleteRenderInputParams {
  id?: string;
  disabled?: boolean;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  InputProps?: {
    ref?: React.Ref<HTMLInputElement>;
    className?: string;
    startAdornment?: React.ReactNode;
    endAdornment?: React.ReactNode;
  };
}

/**
 * Autocomplete component that wraps BaseUI Combobox with MUI-compatible API.
 */
export const Autocomplete = forwardRef<HTMLDivElement, AutocompleteProps<any>>(
  (
    {
      options,
      value,
      defaultValue,
      onChange,
      onInputChange,
      getOptionLabel = (option) => (typeof option === 'string' ? option : option?.label || String(option)),
      renderInput,
      freeSolo = false,
      disabled = false,
      size = 'medium',
      fullWidth = false,
      openOnFocus = false,
      loading = false,
      loadingText = 'Loading...',
      noOptionsText = 'No options',
      placeholder,
      sx,
      className = '',
      ...props
    },
    ref
  ) => {
    const [inputValue, setInputValue] = useState('');
    const [open, setOpen] = useState(false);
    
    // Sync input value with selected value
    useEffect(() => {
      if (value !== undefined && value !== null) {
        setInputValue(getOptionLabel(value));
      } else if (value === null) {
        setInputValue('');
      }
    }, [value, getOptionLabel]);
    
    // Initialize with default value
    useEffect(() => {
      if (defaultValue !== undefined && defaultValue !== null && !value) {
        setInputValue(getOptionLabel(defaultValue));
      }
    }, [defaultValue, getOptionLabel, value]);
    
    const combinedClassName = `${styles.autocomplete} ${className}`.trim();
    
    // Handle selection change
    const handleValueChange = (newValue: string | null) => {
      if (onChange) {
        // Find the matching option
        const matchedOption = options.find(opt => getOptionLabel(opt) === newValue);
        
        if (matchedOption) {
          // Found a matching option
          const event = new Event('change') as unknown as React.SyntheticEvent;
          onChange(event, matchedOption);
        } else if (freeSolo && newValue) {
          // Free solo mode - allow custom value
          const event = new Event('change') as unknown as React.SyntheticEvent;
          onChange(event, newValue);
        } else if (newValue === null) {
          // Cleared
          const event = new Event('change') as unknown as React.SyntheticEvent;
          onChange(event, null);
        }
      }
    };
    
    // Handle input change
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      setInputValue(newValue);
      
      if (onInputChange) {
        onInputChange(event as React.SyntheticEvent, newValue, 'input');
      }
      
      // In freeSolo mode, update the value immediately
      if (freeSolo) {
        handleValueChange(newValue);
      }
    };
    
    // Handle option selection
    const handleOptionClick = (option: any) => {
      const optionLabel = getOptionLabel(option);
      setInputValue(optionLabel);
      handleValueChange(optionLabel);
      setOpen(false);
    };
    
    // Handle input focus
    const handleFocus = () => {
      if (openOnFocus) {
        setOpen(true);
      }
    };
    
    // Handle input blur
    const handleBlur = () => {
      // Delay closing to allow option click
      setTimeout(() => setOpen(false), 200);
    };
    
    // Render the input with params
    const inputParams: AutocompleteRenderInputParams = {
      disabled,
      size,
      fullWidth,
      inputProps: {
        autoComplete: 'off',
        role: 'combobox',
        'aria-expanded': open,
        'aria-autocomplete': 'list',
        value: inputValue,
        onChange: handleInputChange,
        onFocus: handleFocus,
        onBlur: handleBlur,
        placeholder,
      },
    };

    return (
      <div
        ref={ref}
        className={combinedClassName}
        data-size={size}
        data-fullwidth={fullWidth || undefined}
        style={sx}
        {...props}
      >
        {renderInput(inputParams)}
        
        {open && !disabled && (
          <div className={styles.listbox}>
            {loading ? (
              <div className={styles.option} data-disabled>
                {loadingText}
              </div>
            ) : options.length === 0 ? (
              <div className={styles.option} data-disabled>
                {noOptionsText}
              </div>
            ) : (
              options
                .filter(option => {
                  // Filter options based on input value
                  if (!inputValue) return true;
                  const label = getOptionLabel(option).toLowerCase();
                  return label.includes(inputValue.toLowerCase());
                })
                .map((option, index) => {
                  const label = getOptionLabel(option);
                  const isSelected = label === inputValue;
                  
                  return (
                    <div
                      key={index}
                      className={styles.option}
                      data-selected={isSelected || undefined}
                      onClick={() => handleOptionClick(option)}
                      role="option"
                      aria-selected={isSelected}
                    >
                      {label}
                    </div>
                  );
                })
            )}
          </div>
        )}
      </div>
    );
  }
);

Autocomplete.displayName = 'Autocomplete';
