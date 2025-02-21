import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  VStack,
  Heading,
  Text,
  Button,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
import { WarningIcon } from '@chakra-ui/icons';
import { Card, PageTransition } from './common';

const SubscriptionCancel = () => {
  const navigate = useNavigate();
  const textColor = useColorModeValue('gray.600', 'gray.300');

  return (
    <PageTransition>
      <VStack spacing={8} align="center" py={10}>
        <Card maxW="lg" p={8}>
          <VStack spacing={6}>
            <Icon as={WarningIcon} w={16} h={16} color="orange.500" />
            <Heading size="lg">Subscription Cancelled</Heading>
            <Text color={textColor} textAlign="center">
              Your subscription process was cancelled. If you have any questions or
              concerns, please contact our support team.
            </Text>
            <Button
              colorScheme="brand"
              size="lg"
              onClick={() => navigate('/subscription')}
            >
              Try Again
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
            >
              Return to Dashboard
            </Button>
          </VStack>
        </Card>
      </VStack>
    </PageTransition>
  );
};

export default SubscriptionCancel; 