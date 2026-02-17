import { forwardRef } from 'react';
import styles from './Avatar.module.css';

interface AvatarProps {
  src?: string;
  alt?: string;
  children?: React.ReactNode;
  className?: string;
  sx?: React.CSSProperties;
  variant?: 'circular' | 'rounded' | 'square';
  sizes?: 'small' | 'medium' | 'large';
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, alt, children, className = '', sx, variant = 'circular', sizes, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`${styles.avatar} ${className}`}
        data-variant={variant}
        data-size={sizes}
        style={sx}
        {...props}
      >
        {src ? (
          <img src={src} alt={alt || ''} className={styles.img} />
        ) : (
          <span className={styles.fallback}>{children}</span>
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';
