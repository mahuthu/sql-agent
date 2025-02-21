import React from 'react';
import {
  Box,
  Button,
  Input,
  Text,
  Heading,
  useColorModeValue,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { motion } from 'framer-motion';

// Animated components using framer-motion
const MotionBox = motion(Box);
const MotionButton = motion(Button);

// Card component with hover effect
export const Card = ({ children, ...props }) => {
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <MotionBox
      p={6}
      bg={bg}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      shadow="sm"
      _hover={{ shadow: 'md' }}
      {...props}
    >
      {children}
    </MotionBox>
  );
};

// Animated page transitions
export const PageTransition = ({ children }) => {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </MotionBox>
  );
};

// Custom button with loading animation
export const AnimatedButton = ({ children, isLoading, ...props }) => {
  const pulseAnimation = keyframes`
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  `;

  return (
    <MotionButton
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      animation={isLoading ? `${pulseAnimation} 1.5s infinite` : undefined}
      {...props}
    >
      {children}
    </MotionButton>
  );
};

// Form input with animated focus
export const FormInput = ({ error, ...props }) => {
  const errorColor = useColorModeValue('red.500', 'red.300');
  const focusBorderColor = useColorModeValue('brand.500', 'brand.300');

  return (
    <Box>
      <Input
        transition="all 0.2s"
        borderColor={error ? errorColor : undefined}
        _focus={{
          borderColor: error ? errorColor : focusBorderColor,
          boxShadow: `0 0 0 1px ${error ? errorColor : focusBorderColor}`,
        }}
        {...props}
      />
      {error && (
        <Text color={errorColor} fontSize="sm" mt={1}>
          {error}
        </Text>
      )}
    </Box>
  );
};

// Section heading with underline animation
export const SectionHeading = ({ children, ...props }) => {
  const borderColor = useColorModeValue('brand.500', 'brand.300');

  return (
    <Box position="relative" mb={6} {...props}>
      <Heading size="lg" mb={2}>
        {children}
      </Heading>
      <MotionBox
        height="2px"
        bg={borderColor}
        width="60px"
        initial={{ width: '0px' }}
        animate={{ width: '60px' }}
        transition={{ duration: 0.3, delay: 0.1 }}
      />
    </Box>
  );
};

// Animated badge/tag component
export const AnimatedBadge = ({ children, ...props }) => {
  const bg = useColorModeValue('brand.50', 'brand.900');
  const color = useColorModeValue('brand.700', 'brand.100');

  return (
    <MotionBox
      display="inline-block"
      px={2}
      py={1}
      bg={bg}
      color={color}
      borderRadius="full"
      fontSize="sm"
      fontWeight="medium"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      {children}
    </MotionBox>
  );
}; 