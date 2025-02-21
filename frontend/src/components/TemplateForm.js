import React, { useState, useEffect } from 'react';
import {
  VStack,
  FormControl,
  FormLabel,
  Textarea,
  Switch,
  IconButton,
  useColorModeValue,
  HStack,
  Box,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  PageTransition,
  AnimatedButton,
  FormInput,
  SectionHeading,
} from './common';
import { LoadingSpinner } from './common/LoadingSpinner';
import { successToast, errorToast } from './common/Toast';
import { getTemplate, createTemplate, updateTemplate } from '../utils/api';

const TemplateForm = () => {
  const { id } = useParams();
  const history = useNavigate();
  const [loading, setLoading] = useState(id ? true : false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    database_uri: '',
    example_queries: [{ question: '', query: '' }],
    is_public: false,
  });

  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    if (id) {
      loadTemplate();
    }
  }, [id]);

  const loadTemplate = async () => {
    try {
      const data = await getTemplate(id);
      setFormData(data);
    } catch (error) {
      errorToast('Error', 'Failed to load template');
      history.push('/templates');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (id) {
        await updateTemplate(id, formData);
        successToast('Success', 'Template updated successfully');
      } else {
        await createTemplate(formData);
        successToast('Success', 'Template created successfully');
      }
      history.push('/templates');
    } catch (error) {
      errorToast('Error', error.message);
    } finally {
      setSaving(false);
    }
  };

  const addExampleQuery = () => {
    setFormData({
      ...formData,
      example_queries: [
        ...formData.example_queries,
        { question: '', query: '' }
      ]
    });
  };

  const removeExampleQuery = (index) => {
    const newQueries = formData.example_queries.filter((_, i) => i !== index);
    setFormData({ ...formData, example_queries: newQueries });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <PageTransition>
      <VStack spacing={8} align="stretch">
        <SectionHeading>
          {id ? 'Edit Template' : 'Create Template'}
        </SectionHeading>

        <Card>
          <form onSubmit={handleSubmit}>
            <VStack spacing={6}>
              <FormControl isRequired>
                <FormLabel>Template Name</FormLabel>
                <FormInput
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter template name"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter template description"
                  borderColor={borderColor}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Database URI</FormLabel>
                <FormInput
                  value={formData.database_uri}
                  onChange={(e) => setFormData({ ...formData, database_uri: e.target.value })}
                  placeholder="Enter database URI"
                  type="password"
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Make Public</FormLabel>
                <Switch
                  isChecked={formData.is_public}
                  onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                />
              </FormControl>

              <Box w="full">
                <FormLabel>Example Queries</FormLabel>
                <VStack spacing={4} align="stretch">
                  {formData.example_queries.map((query, index) => (
                    <Card key={index}>
                      <HStack spacing={4} align="start">
                        <VStack flex={1} spacing={4}>
                          <FormInput
                            placeholder="Question"
                            value={query.question}
                            onChange={(e) => {
                              const newQueries = [...formData.example_queries];
                              newQueries[index].question = e.target.value;
                              setFormData({ ...formData, example_queries: newQueries });
                            }}
                          />
                          <Textarea
                            placeholder="SQL Query"
                            value={query.query}
                            onChange={(e) => {
                              const newQueries = [...formData.example_queries];
                              newQueries[index].query = e.target.value;
                              setFormData({ ...formData, example_queries: newQueries });
                            }}
                            borderColor={borderColor}
                          />
                        </VStack>
                        <IconButton
                          icon={<DeleteIcon />}
                          onClick={() => removeExampleQuery(index)}
                          colorScheme="red"
                          variant="ghost"
                        />
                      </HStack>
                    </Card>
                  ))}
                  <AnimatedButton
                    leftIcon={<AddIcon />}
                    onClick={addExampleQuery}
                    variant="ghost"
                  >
                    Add Example Query
                  </AnimatedButton>
                </VStack>
              </Box>

              <AnimatedButton
                type="submit"
                colorScheme="brand"
                width="full"
                isLoading={saving}
              >
                {id ? 'Update Template' : 'Create Template'}
              </AnimatedButton>
            </VStack>
          </form>
        </Card>
      </VStack>
    </PageTransition>
  );
};

export default TemplateForm; 