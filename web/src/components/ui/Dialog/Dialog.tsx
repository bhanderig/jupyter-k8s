/**
 * Dialog Component
 * 
 * A simple modal dialog implementation.
 */

import { forwardRef, useEffect } from 'react';
import styles from './Dialog.module.css';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  sx?: React.CSSProperties;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

export const Dialog = forwardRef<HTMLDivElement, DialogProps>(
  ({ open, onClose, children, maxWidth = 'sm', className = '', sx, ...props }, ref) => {
    // Handle ESC key
    useEffect(() => {
      if (!open) return;

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);
      
      // Prevent body scroll when dialog is open
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = '';
      };
    }, [open, onClose]);

    if (!open) return null;

    return (
      <>
        <div className={styles.backdrop} onClick={onClose} />
        <div
          ref={ref}
          className={`${styles.popup} ${className}`.trim()}
          data-max-width={maxWidth}
          style={sx}
          role="dialog"
          {...props}
        >
          {children}
        </div>
      </>
    );
  }
);

Dialog.displayName = 'Dialog';

export interface DialogTitleProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const DialogTitle = forwardRef<HTMLHeadingElement, DialogTitleProps>(
  ({ children, className = '', id }, ref) => {
    return (
      <h2 ref={ref} className={`${styles.title} ${className}`.trim()} id={id}>
        {children}
      </h2>
    );
  }
);

DialogTitle.displayName = 'DialogTitle';

export interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

export const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(
  ({ children, className = '' }, ref) => {
    return (
      <div ref={ref} className={`${styles.content} ${className}`.trim()}>
        {children}
      </div>
    );
  }
);

DialogContent.displayName = 'DialogContent';

export interface DialogContentTextProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const DialogContentText = forwardRef<HTMLParagraphElement, DialogContentTextProps>(
  ({ children, className = '', id }, ref) => {
    return (
      <p ref={ref} className={`${styles.contentText} ${className}`.trim()} id={id}>
        {children}
      </p>
    );
  }
);

DialogContentText.displayName = 'DialogContentText';

export interface DialogActionsProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const DialogActions = forwardRef<HTMLDivElement, DialogActionsProps>(
  ({ children, className = '', style }, ref) => {
    return (
      <div ref={ref} className={`${styles.actions} ${className}`.trim()} style={style}>
        {children}
      </div>
    );
  }
);

DialogActions.displayName = 'DialogActions';
