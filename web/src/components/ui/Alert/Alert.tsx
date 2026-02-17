/**
 * Alert Component
 * 
 * A wrapper that displays alert messages with different severity levels.
 */

import { forwardRef } from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';
import styles from './Alert.module.css';

export interface AlertProps {
  severity?: 'error' | 'warning' | 'info' | 'success';
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
  sx?: React.CSSProperties;
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ severity = 'info', children, onClose, className = '', sx }, ref) => {
    const getIcon = () => {
      switch (severity) {
        case 'error':
          return <AlertCircle size={20} />;
        case 'warning':
          return <AlertTriangle size={20} />;
        case 'success':
          return <CheckCircle size={20} />;
        case 'info':
        default:
          return <Info size={20} />;
      }
    };

    return (
      <div
        ref={ref}
        className={`${styles.alert} ${className}`.trim()}
        data-severity={severity}
        style={sx}
        role="alert"
      >
        <div className={styles.icon}>{getIcon()}</div>
        <div className={styles.content}>{children}</div>
        {onClose && (
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close"
            type="button"
          >
            <X size={18} />
          </button>
        )}
      </div>
    );
  }
);

Alert.displayName = 'Alert';
