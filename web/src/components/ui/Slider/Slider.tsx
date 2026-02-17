/**
 * Slider Component
 * 
 * A wrapper around BaseUI Slider that maintains MUI-compatible API.
 * This allows for drop-in replacement of MUI Slider with minimal code changes.
 * 
 * Usage:
 * ```tsx
 * import { Slider } from '@/components/ui/Slider';
 * 
 * <Slider
 *   value={value}
 *   onChange={(e, newValue) => setValue(newValue)}
 *   min={0}
 *   max={100}
 *   step={1}
 *   marks={[{ value: 0, label: '0' }, { value: 100, label: '100' }]}
 *   valueLabelDisplay="auto"
 * />
 * ```
 */

import { Slider as BaseSlider } from '@base-ui/react/slider';
import { forwardRef, useState } from 'react';
import styles from './Slider.module.css';

export interface SliderMark {
  value: number;
  label?: string;
}

export interface SliderProps {
  /**
   * The value of the slider.
   * For a single-thumb slider, provide a number.
   * For a range slider, provide an array of two numbers.
   */
  value?: number | number[];
  
  /**
   * The default value. Use when the component is not controlled.
   */
  defaultValue?: number | number[];
  
  /**
   * Callback function that is fired when the slider's value changed.
   * @param event The event source of the callback.
   * @param value The new value.
   */
  onChange?: (event: Event, value: number | number[]) => void;
  
  /**
   * Callback function that is fired when the mouseup is triggered.
   * @param event The event source of the callback.
   * @param value The new value.
   */
  onChangeCommitted?: (event: Event, value: number | number[]) => void;
  
  /**
   * The minimum allowed value of the slider.
   * @default 0
   */
  min?: number;
  
  /**
   * The maximum allowed value of the slider.
   * @default 100
   */
  max?: number;
  
  /**
   * The granularity with which the slider can step through values.
   * @default 1
   */
  step?: number;
  
  /**
   * Marks indicate predetermined values to which the user can move the slider.
   * If true, the slider will use the min and max as marks.
   * If an array, it should contain objects with value and an optional label key.
   */
  marks?: boolean | SliderMark[];
  
  /**
   * Controls when the value label is displayed:
   * - auto: the value label will display when the thumb is hovered or focused.
   * - on: will display persistently.
   * - off: will never display.
   * @default 'off'
   */
  valueLabelDisplay?: 'on' | 'auto' | 'off';
  
  /**
   * The size of the component.
   * @default 'medium'
   */
  size?: 'small' | 'medium';
  
  /**
   * If true, the slider will be disabled.
   * @default false
   */
  disabled?: boolean;
  
  /**
   * The component orientation.
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical';
  
  /**
   * A string value that provides a user-friendly name for the current value of the slider.
   */
  getAriaValueText?: (value: number, index: number) => string;
  
  /**
   * The label of the slider.
   */
  'aria-label'?: string;
  
  /**
   * The id of the element containing a label for the slider.
   */
  'aria-labelledby'?: string;
  
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: React.CSSProperties;
  
  /**
   * Additional CSS class name.
   */
  className?: string;
}

/**
 * Slider component that wraps BaseUI Slider with MUI-compatible API.
 */
export const Slider = forwardRef<HTMLDivElement, SliderProps>(
  (
    {
      value,
      defaultValue,
      onChange,
      onChangeCommitted,
      min = 0,
      max = 100,
      step = 1,
      marks = false,
      valueLabelDisplay = 'off',
      size = 'medium',
      disabled = false,
      orientation = 'horizontal',
      getAriaValueText,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      sx,
      className = '',
      ...props
    },
    ref
  ) => {
    // Track hover/focus state for auto value label display
    const [isHovered, setIsHovered] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    
    // Determine if value label should be shown
    const showValueLabel = 
      valueLabelDisplay === 'on' || 
      (valueLabelDisplay === 'auto' && (isHovered || isFocused));
    
    // Convert marks to array format
    const marksArray: SliderMark[] = marks === true 
      ? [{ value: min, label: String(min) }, { value: max, label: String(max) }]
      : marks === false
      ? []
      : marks;
    
    // Determine if this is a range slider
    const isRange = Array.isArray(value) || Array.isArray(defaultValue);
    const values = value !== undefined ? (Array.isArray(value) ? value : [value]) : undefined;
    const defaultValues = defaultValue !== undefined ? (Array.isArray(defaultValue) ? defaultValue : [defaultValue]) : undefined;
    
    const combinedClassName = `${styles.slider} ${className}`.trim();
    
    // Adapter for getAriaValueText to match BaseUI's signature
    const getAriaValueTextAdapter = getAriaValueText 
      ? (_formattedValue: string, value: number, index: number) => getAriaValueText(value, index)
      : undefined;
    
    const handleValueChange = (newValue: number | number[]) => {
      if (onChange) {
        // Create a synthetic event-like object
        const event = new Event('change');
        onChange(event, newValue);
      }
    };
    
    const handleValueCommitted = (newValue: number | number[]) => {
      if (onChangeCommitted) {
        const event = new Event('change');
        onChangeCommitted(event, newValue);
      }
    };

    return (
      <div
        ref={ref}
        className={combinedClassName}
        data-orientation={orientation}
        data-size={size}
        style={sx}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <BaseSlider.Root
          value={values}
          defaultValue={defaultValues}
          onValueChange={handleValueChange}
          onValueCommitted={handleValueCommitted}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          orientation={orientation}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          className={styles.root}
          {...props}
        >
          <BaseSlider.Control className={styles.control}>
            <BaseSlider.Track className={styles.track}>
              <BaseSlider.Indicator className={styles.indicator} />
              
              {/* Render marks */}
              {marksArray.length > 0 && (
                <div className={styles.marks}>
                  {marksArray.map((mark) => (
                    <div
                      key={mark.value}
                      className={styles.mark}
                      style={{
                        [orientation === 'horizontal' ? 'left' : 'bottom']: 
                          `${((mark.value - min) / (max - min)) * 100}%`
                      }}
                    >
                      <div className={styles.markDot} />
                      {mark.label && (
                        <div className={styles.markLabel}>{mark.label}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Render thumb(s) */}
              {isRange ? (
                <>
                  <BaseSlider.Thumb 
                    className={styles.thumb}
                    getAriaValueText={getAriaValueTextAdapter}
                    index={0}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                  >
                    {showValueLabel && (
                      <div className={styles.valueLabel}>
                        {values?.[0] ?? defaultValues?.[0] ?? min}
                      </div>
                    )}
                  </BaseSlider.Thumb>
                  <BaseSlider.Thumb 
                    className={styles.thumb}
                    getAriaValueText={getAriaValueTextAdapter}
                    index={1}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                  >
                    {showValueLabel && (
                      <div className={styles.valueLabel}>
                        {values?.[1] ?? defaultValues?.[1] ?? max}
                      </div>
                    )}
                  </BaseSlider.Thumb>
                </>
              ) : (
                <BaseSlider.Thumb 
                  className={styles.thumb}
                  getAriaValueText={getAriaValueTextAdapter}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                >
                  {showValueLabel && (
                    <div className={styles.valueLabel}>
                      {values?.[0] ?? defaultValues?.[0] ?? min}
                    </div>
                  )}
                </BaseSlider.Thumb>
              )}
            </BaseSlider.Track>
          </BaseSlider.Control>
        </BaseSlider.Root>
      </div>
    );
  }
);

Slider.displayName = 'Slider';
