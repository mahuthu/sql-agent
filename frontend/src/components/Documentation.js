import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Code,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { PageTransition } from './common';

const Documentation = () => {
  const codeBg = useColorModeValue('gray.100', 'gray.700');

  return (
    <PageTransition>
      <Container maxW="container.xl" py={10}>
        <VStack spacing={8} align="stretch">
          <Heading as="h1">API Documentation</Heading>
          
          <Box>
            <Heading size="md" mb={4}>Authentication</Heading>
            <Text mb={4}>
              All API requests must include your API key in the Authorization header:
            </Text>
            <Code p={4} bg={codeBg} borderRadius="md" display="block">
              Authorization: Bearer YOUR_API_KEY
            </Code>
          </Box>

          <Box>
            <Heading size="md" mb={4}>Query Templates</Heading>
            <Text mb={4}>
              Create a new query template:
            </Text>
            <Code p={4} bg={codeBg} borderRadius="md" display="block">
              POST /api/v1/templates
              {`
{
  "name": "Sales Analysis",
  "description": "Template for analyzing sales data",
  "schema": "CREATE TABLE sales...",
  "sample_queries": [
    "What were the total sales last month?",
    "Show me top selling products"
  ]
}`}
            </Code>
          </Box>

          <Box>
            <Heading size="md" mb={4}>Making Queries</Heading>
            <Text mb={4}>
              Execute a natural language query:
            </Text>
            <Code p={4} bg={codeBg} borderRadius="md" display="block">
              POST /api/v1/queries
              {`
{
  "template_id": "123",
  "question": "What were the total sales last month?"
}`}
            </Code>
          </Box>
        </VStack>
      </Container>
    </PageTransition>
  );
};

export default Documentation; 