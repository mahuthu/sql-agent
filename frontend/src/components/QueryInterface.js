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
} from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { executeQuery, getTemplate } from '../utils/api';
import {
  Card,
  PageTransition,
  AnimatedButton,
  FormInput,
  SectionHeading,
  AnimatedBadge,
} from './common';
import { LoadingSpinner } from './common/LoadingSpinner';
import { successToast, errorToast } from './common/Toast';
import QueryHistory from './QueryHistory';

const QueryInterface = () => {
  const { templateId } = useParams();
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [template, setTemplate] = useState(null);
  const toast = useToast();
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const [selectedHistoryQuery, setSelectedHistoryQuery] = useState(null);

  useEffect(() => {
    loadTemplate();
  }, [templateId]);

  const loadTemplate = async () => {
    try {
      const data = await getTemplate(templateId);
      setTemplate(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load template',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await executeQuery(templateId, { question });
      setResult(data.result);
      successToast('Success', 'Query executed successfully');
    } catch (error) {
      errorToast('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryQuerySelect = (query) => {
    setQuestion(query.question);
    // Optionally scroll to query input or show results
  };

  return (
    <PageTransition>
      <VStack spacing={8} align="stretch">
        <SectionHeading>SQL Query Interface</SectionHeading>
        
        <Card>
          <VStack spacing={4}>
            <Text color={textColor}>
              Enter your question in natural language:
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
        {!loading && result && (
          <Card>
            <VStack align="stretch" spacing={4}>
              <AnimatedBadge>Query Results</AnimatedBadge>
              <Code p={4} borderRadius="md" width="100%">
                <pre>{JSON.stringify(result, null, 2)}</pre>
              </Code>
            </VStack>
          </Card>
        )}

        {/* Query History Section */}
        <QueryHistory onSelectQuery={handleHistoryQuerySelect} />
      </VStack>
    </PageTransition>
  );
};

export default QueryInterface; 