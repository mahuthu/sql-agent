import { useToast } from '@chakra-ui/react';

export const useCustomToast = () => {
  const toast = useToast();

  const showSuccessToast = (title, description) => {
    toast({
      title,
      description,
      status: 'success',
      duration: 5000,
      isClosable: true,
      position: 'top-right',
    });
  };

  const showErrorToast = (title, description) => {
    toast({
      title,
      description,
      status: 'error',
      duration: 5000,
      isClosable: true,
      position: 'top-right',
    });
  };

  return { showSuccessToast, showErrorToast };
}; 