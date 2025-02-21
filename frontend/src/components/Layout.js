import React from 'react';
import { Box, Container } from '@chakra-ui/react';

const Layout = ({ children }) => {
  return (
    <Box minH="100vh" bg="gray.50" _dark={{ bg: 'gray.900' }}>
      <Container maxW="container.xl" py={8}>
        {children}
      </Container>
    </Box>
  );
};

export default Layout; 