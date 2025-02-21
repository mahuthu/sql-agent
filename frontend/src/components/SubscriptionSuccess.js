import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  VStack,
  Heading,
  Text,
  Button,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
import { CheckCircleIcon } from '@chakra-ui/icons';
import { Card, PageTransition } from './common';

const SubscriptionSuccess = () => {
  const navigate = useNavigate();
  const textColor = useColorModeValue('gray.600', 'gray.300');

  useEffect(() => {
    // Optional: Verify subscription status with backend
  }, []);

  return (
    <PageTransition>
      <VStack spacing={8} align="center" py={10}>
        <Card maxW="lg" p={8}>
          <VStack spacing={6}>
            <Icon as={CheckCircleIcon} w={16} h={16} color="green.500" />
            <Heading size="lg">Subscription Successful!</Heading>
            <Text color={textColor} textAlign="center">
              Thank you for subscribing to SQL Agent. Your account has been
              successfully upgraded.
            </Text>
            <Button
              colorScheme="brand"
              size="lg"
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
            </Button>
          </VStack>
        </Card>
      </VStack>
    </PageTransition>
  );
};

export default SubscriptionSuccess; 