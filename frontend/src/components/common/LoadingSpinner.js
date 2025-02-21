import React from 'react';
import { Box, Spinner, Text, VStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

export const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <VStack spacing={4}>
      <MotionBox
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="brand.500"
          size="xl"
        />
      </MotionBox>
      <Text color="gray.500">{message}</Text>
    </VStack>
  );
}; 