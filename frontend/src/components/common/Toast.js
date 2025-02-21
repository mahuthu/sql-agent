import { createStandaloneToast } from '@chakra-ui/react';
import theme from '../../theme';

const toast = createStandaloneToast({ theme });

export const showToast = ({
  title,
  description,
  status = 'info',
  duration = 5000,
  isClosable = true,
}) => {
  toast({
    title,
    description,
    status,
    duration,
    isClosable,
    position: 'top-right',
    variant: 'solid',
  });
};

export const successToast = (title, description) =>
  showToast({ title, description, status: 'success' });

export const errorToast = (title, description) =>
  showToast({ title, description, status: 'error' });

export const warningToast = (title, description) =>
  showToast({ title, description, status: 'warning' });

export const infoToast = (title, description) =>
  showToast({ title, description, status: 'info' }); 