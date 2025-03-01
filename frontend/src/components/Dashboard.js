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
  useToast,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import {
  Card,
  PageTransition,
  SectionHeading,
  AnimatedBadge,
} from './common';
import { LoadingSpinner } from './common/LoadingSpinner';
import { getUsageStats, getQueryHistory } from '../utils/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';

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
  const toast = useToast();
  const { user } = useAuth();

  const textColor = useColorModeValue('gray.600', 'gray.300');
  const chartColor = useColorModeValue('brand.500', 'brand.200');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsResponse, queriesResponse] = await Promise.all([
        getUsageStats(),
        getQueryHistory()
      ]);

      // Calculate success rate from the stats data
      const statsData = statsResponse.data;
      const successRate = statsData.total_queries > 0
        ? ((statsData.successful_queries / statsData.total_queries) * 100)
        : 0;

      setStats({
        ...statsData,
        success_rate: successRate,
        monthly_queries: statsData.total_queries,
        credits_remaining: statsData.credits_remaining || 0,
        total_credits: statsData.total_credits || 1000, // Default value
      });

      setRecentQueries(queriesResponse.data.slice(0, 5));
    } catch (error) {
      console.error('Dashboard data loading error:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!stats) return null;

  return (
    <PageTransition>
      <VStack spacing={8} align="stretch">
        <SectionHeading>Dashboard</SectionHeading>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <StatCard
            label="Monthly Queries"
            value={stats.monthly_queries || 0}
            helpText="Last 30 days"
          />
          <StatCard
            label="Success Rate"
            value={`${stats.success_rate.toFixed(1)}%`}
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

        <Card>
          <VStack spacing={4} align="stretch">
            <Text fontSize="lg" fontWeight="bold">Query Usage Trend</Text>
            <Box height="300px">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={Object.entries(stats.queries_by_day).map(([date, data]) => ({
                  date,
                  queries: data.total,
                  successful: data.successful,
                  failed: data.failed
                }))}>
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