/**
 * Collapse Component
 * 
 * A wrapper that animates the height of its content.
 */

import { forwardRef, useRef, useEffect, useState } from 'react';
import styles from './Collapse.module.css';

export interface CollapseProps {
  in: boolean;
  children: React.ReactNode;
  className?: string;
  sx?: React.CSSProperties;
}

export const Collapse = forwardRef<HTMLDivElement, CollapseProps>(
  ({ in: isOpen, children, className = '', sx }, ref) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState<number | 'auto'>(isOpen ? 'auto' : 0);

    useEffect(() => {
      if (!contentRef.current) return;

      if (isOpen) {
        const contentHeight = contentRef.current.scrollHeight;
        setHeight(contentHeight);
        
        // Set to auto after animation completes
        const timer = setTimeout(() => {
          setHeight('auto');
        }, 300);
        
        return () => clearTimeout(timer);
      } else {
        // Force reflow to ensure transition works
        const contentHeight = contentRef.current.scrollHeight;
        setHeight(contentHeight);
        
        requestAnimationFrame(() => {
          setHeight(0);
        });
      }
    }, [isOpen]);

    return (
      <div
        ref={ref}
        className={`${styles.collapse} ${className}`.trim()}
        data-open={isOpen || undefined}
        style={{
          ...sx,
          height: height === 'auto' ? 'auto' : `${height}px`,
        }}
      >
        <div ref={contentRef} className={styles.content}>
          {children}
        </div>
      </div>
    );
  }
);

Collapse.displayName = 'Collapse';
