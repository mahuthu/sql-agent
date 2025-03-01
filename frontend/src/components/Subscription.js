import React, { useState, useEffect } from 'react';
import {
  VStack,
  SimpleGrid,
  Text,
  Button,
  useColorModeValue,
  Box,
  useToast,
  HStack,
} from '@chakra-ui/react';
import {
  Card,
  PageTransition,
  SectionHeading,
} from './common';
import { LoadingSpinner } from './common/LoadingSpinner';
import { 
  getCurrentSubscription, 
  getSubscriptionPlans,
  createCheckoutSession,
  createPortalSession 
} from '../utils/api';

const Subscription = () => {
  const [currentPlan, setCurrentPlan] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const toast = useToast();

  const textColor = useColorModeValue('gray.600', 'gray.300');
  const highlightColor = useColorModeValue('brand.500', 'brand.200');

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      const [plansData, currentSubData] = await Promise.all([
        getSubscriptionPlans(),
        getCurrentSubscription(),
      ]);
      
      if (plansData?.data) {
        setPlans(plansData.data);
      } else {
        setPlans([]);
        console.error('No plans data received');
      }

      if (currentSubData?.data) {
        setCurrentPlan(currentSubData.data);
      }
    } catch (error) {
      console.error('Subscription data loading error:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subscription data',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (priceId) => {
    setProcessing(true);
    try {
      const { sessionUrl } = await createCheckoutSession(priceId);
      window.location.href = sessionUrl;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create checkout session',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
      setProcessing(false);
    }
  };

  const handleManageSubscription = async () => {
    setProcessing(true);
    try {
      const { portalUrl } = await createPortalSession();
      window.location.href = portalUrl;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to access subscription portal',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
      setProcessing(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <PageTransition>
      <VStack spacing={8} align="stretch">
        <SectionHeading>Subscription Plans</SectionHeading>

        {currentPlan && (
          <Card>
            <VStack spacing={4} align="stretch">
              <Text fontSize="lg" fontWeight="bold">
                Current Plan
              </Text>
              <HStack justify="space-between">
                <VStack align="start">
                  <Text fontSize="xl" color={highlightColor}>
                    {currentPlan.name}
                  </Text>
                  {currentPlan.current_period_end && (
                    <Text color={textColor}>
                      Next billing date: {new Date(currentPlan.current_period_end).toLocaleDateString()}
                    </Text>
                  )}
                </VStack>
                <Button
                  onClick={handleManageSubscription}
                  isLoading={processing}
                  colorScheme="brand"
                >
                  Manage Subscription
                </Button>
              </HStack>
            </VStack>
          </Card>
        )}

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          {Array.isArray(plans) && plans.map((plan) => (
            <Card key={plan.id}>
              <VStack spacing={4} align="stretch">
                <Text fontSize="2xl" fontWeight="bold">
                  {plan.name}
                </Text>
                <Text fontSize="4xl" fontWeight="bold" color={highlightColor}>
                  ${plan.price}/mo
                </Text>
                <Text color={textColor}>{plan.description}</Text>
                
                <Button
                  colorScheme="brand"
                  size="lg"
                  onClick={() => handleSubscribe(plan.stripe_price_id)}
                  isLoading={processing}
                  isDisabled={currentPlan?.stripe_price_id === plan.stripe_price_id}
                >
                  {currentPlan?.stripe_price_id === plan.stripe_price_id ? 'Current Plan' : 'Subscribe'}
                </Button>
              </VStack>
            </Card>
          ))}
        </SimpleGrid>
      </VStack>
    </PageTransition>
  );
};

export default Subscription; 