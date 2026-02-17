/**
 * Chip Component
 * 
 * A wrapper that renders a div with chip styling.
 * This maintains MUI-compatible API while using native HTML elements.
 * 
 * Usage:
 * ```tsx
 * import { Chip } from '@/components/ui/Chip';
 * 
 * <Chip label="Active" color="primary" />
 * <Chip label="Tag" onDelete={() => {}} />
 * <Chip icon={<Icon />} label="With Icon" />
 * ```
 */

import { forwardRef } from 'react';
import { X } from 'lucide-react';
import styles from './Chip.module.css';

export interface ChipProps {
  /**
   * The content of the component (label text).
   */
  label: React.ReactNode;
  
  /**
   * The color of the component.
   * @default 'default'
   */
  color?: 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'success' | 'info';
  
  /**
   * The size of the component.
   * @default 'medium'
   */
  size?: 'small' | 'medium';
  
  /**
   * The variant to use.
   * @default 'filled'
   */
  variant?: 'filled' | 'outlined';
  
  /**
   * Icon element to display at the start.
   */
  icon?: React.ReactElement;
  
  /**
   * Callback fired when the delete icon is clicked.
   * If set, the delete icon will be shown.
   */
  onDelete?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  
  /**
   * Additional CSS class name.
   */
  className?: string;
  
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: React.CSSProperties;
  
  /**
   * Inline styles (for dynamic styling like background color).
   */
  style?: React.CSSProperties;
  
  /**
   * onClick event handler.
   */
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

/**
 * Chip component that renders a div with chip styling.
 */
export const Chip = forwardRef<HTMLDivElement, ChipProps>(
  (
    {
      label,
      color = 'default',
      size = 'medium',
      variant = 'filled',
      icon,
      onDelete,
      className = '',
      sx,
      style,
      onClick,
      ...props
    },
    ref
  ) => {
    const combinedClassName = `${styles.chip} ${className}`.trim();
    const combinedStyle = { ...sx, ...style };

    return (
      <div
        ref={ref}
        className={combinedClassName}
        data-color={color}
        data-size={size}
        data-variant={variant}
        data-clickable={onClick ? true : undefined}
        style={Object.keys(combinedStyle).length > 0 ? combinedStyle : undefined}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        {...props}
      >
        {icon && <span className={styles.icon}>{icon}</span>}
        <span className={styles.label}>{label}</span>
        {onDelete && (
          <button
            className={styles.deleteButton}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(e);
            }}
            aria-label="Delete"
            type="button"
          >
            <X className={styles.deleteIcon} />
          </button>
        )}
      </div>
    );
  }
);

Chip.displayName = 'Chip';
