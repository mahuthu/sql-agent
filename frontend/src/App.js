import React from 'react';
import { ChakraProvider, CSSReset } from '@chakra-ui/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import theme from './theme';
import AppRoutes from './Routes';
import Navbar from './components/Navbar';

function App() {
  return (
    <ChakraProvider theme={theme}>
      <CSSReset />
      <ErrorBoundary>
        <AuthProvider>
          <Router>
            <Navbar />
            <AppRoutes />
          </Router>
        </AuthProvider>
      </ErrorBoundary>
    </ChakraProvider>
  );
}

export default App;