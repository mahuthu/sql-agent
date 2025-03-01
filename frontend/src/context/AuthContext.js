import React, { createContext, useState, useContext, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import { login as apiLogin, register } from '../utils/api';
import { errorToast } from '../components/common/Toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      const response = await apiLogin(email, password);
      console.log('Login response:', response); // Debug log

      const { access_token, user } = response;
      
      // Store token and user data
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      return true;
    } catch (error) {
      console.error('Login error:', error.response?.data);
      errorToast(
        'Login Failed',
        error.response?.data?.detail || 'An error occurred during login'
      );
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const handleRegister = async (email, password) => {
    try {
      const response = await register({ email, password });
      toast({
        title: 'Registration Successful',
        description: 'Please login with your credentials',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 
                         (Array.isArray(error.response?.data) ? error.response.data[0]?.msg : 'Registration failed');
      
      toast({
        title: 'Registration Failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return false;
    }
  };

  // Function to update user data
  const updateUser = (userData) => {
    console.log('Updating user with:', userData); // Debug log
    setUser(userData);
  };

  // Make sure updateUser is included in the context value
  const value = {
    user,
    loading,
    login,
    logout,
    register: handleRegister,
    setUser,
    updateUser, // Add this to the context
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 