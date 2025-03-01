import React, { useState, useEffect } from 'react';
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
  Code,
  useColorMode,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@chakra-ui/react';
import { updateUserSettings, refreshApiKey, getTemplates } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [templates, setTemplates] = useState([]);
  const { colorMode, toggleColorMode } = useColorMode();
  const toast = useToast();

  useEffect(() => {
    loadTemplates();
    loadUserData();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await getTemplates();
      setTemplates(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load templates',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const loadUserData = async () => {
    try {
      const response = await api.get('/users/fix-credits');
      if (response.data && response.data.data) {
        updateUser({
          ...user,
          credits_remaining: response.data.data.credits_remaining
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleRefreshApiKey = async () => {
    if (window.confirm('Are you sure? This will invalidate your current API key.')) {
      setLoading(true);
      try {
        const response = await refreshApiKey();
        console.log('Refresh API key response:', response);
        
        if (response && response.data && response.data.api_key) {
          updateUser({ 
            ...user, 
            api_key: response.data.api_key 
          });
          
          toast({
            title: 'Success',
            description: 'API key refreshed successfully',
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
        } else {
          console.error('Invalid response structure:', response);
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('API key refresh error:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to refresh API key',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const renderApiUsageInstructions = () => (
    <Box mt={4}>
      <Text fontWeight="bold" mb={2}>API Usage Instructions:</Text>
      <Code p={4} borderRadius="md" display="block" whiteSpace="pre-wrap">
{`// Example API usage with fetch:
const response = await fetch('${process.env.REACT_APP_API_BASE_URL}/queries/{template_id}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    question: "Your natural language question"
  })
});`}
      </Code>
    </Box>
  );

  const renderTemplatesList = () => (
    <Box mt={4}>
      <Text fontWeight="bold" mb={2}>Your Available Templates:</Text>
      <Table size="sm">
        <Thead>
          <Tr>
            <Th>Template ID</Th>
            <Th>Name</Th>
            <Th>Description</Th>
          </Tr>
        </Thead>
        <Tbody>
          {templates.map((template) => (
            <Tr key={template.id}>
              <Td>{template.id}</Td>
              <Td>{template.name}</Td>
              <Td>{template.description}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );

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
                  Generate New API Key
                </Button>
              </HStack>
            </FormControl>

            <Alert status="info" borderRadius="md">
              <AlertIcon />
              This API key can be used to access all your templates. Keep it secure.
            </Alert>

            {renderApiUsageInstructions()}
            {renderTemplatesList()}
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
            <Heading size="md">Usage & Credits</Heading>
            
            <HStack justify="space-between">
              <Text>Credits Remaining:</Text>
              <Text fontWeight="bold" color={user?.credits_remaining <= 5 ? "red.500" : "green.500"}>
                {user?.credits_remaining || 0}
              </Text>
            </HStack>
            
            {user?.subscription_status === "free" && user?.credits_remaining <= 5 && (
              <Alert status="warning">
                <AlertIcon />
                Your free credits are running low. Subscribe to get unlimited queries!
              </Alert>
            )}
            
            <Button
              colorScheme="purple"
              onClick={() => window.location.href = '/subscription'}
              isDisabled={user?.subscription_status !== "free"}
            >
              {user?.subscription_status === "free" ? "Upgrade to Premium" : "Manage Subscription"}
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};

export default Settings; 

