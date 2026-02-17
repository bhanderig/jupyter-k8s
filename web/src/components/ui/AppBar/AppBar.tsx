import { forwardRef } from 'react';
import styles from './AppBar.module.css';

interface AppBarProps {
  position?: 'fixed' | 'absolute' | 'sticky' | 'static' | 'relative';
  elevation?: number;
  component?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  sx?: React.CSSProperties;
}

export const AppBar = forwardRef<HTMLElement, AppBarProps>(
  ({ position = 'fixed', elevation = 4, component: Component = 'header', children, className = '', sx, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={`${styles.appBar} ${className}`}
        data-position={position}
        data-elevation={elevation}
        style={sx}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

AppBar.displayName = 'AppBar';
