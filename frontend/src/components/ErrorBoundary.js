import React from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  useToast,
} from '@chakra-ui/react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to your error tracking service (e.g., Sentry)
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box p={8}>
          <VStack spacing={4} align="center">
            <Heading>Something went wrong</Heading>
            <Text>We apologize for the inconvenience.</Text>
            <Button
              colorScheme="blue"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
            {process.env.NODE_ENV === 'development' && (
              <Box mt={4}>
                <Text color="red.500">{this.state.error?.toString()}</Text>
                <pre>{this.state.errorInfo?.componentStack}</pre>
              </Box>
            )}
          </VStack>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 