import { Component, type ReactNode } from 'react';
import { Typography, Button, Box } from '@/components/ui';
import { AlertCircle } from 'lucide-react';
import { strings } from '../../constants';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="100vh"
          padding={4}
          sx={{ 
            backgroundColor: 'var(--bg-default)',
            textAlign: 'center'
          }}
        >
          <AlertCircle color="var(--color-error)" size={64} style={{ marginBottom: 16 }} />
          <Typography variant="h4" gutterBottom>{strings.error.title}</Typography>
          <Box maxWidth={400}>
            <Typography variant="body2" color="textSecondary" sx={{ marginBottom: '1rem' }}>
              {strings.error.description}
            </Typography>
          </Box>
          <Button variant="contained" onClick={this.handleReset}>
            {strings.error.goHome}
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}
