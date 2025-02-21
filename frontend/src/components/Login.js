import React, { useState } from 'react';
import {
  VStack,
  FormControl,
  FormLabel,
  useColorModeValue,
  Text,
  Link,
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
import { errorToast } from './common/Toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const history = useNavigate();
  
  const textColor = useColorModeValue('gray.600', 'gray.300');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login(email, password);
      history.push('/');
    } catch (error) {
      errorToast('Login Failed', error.message);
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <FormInput
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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