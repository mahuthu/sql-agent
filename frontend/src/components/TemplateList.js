import React, { useState, useEffect } from 'react';
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
import { useNavigate } from 'react-router-dom';
import {
  Card,
  PageTransition,
  AnimatedButton,
  SectionHeading,
  AnimatedBadge,
} from './common';
import { LoadingSpinner } from './common/LoadingSpinner';
import { errorToast, successToast } from './common/Toast';
import { getTemplates, deleteTemplate } from '../utils/api';

const TemplateList = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const history = useNavigate();

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
      errorToast('Error', 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await deleteTemplate(id);
        successToast('Success', 'Template deleted successfully');
        loadTemplates();
      } catch (error) {
        errorToast('Error', 'Failed to delete template');
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
            onClick={() => history.push('/templates/new')}
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
                    <MenuItem onClick={() => history.push(`/query/${template.id}`)}>
                      Query
                    </MenuItem>
                    <MenuItem onClick={() => history.push(`/templates/${template.id}/edit`)}>
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