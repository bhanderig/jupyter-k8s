/**
 * BaseUI Component Wrappers
 * 
 * This directory contains wrapper components that maintain MUI-compatible APIs
 * while using BaseUI primitives internally. This allows for incremental migration
 * with minimal changes to consuming code.
 * 
 * Usage:
 * - Import from '@/components/ui' instead of '@mui/material'
 * - Component props remain identical to MUI
 * - Only import paths need to change
 */

// Foundation components will be exported here as they are created
export { Button } from './Button';
export type { ButtonProps } from './Button';
export { Typography } from './Typography';
export type { TypographyProps } from './Typography';
export { Box } from './Box/';
export type { BoxProps } from './Box/';
export { Stack } from './Stack/';
export type { StackProps } from './Stack/';

// Form components
export { TextField } from './TextField';
export type { TextFieldProps } from './TextField';
export { Slider } from './Slider';
export type { SliderProps, SliderMark } from './Slider';
export { Switch } from './Switch';
export type { SwitchProps } from './Switch';
export { ToggleButtonGroup, ToggleButton } from './ToggleButtonGroup';
export type { ToggleButtonGroupProps, ToggleButtonProps } from './ToggleButtonGroup';
export { Autocomplete } from './Autocomplete';
export type { AutocompleteProps, AutocompleteRenderInputParams } from './Autocomplete';

// Display components
export { Card, CardContent } from './Card';
export type { CardProps, CardContentProps } from './Card';
export { Paper } from './Paper';
export type { PaperProps } from './Paper';
export { Chip } from './Chip';
export type { ChipProps } from './Chip';
export { CircularProgress } from './CircularProgress';
export type { CircularProgressProps } from './CircularProgress';
export { Skeleton } from './Skeleton';
export type { SkeletonProps } from './Skeleton';

// Navigation components
export { AppBar } from './AppBar';
export { Toolbar } from './Toolbar';
export { Menu, MenuItem, ListItemIcon } from './Menu';
export type { MenuProps, MenuItemProps, ListItemIconProps } from './Menu';
export { Tooltip } from './Tooltip';
export type { TooltipProps } from './Tooltip';
export { Container } from './Container';
export { Avatar } from './Avatar';
export { IconButton } from './IconButton';
export type { IconButtonProps } from './IconButton';
export { Divider } from './Divider';
export type { DividerProps } from './Divider';

// Feedback components
export { Alert } from './Alert';
export type { AlertProps } from './Alert';
export { Collapse } from './Collapse';
export type { CollapseProps } from './Collapse';
export { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from './Dialog';
export type { DialogProps, DialogTitleProps, DialogContentProps, DialogContentTextProps, DialogActionsProps } from './Dialog';

// Layout components
// export { Grid } from './Grid';

// Layout components
export { Grid } from './Grid';
export type { GridProps } from './Grid';
export { InputBase } from './InputBase';
export type { InputBaseProps } from './InputBase';
