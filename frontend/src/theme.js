import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: true,
  },
  colors: {
    brand: {
      50: '#e3f2fd',
      100: '#bbdefb',
      200: '#90caf9',
      300: '#64b5f6',
      400: '#42a5f5',
      500: '#2196f3',
      600: '#1e88e5',
      700: '#1976d2',
      800: '#1565c0',
      900: '#0d47a1',
    },
  },
  fonts: {
    heading: 'Inter, -apple-system, system-ui, sans-serif',
    body: 'Inter, -apple-system, system-ui, sans-serif',
  },
  styles: {
    global: (props) => ({
      body: {
        bg: props.colorMode === 'light' ? 'gray.50' : 'gray.900',
      },
    }),
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'semibold',
        borderRadius: 'md',
      },
      variants: {
        solid: (props) => ({
          bg: props.colorMode === 'light' ? 'brand.500' : 'brand.200',
          color: props.colorMode === 'light' ? 'white' : 'gray.800',
          _hover: {
            bg: props.colorMode === 'light' ? 'brand.600' : 'brand.300',
          },
        }),
        outline: {
          borderColor: 'brand.500',
          color: 'brand.500',
          _hover: {
            bg: 'brand.50',
          },
        },
      },
    },
    Card: {
      baseStyle: (props) => ({
        p: '6',
        borderRadius: 'lg',
        bg: props.colorMode === 'light' ? 'white' : 'gray.800',
        boxShadow: 'sm',
        borderWidth: '1px',
        borderColor: props.colorMode === 'light' ? 'gray.200' : 'gray.700',
      }),
    },
    Link: {
      baseStyle: {
        color: 'brand.500',
        _hover: {
          textDecoration: 'none',
          color: 'brand.600',
        },
      },
    },
  },
  layerStyles: {
    card: {
      p: '6',
      borderRadius: 'lg',
      boxShadow: 'sm',
      bg: 'white',
    },
    selected: {
      bg: 'brand.50',
      color: 'brand.900',
      borderWidth: '1px',
      borderColor: 'brand.200',
    },
  },
  textStyles: {
    h1: {
      fontSize: ['2xl', '3xl'],
      fontWeight: 'bold',
      lineHeight: '110%',
      letterSpacing: '-1%',
    },
    h2: {
      fontSize: ['xl', '2xl'],
      fontWeight: 'semibold',
      lineHeight: '110%',
      letterSpacing: '-1%',
    },
  },
});

export default theme; 