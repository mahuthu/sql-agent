import React, { useState } from 'react';
import {
  VStack,
  FormControl,
  FormLabel,
  useColorModeValue,
  Text,
  Link,
  useToast,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Card,
  PageTransition,
  AnimatedButton,
  FormInput,
  SectionHeading,
} from './common';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  
  const textColor = useColorModeValue('gray.600', 'gray.300');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const success = await login(formData.email, formData.password);
      if (success) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login Failed',
        description: error.response?.data?.detail || 'An error occurred during login',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <VStack spacing={8} mx="auto" maxW="md" px={6}>
        <SectionHeading>Welcome Back</SectionHeading>
        
        <Card w="full">
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Email Address</FormLabel>
                <FormInput
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <FormInput
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter your password"
                />
              </FormControl>

              <AnimatedButton
                type="submit"
                colorScheme="brand"
                width="full"
                isLoading={loading}
              >
                Login
              </AnimatedButton>
            </VStack>
          </form>
        </Card>

        <Text color={textColor}>
          Don't have an account?{' '}
          <Link as={RouterLink} to="/register" color="brand.500">
            Register here
          </Link>
        </Text>
      </VStack>
    </PageTransition>
  );
};

export default Login; 