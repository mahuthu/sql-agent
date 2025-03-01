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

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      errorToast('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const success = await register(formData.email, formData.password);
      if (success) {
        navigate('/login');
      }
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <VStack spacing={8} mx="auto" maxW="md" px={6}>
        <SectionHeading>Create an Account</SectionHeading>
        
        <Card w="full">
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Email Address</FormLabel>
                <FormInput
                  type="email"
                  value={formData.email}
                  onChange={(e) => 
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="Enter your email"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <FormInput
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Enter your password"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Confirm Password</FormLabel>
                <FormInput
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  placeholder="Confirm your password"
                />
              </FormControl>

              <AnimatedButton
                type="submit"
                colorScheme="brand"
                width="full"
                isLoading={loading}
              >
                Register
              </AnimatedButton>
            </VStack>
          </form>
        </Card>

        <Text color={textColor}>
          Already have an account?{' '}
          <Link as={RouterLink} to="/login" color="brand.500">
            Login here
          </Link>
        </Text>
      </VStack>
    </PageTransition>
  );
};

export default Register; 