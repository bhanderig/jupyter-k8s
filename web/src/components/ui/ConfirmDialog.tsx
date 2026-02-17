import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@/components/ui';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isDestructive = false,
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onCancel} aria-labelledby="confirm-dialog-title" aria-describedby="confirm-dialog-description">
      <DialogTitle id="confirm-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="confirm-dialog-description">{message}</DialogContentText>
      </DialogContent>
      <DialogActions style={{ padding: '16px 24px' }}>
        <Button onClick={onCancel} variant="outlined" disabled={isLoading}>{cancelLabel}</Button>
        <Button onClick={onConfirm} variant="contained" color={isDestructive ? 'error' : 'primary'} disabled={isLoading}>
          {isLoading ? 'Deleting...' : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
