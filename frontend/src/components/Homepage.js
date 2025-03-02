import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaDatabase, FaKey, FaFileAlt } from 'react-icons/fa';
import { PageTransition } from './common';

const Feature = ({ icon, title, text }) => {
  return (
    <VStack
      p={5}
      bg={useColorModeValue('white', 'gray.800')}
      rounded="xl"
      shadow="md"
      spacing={4}
      align="start"
      height="100%"
    >
      <Icon as={icon} w={10} h={10} color="brand.500" />
      <Heading size="md">{title}</Heading>
      <Text color={useColorModeValue('gray.600', 'gray.300')}>{text}</Text>
    </VStack>
  );
};

const Homepage = () => {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const buttonColorScheme = 'brand';

  return (
    <PageTransition>
      {/* Hero Section */}
      <Box bg={bgColor} py={20}>
        <Container maxW="container.xl">
          <VStack spacing={8} textAlign="center">
            <Heading
              as="h1"
              size="2xl"
              bgGradient="linear(to-r, brand.500, brand.700)"
              bgClip="text"
            >
              Talk to Your Data
            </Heading>
            <Text fontSize="xl" color={useColorModeValue('gray.600', 'gray.300')}>
              Transform your data interactions with natural language queries.
              Get instant insights from your databases without writing SQL.
            </Text>
            <HStack spacing={4}>
              <Button
                as={RouterLink}
                to="/contact"
                colorScheme={buttonColorScheme}
                size="lg"
              >
                Request Demo
              </Button>
              <Button
                as={RouterLink}
                to="/register"
                colorScheme={buttonColorScheme}
                variant="outline"
                size="lg"
              >
                Get Started
              </Button>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxW="container.xl" py={20}>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10}>
          <Feature
            icon={FaDatabase}
            title="Query Templates"
            text="Create custom query templates to define the structure and context of your data queries. Easily map natural language to SQL queries."
          />
          <Feature
            icon={FaKey}
            title="API Integration"
            text="Secure API keys for seamless integration. Build your own chatbot solutions using our powerful API endpoints."
          />
          <Feature
            icon={FaFileAlt}
            title="Documentation"
            text="Comprehensive documentation and examples to help you get started with query templates and API integration."
          />
        </SimpleGrid>
      </Container>

      {/* How It Works Section */}
      <Box bg={useColorModeValue('white', 'gray.800')} py={20}>
        <Container maxW="container.xl">
          <VStack spacing={12}>
            <Heading as="h2" size="xl">
              How It Works
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
              <VStack align="start" spacing={4}>
                <Heading size="md">Creating Query Templates</Heading>
                <Text>
                  1. Navigate to the Dashboard
                  <br />
                  2. Click "Create Template"
                  <br />
                  3. Define your database schema
                  <br />
                  4. Set up sample queries
                  <br />
                  5. Test and refine your template
                </Text>
              </VStack>
              <VStack align="start" spacing={4}>
                <Heading size="md">Using API Keys</Heading>
                <Text>
                  1. Generate an API key in your settings
                  <br />
                  2. Use the key in your API requests
                  <br />
                  3. Make POST requests to our endpoints
                  <br />
                  4. Receive natural language responses
                  <br />
                  5. Integrate with your applications
                </Text>
              </VStack>
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>
    </PageTransition>
  );
};

export default Homepage; 