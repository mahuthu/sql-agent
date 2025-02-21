import React, { useState, useEffect } from 'react';
import {
  SimpleGrid,
  VStack,
  Text,
  useColorModeValue,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Box,
} from '@chakra-ui/react';
import {
  Card,
  PageTransition,
  SectionHeading,
  AnimatedBadge,
} from './common';
import { LoadingSpinner } from './common/LoadingSpinner';
import { errorToast } from './common/Toast';
import { getUsageStats, getQueryHistory } from '../utils/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Move StatCard outside of Dashboard component
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

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentQueries, setRecentQueries] = useState([]);
  const [loading, setLoading] = useState(true);

  const textColor = useColorModeValue('gray.600', 'gray.300');
  const chartColor = useColorModeValue('brand.500', 'brand.200');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsData, queriesData] = await Promise.all([
        getUsageStats(),
        getQueryHistory()
      ]);
      setStats(statsData);
      setRecentQueries(queriesData.slice(0, 5));
    } catch (error) {
      errorToast('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <PageTransition>
      <VStack spacing={8} align="stretch">
        <SectionHeading>Dashboard</SectionHeading>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <StatCard
            label="Monthly Queries"
            value={stats.monthly_queries}
            helpText="Last 30 days"
          />
          <StatCard
            label="Success Rate"
            value={`${stats.success_rate.toFixed(1)}%`}
            helpText="Overall"
          />
          <StatCard
            label="Credits Remaining"
            value={stats.credits_remaining}
            helpText={`of ${stats.total_credits} total`}
          />
        </SimpleGrid>

        <Card>
          <VStack spacing={4} align="stretch">
            <Text fontSize="lg" fontWeight="bold">Query Usage Trend</Text>
            <Box height="300px">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.usage_trend}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="queries"
                    stroke={chartColor}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </VStack>
        </Card>

        <Card>
          <VStack spacing={4} align="stretch">
            <Text fontSize="lg" fontWeight="bold">Recent Queries</Text>
            {recentQueries.map((query) => (
              <Box
                key={query.id}
                p={4}
                borderWidth={1}
                borderRadius="md"
                borderColor={borderColor}
              >
                <Text fontWeight="medium">{query.question}</Text>
                <Text color={textColor} fontSize="sm">
                  {new Date(query.created_at).toLocaleString()}
                </Text>
                <AnimatedBadge
                  colorScheme={query.status === 'success' ? 'green' : 'red'}
                >
                  {query.status}
                </AnimatedBadge>
              </Box>
            ))}
          </VStack>
        </Card>
      </VStack>
    </PageTransition>
  );
};

export default Dashboard; 