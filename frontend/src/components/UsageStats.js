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

const UsageStats = () => {
  const [stats, setStats] = useState(null);
  const [detailedUsage, setDetailedUsage] = useState([]);
  const [loading, setLoading] = useState(true);

  const textColor = useColorModeValue('gray.600', 'gray.300');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    loadUsageData();
  }, []);

  const loadUsageData = async () => {
    try {
      const [statsData, usageData] = await Promise.all([
        getUsageStats(),
        getDetailedUsage()
      ]);
      setStats(statsData);
      setDetailedUsage(usageData);
    } catch (error) {
      errorToast('Error', 'Failed to load usage data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <PageTransition>
      <VStack spacing={8} align="stretch">
        <SectionHeading>Usage Statistics</SectionHeading>

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
                Credits reset on {new Date(stats.next_reset).toLocaleDateString()}
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
            <Text fontSize="lg" fontWeight="bold">Detailed Usage</Text>
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Date</Th>
                    <Th>Queries</Th>
                    <Th>Credits Used</Th>
                    <Th>Status</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {detailedUsage.map((usage) => (
                    <Tr key={usage.id}>
                      <Td>{new Date(usage.date).toLocaleDateString()}</Td>
                      <Td>{usage.queries_count}</Td>
                      <Td>{usage.credits_used}</Td>
                      <Td>
                        <AnimatedBadge
                          colorScheme={usage.status === 'success' ? 'green' : 'red'}
                        >
                          {usage.status}
                        </AnimatedBadge>
                      </Td>
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

export default UsageStats; 