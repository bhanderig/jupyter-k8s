import { forwardRef } from 'react';
import styles from './Container.module.css';

interface ContainerProps {
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  children: React.ReactNode;
  className?: string;
  sx?: React.CSSProperties;
  disableGutters?: boolean;
}

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ maxWidth = 'lg', children, className = '', sx, disableGutters = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`${styles.container} ${className}`}
        data-maxwidth={maxWidth || undefined}
        data-disable-gutters={disableGutters || undefined}
        style={sx}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Container.displayName = 'Container';
