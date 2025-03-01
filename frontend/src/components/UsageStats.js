import React, { useEffect, useState } from 'react';
import {
  VStack,
  SimpleGrid,
  Text,
  Progress,
  useColorModeValue,
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Alert,
  AlertIcon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react';
import {
  Card,
  PageTransition,
  SectionHeading,
  AnimatedBadge,
} from './common';
import { LoadingSpinner } from './common/LoadingSpinner';
import { errorToast } from './common/Toast';
import { getUsageStats, getDetailedUsage } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const UsageStats = () => {
  const [stats, setStats] = useState(null);
  const [detailedUsage, setDetailedUsage] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const textColor = useColorModeValue('gray.600', 'gray.300');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    loadUsageData();
  }, []);

  const loadUsageData = async () => {
    try {
      const [statsResponse, usageResponse] = await Promise.all([
        getUsageStats(),
        getDetailedUsage()
      ]);

      // Calculate success rate from the stats data
      const statsData = statsResponse.data;
      const successRate = statsData.total_queries > 0
        ? ((statsData.successful_queries / statsData.total_queries) * 100)
        : 0;

      setStats({
        ...statsData,
        success_rate: successRate,
        total_credits: 1000, // Default value, should come from subscription
        credits_remaining: statsData.credits_remaining || 0,
      });
      
      setDetailedUsage(usageResponse.data.recent_queries || []);
    } catch (error) {
      console.error('Error loading usage data:', error);
      errorToast('Error', 'Failed to load usage data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!stats) return null;

  return (
    <PageTransition>
      <VStack spacing={8} align="stretch">
        <SectionHeading>Usage Statistics</SectionHeading>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <StatCard
            label="Total Queries"
            value={stats.total_queries || 0}
            helpText="All time"
          />
          <StatCard
            label="Success Rate"
            value={`${((stats.successful_queries / stats.total_queries) * 100 || 0).toFixed(1)}%`}
            helpText={`${stats.successful_queries} of ${stats.total_queries} queries`}
          />
          <StatCard
            label="Credits Remaining"
            value={user?.credits_remaining || 0}
            helpText={user?.subscription_status === 'free' ? 'Free Trial' : 'Premium'}
          />
        </SimpleGrid>

        {user?.subscription_status === 'free' && user?.credits_remaining <= 5 && (
          <Alert status="warning">
            <AlertIcon />
            Your free credits are running low! Subscribe to get unlimited queries.
          </Alert>
        )}

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <Card>
            <VStack spacing={4} align="stretch">
              <Text fontSize="lg" fontWeight="bold">Credits Usage</Text>
              <Box>
                <Text mb={2}>
                  {stats.credits_remaining} of {stats.total_credits} credits remaining
                </Text>
                <Progress
                  value={(stats.credits_remaining / stats.total_credits) * 100}
                  colorScheme="brand"
                  hasStripe
                  borderRadius="full"
                />
              </Box>
              <Text color={textColor} fontSize="sm">
                Based on your current subscription plan
              </Text>
            </VStack>
          </Card>

          <Card>
            <VStack spacing={4} align="stretch">
              <Text fontSize="lg" fontWeight="bold">Query Success Rate</Text>
              <Box>
                <Text mb={2}>{stats.success_rate.toFixed(1)}% Success Rate</Text>
                <Progress
                  value={stats.success_rate}
                  colorScheme={stats.success_rate > 80 ? 'green' : 'orange'}
                  hasStripe
                  borderRadius="full"
                />
              </Box>
              <Text color={textColor} fontSize="sm">
                Based on {stats.total_queries} total queries
              </Text>
            </VStack>
          </Card>
        </SimpleGrid>

        <Card>
          <VStack spacing={4} align="stretch">
            <Text fontSize="lg" fontWeight="bold">Recent Queries</Text>
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Date</Th>
                    <Th>Question</Th>
                    <Th>Status</Th>
                    <Th>Execution Time</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {detailedUsage.map((query) => (
                    <Tr key={query.id}>
                      <Td>{new Date(query.created_at).toLocaleDateString()}</Td>
                      <Td>{query.question}</Td>
                      <Td>
                        <AnimatedBadge
                          colorScheme={query.status === 'success' ? 'green' : 'red'}
                        >
                          {query.status}
                        </AnimatedBadge>
                      </Td>
                      <Td>{query.execution_time.toFixed(2)}ms</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </VStack>
        </Card>
      </VStack>
    </PageTransition>
  );
};

const StatCard = ({ label, value, helpText }) => {
  return (
    <Card>
      <Stat>
        <StatLabel>{label}</StatLabel>
        <StatNumber>{value}</StatNumber>
        <StatHelpText>{helpText}</StatHelpText>
      </Stat>
    </Card>
  );
};

export default UsageStats; 