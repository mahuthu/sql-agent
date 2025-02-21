import { useColorMode, useTheme } from '@chakra-ui/react';

export const useCustomTheme = () => {
  const { colorMode } = useColorMode();
  const theme = useTheme();

  const isDark = colorMode === 'dark';

  const cardBg = isDark ? 'gray.800' : 'white';
  const borderColor = isDark ? 'gray.700' : 'gray.200';
  const textColor = isDark ? 'gray.100' : 'gray.900';
  const mutedTextColor = isDark ? 'gray.400' : 'gray.600';

  return {
    isDark,
    cardBg,
    borderColor,
    textColor,
    mutedTextColor,
    theme,
    colorMode,
  };
}; 