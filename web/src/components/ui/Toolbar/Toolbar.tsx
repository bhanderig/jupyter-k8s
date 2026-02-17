import { forwardRef } from 'react';
import styles from './Toolbar.module.css';

interface ToolbarProps {
  children?: React.ReactNode;
  className?: string;
  sx?: React.CSSProperties;
  disableGutters?: boolean;
  variant?: 'regular' | 'dense';
}

export const Toolbar = forwardRef<HTMLDivElement, ToolbarProps>(
  ({ children, className = '', sx, disableGutters = false, variant = 'regular', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`${styles.toolbar} ${className}`}
        data-variant={variant}
        data-disable-gutters={disableGutters || undefined}
        style={sx}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Toolbar.displayName = 'Toolbar';
