import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  Heading,
  Text,
  useToast,
  SimpleGrid,
  Icon,
  Card,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { PageTransition } from './common';

const ContactInfo = ({ icon, title, content }) => {
  return (
    <Card p={5} shadow="md">
      <VStack spacing={3} align="center">
        <Icon as={icon} w={6} h={6} color="brand.500" />
        <Text fontWeight="bold">{title}</Text>
        <Text textAlign="center" color={useColorModeValue('gray.600', 'gray.300')}>
          {content}
        </Text>
      </VStack>
    </Card>
  );
};

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Add your API call here to handle form submission
      // const response = await api.post('/contact', formData);
      
      toast({
        title: 'Message Sent!',
        description: "We'll get back to you as soon as possible.",
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition>
      <Box bg={bgColor} py={10}>
        <Container maxW="container.xl">
          <VStack spacing={10}>
            {/* Header Section */}
            <VStack spacing={3} textAlign="center">
              <Heading 
                as="h1" 
                size="xl"
                bgGradient="linear(to-r, brand.500, brand.700)"
                bgClip="text"
              >
                Get in Touch
              </Heading>
              <Text fontSize="lg" color={useColorModeValue('gray.600', 'gray.300')}>
                Have questions? We'd love to hear from you.
              </Text>
            </VStack>

            {/* Contact Information Cards */}
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} w="full">
              <ContactInfo
                icon={FaEnvelope}
                title="Email"
                content="support@sqlagent.com"
              />
              <ContactInfo
                icon={FaPhone}
                title="Phone"
                content="+1 (555) 123-4567"
              />
              <ContactInfo
                icon={FaMapMarkerAlt}
                title="Location"
                content="123 Business Street, Tech City, TC 12345"
              />
            </SimpleGrid>

            {/* Contact Form */}
            <Card p={8} w="full" maxW="800px" shadow="lg">
              <form onSubmit={handleSubmit}>
                <VStack spacing={4}>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                    <FormControl isRequired>
                      <FormLabel>Name</FormLabel>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Your name"
                      />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel>Email</FormLabel>
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="your.email@example.com"
                      />
                    </FormControl>
                  </SimpleGrid>
                  <FormControl isRequired>
                    <FormLabel>Subject</FormLabel>
                    <Input
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="What is this regarding?"
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Message</FormLabel>
                    <Textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Your message"
                      rows={6}
                    />
                  </FormControl>
                  <Button
                    type="submit"
                    colorScheme="brand"
                    size="lg"
                    w="full"
                    isLoading={isLoading}
                  >
                    Send Message
                  </Button>
                </VStack>
              </form>
            </Card>
          </VStack>
        </Container>
      </Box>
    </PageTransition>
  );
};

export default Contact; 