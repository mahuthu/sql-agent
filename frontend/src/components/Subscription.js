import React, { useState, useEffect } from 'react';
import {
  VStack,
  SimpleGrid,
  Text,
  Button,
  useColorModeValue,
  Box,
  List,
  ListItem,
  ListIcon,
  Divider,
  HStack,
} from '@chakra-ui/react';
import { CheckIcon } from '@chakra-ui/icons';
import {
  Card,
  PageTransition,
  SectionHeading,
  AnimatedBadge,
} from './common';
import { LoadingSpinner } from './common/LoadingSpinner';
import { errorToast } from './common/Toast';
import {
  getSubscriptionPlans,
  getCurrentSubscription,
  createCheckoutSession,
  createPortalSession,
} from '../utils/api';

const Subscription = () => {
  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const textColor = useColorModeValue('gray.600', 'gray.300');
  const highlightColor = useColorModeValue('brand.500', 'brand.200');

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      const [plansData, currentSubData] = await Promise.all([
        getSubscriptionPlans(),
        getCurrentSubscription(),
      ]);
      setPlans(plansData);
      setCurrentPlan(currentSubData);
    } catch (error) {
      errorToast('Error', 'Failed to load subscription data');
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
      errorToast('Error', 'Failed to create checkout session');
      setProcessing(false);
    }
  };

  const handleManageSubscription = async () => {
    setProcessing(true);
    try {
      const { portalUrl } = await createPortalSession();
      window.location.href = portalUrl;
    } catch (error) {
      errorToast('Error', 'Failed to access subscription portal');
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
                  <Text color={textColor}>
                    Next billing date: {new Date(currentPlan.current_period_end).toLocaleDateString()}
                  </Text>
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
          {plans.map((plan) => (
            <Card key={plan.id}>
              <VStack spacing={4} align="stretch">
                <Text fontSize="2xl" fontWeight="bold">
                  {plan.name}
                </Text>
                <Text fontSize="4xl" fontWeight="bold" color={highlightColor}>
                  ${plan.price}/mo
                </Text>
                <Text color={textColor}>{plan.description}</Text>
                
                <Divider />
                
                <List spacing={3}>
                  {plan.features.map((feature, index) => (
                    <ListItem key={index}>
                      <ListIcon as={CheckIcon} color={highlightColor} />
                      {feature}
                    </ListItem>
                  ))}
                </List>
                
                <Button
                  colorScheme="brand"
                  size="lg"
                  onClick={() => handleSubscribe(plan.price_id)}
                  isLoading={processing}
                  isDisabled={currentPlan?.price_id === plan.price_id}
                >
                  {currentPlan?.price_id === plan.price_id ? 'Current Plan' : 'Subscribe'}
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