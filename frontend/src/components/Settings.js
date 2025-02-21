import React, { useState } from 'react';
import {
  Box,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  useToast,
  Alert,
  AlertIcon,
  Divider,
  Switch,
  HStack,
  useColorMode,
} from '@chakra-ui/react';
import { updateUserSettings, refreshApiKey } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const { colorMode, toggleColorMode } = useColorMode();
  const toast = useToast();

  const handleRefreshApiKey = async () => {
    if (window.confirm('Are you sure? This will invalidate your current API key.')) {
      setLoading(true);
      try {
        const response = await refreshApiKey();
        updateUser({ ...user, api_key: response.data.api_key });
        toast({
          title: 'Success',
          description: 'API key refreshed successfully',
          status: 'success',
          duration: 5000,
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to refresh API key',
          status: 'error',
          duration: 5000,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Box maxW="container.md" mx="auto" p={8}>
      <VStack spacing={8} align="stretch">
        <Heading size="lg">Settings</Heading>

        <Box borderWidth={1} borderRadius="lg" p={6}>
          <VStack spacing={6} align="stretch">
            <Heading size="md">API Access</Heading>
            
            <FormControl>
              <FormLabel>API Key</FormLabel>
              <Input
                type={showApiKey ? 'text' : 'password'}
                value={user?.api_key || ''}
                isReadOnly
              />
              <HStack mt={2} spacing={4}>
                <Button size="sm" onClick={() => setShowApiKey(!showApiKey)}>
                  {showApiKey ? 'Hide' : 'Show'} API Key
                </Button>
                <Button
                  size="sm"
                  colorScheme="blue"
                  onClick={handleRefreshApiKey}
                  isLoading={loading}
                >
                  Refresh API Key
                </Button>
              </HStack>
            </FormControl>

            <Alert status="info" borderRadius="md">
              <AlertIcon />
              Keep your API key secure. Don't share it publicly.
            </Alert>
          </VStack>
        </Box>

        <Box borderWidth={1} borderRadius="lg" p={6}>
          <VStack spacing={6} align="stretch">
            <Heading size="md">Preferences</Heading>

            <FormControl display="flex" alignItems="center">
              <FormLabel mb="0">
                Dark Mode
              </FormLabel>
              <Switch
                isChecked={colorMode === 'dark'}
                onChange={toggleColorMode}
              />
            </FormControl>

            <FormControl display="flex" alignItems="center">
              <FormLabel mb="0">
                Email Notifications
              </FormLabel>
              <Switch
                defaultChecked={user?.email_notifications}
                onChange={async (e) => {
                  try {
                    await updateUserSettings({
                      email_notifications: e.target.checked
                    });
                    updateUser({
                      ...user,
                      email_notifications: e.target.checked
                    });
                  } catch (error) {
                    toast({
                      title: 'Error',
                      description: 'Failed to update settings',
                      status: 'error',
                      duration: 5000,
                    });
                  }
                }}
              />
            </FormControl>
          </VStack>
        </Box>

        <Box borderWidth={1} borderRadius="lg" p={6}>
          <VStack spacing={6} align="stretch">
            <Heading size="md">Subscription</Heading>
            <Text>
              Current Plan: <strong>{user?.subscription_status}</strong>
            </Text>
            <Text>
              Credits Remaining: <strong>{user?.credits_remaining}</strong>
            </Text>
            <Button
              colorScheme="purple"
              onClick={() => window.location.href = '/subscription'}
            >
              Manage Subscription
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};

export default Settings; 