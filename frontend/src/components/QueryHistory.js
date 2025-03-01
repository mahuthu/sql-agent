import React from 'react';
import {
  VStack,
  Text,
  useColorModeValue,
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Tooltip,
  HStack,
  Badge,
  Button,
} from '@chakra-ui/react';
import { RepeatIcon, ViewIcon } from '@chakra-ui/icons';
import { useQueryHistory } from '../hooks/useQueryHistory';
import {
  Card,
  PageTransition,
  SectionHeading,
  AnimatedBadge,
} from './common';
import { LoadingSpinner } from './common/LoadingSpinner';

const QueryHistory = ({ onSelectQuery }) => {
  const { history, loading, refreshHistory } = useQueryHistory();
  const textColor = useColorModeValue('gray.600', 'gray.300');

  if (loading) return <LoadingSpinner />;

  return (
    <Card>
      <VStack spacing={4} align="stretch">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Text fontSize="lg" fontWeight="bold">Query History</Text>
          <IconButton
            icon={<RepeatIcon />}
            onClick={refreshHistory}
            size="sm"
            variant="ghost"
            aria-label="Refresh history"
          />
        </Box>

        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Timestamp</Th>
                <Th>Template</Th>
                <Th>Question</Th>
                <Th>Status</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {history.map((item) => (
                <Tr key={item.id}>
                  <Td>{new Date(item.created_at).toLocaleString()}</Td>
                  <Td>{item.template_id}</Td>
                  <Td>
                    <Text color={textColor} noOfLines={1}>
                      {item.question}
                    </Text>
                  </Td>
                  <Td>
                    <AnimatedBadge
                      colorScheme={item.status === 'success' ? 'green' : 'red'}
                    >
                      {item.status}
                    </AnimatedBadge>
                  </Td>
                  <Td>
                    <Tooltip label="View Query">
                      <IconButton
                        icon={<ViewIcon />}
                        size="sm"
                        variant="ghost"
                        onClick={() => onSelectQuery(item)}
                        aria-label="View query"
                      />
                    </Tooltip>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </VStack>
    </Card>
  );
};

export default QueryHistory; 