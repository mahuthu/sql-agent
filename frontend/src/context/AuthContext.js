import React, { createContext, useState, useContext, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import { login, register, refreshToken } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const apiKey = localStorage.getItem('apiKey');
    const userData = localStorage.getItem('user');
    
    if (apiKey && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  };

  const handleLogin = async (email, password) => {
    try {
      const response = await login({ email, password });
      localStorage.setItem('apiKey', response.api_key);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
      return true;
    } catch (error) {
      toast({
        title: 'Login Failed',
        description: error.response?.data?.detail || 'An error occurred',
        status: 'error',
        duration: 5000,
      });
      return false;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('apiKey');
    localStorage.removeItem('user');
    setUser(null);
  };

  const handleRegister = async (userData) => {
    try {
      const response = await register(userData);
      toast({
        title: 'Registration Successful',
        description: 'Please login with your credentials',
        status: 'success',
        duration: 5000,
      });
      return true;
    } catch (error) {
      toast({
        title: 'Registration Failed',
        description: error.response?.data?.detail || 'An error occurred',
        status: 'error',
        duration: 5000,
      });
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login: handleLogin,
        logout: handleLogout,
        register: handleRegister,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 