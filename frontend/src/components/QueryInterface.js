import React, { useState, useEffect } from 'react';
import {
  Box,
  Input,
  Button,
  VStack,
  Text,
  useToast,
  Spinner,
  Code,
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { executeQuery, getTemplate, getQueryHistory } from '../utils/api';
import {
  Card,
  PageTransition,
  AnimatedButton,
  FormInput,
  SectionHeading,
  AnimatedBadge,
} from './common';
import { LoadingSpinner } from './common/LoadingSpinner';
import { useCustomToast } from '../hooks/useCustomToast';
import QueryHistory from './QueryHistory';

const QueryInterface = () => {
  const { templateId } = useParams();
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [template, setTemplate] = useState(null);
  const [queryHistory, setQueryHistory] = useState([]);
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const resultsBgColor = useColorModeValue('gray.50', 'gray.700');
  const [selectedHistoryQuery, setSelectedHistoryQuery] = useState(null);
  const { showSuccessToast, showErrorToast } = useCustomToast();
  const toast = useToast();

  useEffect(() => {
    loadTemplate();
    loadQueryHistory();
  }, [templateId]);

  const loadTemplate = async () => {
    try {
      const data = await getTemplate(templateId);
      setTemplate(data);
    } catch (error) {
      showErrorToast('Error', 'Failed to load template');
    }
  };

  // const loadQueryHistory = async () => {
  //   try {
  //     const history = await getQueryHistory();
  //     console.log(history)
  //     const filteredHistory = history.filter(item => item.template_id === templateId);
  //     console.log(filteredHistory)
  //     setQueryHistory(filteredHistory);
  //   } catch (error) {
  //     console.error('Error loading query history:', error);
  //   }
  // };


  // const loadQueryHistory = async () => {
  //   try {
  //     const response = await getQueryHistory();
  //     console.log(response);
      
  //     // Check if response has data property and it's an array
  //     if (response.data && Array.isArray(response.data)) {
  //       const filteredHistory = response.data.filter(item => item.template_id === templateId);
  //       console.log("filtered history",filteredHistory);
  //       setQueryHistory(filteredHistory);
  //     } else {
  //       console.error('Invalid query history format:', response);
  //       setQueryHistory([]);
  //     }
  //   } catch (error) {
  //     console.error('Error loading query history:', error);
  //     setQueryHistory([]);
  //   }
  // };

  const loadQueryHistory = async () => {
    try {
      const response = await getQueryHistory();
      console.log(response);
      
      if (response.data && Array.isArray(response.data)) {
        // Convert templateId to number for comparison
        const templateIdNum = parseInt(templateId, 10);
        console.log("Current template ID:", templateIdNum, "Type:", typeof templateIdNum);
        
        // Log a sample item to check its type
        if (response.data.length > 0) {
          console.log("Sample item template_id:", response.data[0].template_id, "Type:", typeof response.data[0].template_id);
        }
        
        const filteredHistory = response.data.filter(item => item.template_id === templateIdNum);
        console.log("filtered history", filteredHistory);
        setQueryHistory(filteredHistory);
      } else {
        console.error('Invalid query history format:', response);
        setQueryHistory([]);
      }
    } catch (error) {
      console.error('Error loading query history:', error);
      setQueryHistory([]);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await executeQuery(templateId, { question });
      setResult(data.result);
      showSuccessToast('Success', 'Query executed successfully');
    } catch (error) {
      if (error.response?.status === 402) {
        toast({
          title: 'Credits Exhausted',
          description: 'You have used all your free credits. Please subscribe to continue.',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
        toast({
          render: () => (
            <Box
              p={3}
              bg="blue.500"
              color="white"
              borderRadius="md"
              cursor="pointer"
              onClick={() => window.location.href = '/subscription'}
            >
              Click here to subscribe and get unlimited queries!
            </Box>
          ),
          duration: null,
          isClosable: true,
        });
      } else {
        showErrorToast('Error', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryQuerySelect = (query) => {
    setQuestion(query.question);
    // Optionally scroll to query input or show results
  };

  const renderQueryResults = () => {
    if (!result) return null;

    // If result is an array of objects (table-like data)
    if (Array.isArray(result) && result.length > 0 && typeof result[0] === 'object') {
      const columns = Object.keys(result[0]);
      
      return (
        <Card>
          <VStack align="stretch" spacing={4}>
            <AnimatedBadge>Query Results</AnimatedBadge>
            <TableContainer>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    {columns.map((column) => (
                      <Th key={column}>{column}</Th>
                    ))}
                  </Tr>
                </Thead>
                <Tbody>
                  {result.map((row, rowIndex) => (
                    <Tr key={rowIndex}>
                      {columns.map((column) => (
                        <Td key={`${rowIndex}-${column}`} whiteSpace="pre-wrap">
                          {formatCellValue(row[column])}
                        </Td>
                      ))}
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </VStack>
        </Card>
      );
    }

    // For non-tabular data, show as formatted JSON
    return (
      <Card>
        <VStack align="stretch" spacing={4}>
          <AnimatedBadge>Query Results</AnimatedBadge>
          <Box 
            overflowX="auto" 
            whiteSpace="pre-wrap"
            p={4}
            borderRadius="md"
            bg={resultsBgColor}
          >
            <Code 
              display="block" 
              whiteSpace="pre-wrap"
              p={4}
              borderRadius="md"
              width="100%"
              fontSize="sm"
            >
              {typeof result === 'object' 
                ? JSON.stringify(result, null, 2)
                : String(result)
              }
            </Code>
          </Box>
        </VStack>
      </Card>
    );
  };

  const formatCellValue = (value) => {
    if (value === null) return 'NULL';
    if (typeof value === 'object') return JSON.stringify(value);
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (value instanceof Date) return value.toLocaleString();
    return String(value);
  };

  return (
    <PageTransition>
      <VStack spacing={8} align="stretch">
        <SectionHeading>SQL Query Interface</SectionHeading>
        
        <Card>
          <VStack spacing={4}>
            <Text color={textColor}>
              Enter your question here:
            </Text>
            
            <FormInput
              placeholder="e.g., What were the total sales last month?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            
            <AnimatedButton
              colorScheme="brand"
              isLoading={loading}
              onClick={handleSubmit}
            >
              Execute Query
            </AnimatedButton>
          </VStack>
        </Card>

        {loading && <LoadingSpinner message="Executing query..." />}

        {/* Results section */}
        {!loading && result && renderQueryResults()}

        {/* Query History Section */}
        <QueryHistory history={queryHistory} onSelectQuery={handleHistoryQuerySelect} />
      </VStack>
    </PageTransition>
  );
};

export default QueryInterface; 