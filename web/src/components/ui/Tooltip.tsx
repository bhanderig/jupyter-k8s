import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import { cloneElement, isValidElement } from 'react';
import styles from './Tooltip.module.css';

export interface TooltipProps {
  title: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Tooltip({ 
  title, 
  placement = 'top', 
  children,
  open,
  onOpenChange,
}: TooltipProps) {
  // If title is empty, just render children without tooltip
  if (!title) {
    return children;
  }

  return (
    <BaseTooltip.Root open={open} onOpenChange={onOpenChange}>
      <BaseTooltip.Trigger render={<span />}>
        {isValidElement(children) ? cloneElement(children) : children}
      </BaseTooltip.Trigger>
      <BaseTooltip.Portal>
        <BaseTooltip.Positioner side={placement}>
          <BaseTooltip.Popup className={styles.popup}>
            <BaseTooltip.Arrow className={styles.arrow} />
            {title}
          </BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  );
}
