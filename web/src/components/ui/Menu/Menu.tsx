/**
 * Menu Component
 * 
 * A wrapper for BaseUI Menu that maintains MUI-compatible API.
 * Uses BaseUI Menu internally for proper accessibility and positioning.
 */

import { Menu as BaseMenu } from '@base-ui/react/menu';
import { forwardRef } from 'react';
import styles from './Menu.module.css';

export interface MenuProps {
  /**
   * The anchor element for positioning the menu.
   */
  anchorEl: HTMLElement | null;
  
  /**
   * If true, the menu is visible.
   */
  open: boolean;
  
  /**
   * Callback fired when the menu requests to be closed.
   */
  onClose: () => void;
  
  /**
   * The content of the component.
   */
  children?: React.ReactNode;
  
  /**
   * Additional CSS class name.
   */
  className?: string;
}

/**
 * Menu component that renders a positioned popup menu using BaseUI.
 */
export const Menu = forwardRef<HTMLDivElement, MenuProps>(
  (
    {
      anchorEl,
      open,
      onClose,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <BaseMenu.Root open={open} onOpenChange={(newOpen) => !newOpen && onClose()}>
        <BaseMenu.Portal>
          <BaseMenu.Positioner 
            className={styles.positioner}
            anchor={anchorEl}
            side="bottom"
            align="start"
            sideOffset={4}
          >
            <BaseMenu.Popup 
              ref={ref}
              className={`${styles.menu} ${className}`}
              {...props}
            >
              {children}
            </BaseMenu.Popup>
          </BaseMenu.Positioner>
        </BaseMenu.Portal>
      </BaseMenu.Root>
    );
  }
);

Menu.displayName = 'Menu';

export interface MenuItemProps {
  /**
   * The content of the component.
   */
  children?: React.ReactNode;
  
  /**
   * onClick event handler.
   */
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  
  /**
   * If true, the menu item is disabled.
   */
  disabled?: boolean;
  
  /**
   * Additional CSS class name.
   */
  className?: string;
}

/**
 * MenuItem component that renders a menu item using BaseUI.
 */
export const MenuItem = forwardRef<HTMLDivElement, MenuItemProps>(
  (
    {
      children,
      onClick,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <BaseMenu.Item
        ref={ref}
        className={`${styles.menuItem} ${className}`}
        onClick={onClick}
        disabled={disabled}
        {...props}
      >
        {children}
      </BaseMenu.Item>
    );
  }
);

MenuItem.displayName = 'MenuItem';

export interface ListItemIconProps {
  /**
   * The content of the component (icon).
   */
  children?: React.ReactNode;
  
  /**
   * Additional CSS class name.
   */
  className?: string;
}

/**
 * ListItemIcon component that renders an icon in a menu item.
 */
export const ListItemIcon = forwardRef<HTMLSpanElement, ListItemIconProps>(
  (
    {
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const combinedClassName = `${styles.listItemIcon} ${className}`.trim();

    return (
      <span
        ref={ref}
        className={combinedClassName}
        {...props}
      >
        {children}
      </span>
    );
  }
);

ListItemIcon.displayName = 'ListItemIcon';
