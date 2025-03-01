import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@chakra-ui/react';
import {
  Grid,
  useColorModeValue,
  VStack,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
} from '@chakra-ui/react';
import { AddIcon, SettingsIcon } from '@chakra-ui/icons';
import {
  Card,
  PageTransition,
  AnimatedButton,
  SectionHeading,
  AnimatedBadge,
} from './common';
import { LoadingSpinner } from './common/LoadingSpinner';
import { getTemplates, deleteTemplate } from '../utils/api';

const TemplateList = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  useEffect(() => {
    loadTemplates();
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
        isClosable: true,
        position: 'top-right',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await deleteTemplate(id);
        toast({
          title: 'Success',
          description: 'Template deleted successfully',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });
        loadTemplates();
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete template',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });
      }
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <PageTransition>
      <VStack spacing={8} align="stretch">
        <SectionHeading>
          Query Templates
          <AnimatedButton
            leftIcon={<AddIcon />}
            onClick={() => navigate('/templates/new')}
            ml="auto"
            size="sm"
          >
            New Template
          </AnimatedButton>
        </SectionHeading>

        <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={6}>
          {templates.map((template) => (
            <Card key={template.id}>
              <VStack align="stretch" spacing={3}>
                <Text fontSize="xl" fontWeight="bold">
                  {template.name}
                </Text>
                <Text color={textColor} noOfLines={2}>
                  {template.description}
                </Text>
                <AnimatedBadge>
                  {template.is_public ? 'Public' : 'Private'}
                </AnimatedBadge>
                
                <Menu>
                  <MenuButton
                    as={IconButton}
                    icon={<SettingsIcon />}
                    variant="ghost"
                    size="sm"
                  />
                  <MenuList>
                    <MenuItem onClick={() => navigate(`/query/${template.id}`)}>
                      Query
                    </MenuItem>
                    <MenuItem onClick={() => navigate(`/templates/${template.id}/edit`)}>
                      Edit
                    </MenuItem>
                    <MenuItem onClick={() => handleDelete(template.id)} color="red.500">
                      Delete
                    </MenuItem>
                  </MenuList>
                </Menu>
              </VStack>
            </Card>
          ))}
        </Grid>
      </VStack>
    </PageTransition>
  );
};

export default TemplateList; 