import React from 'react';
import {
  Box,
  Flex,
  HStack,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useColorModeValue,
  useColorMode,
  Avatar,
  Text,
  useDisclosure,
  VStack,
  useBreakpointValue,
} from '@chakra-ui/react';
import {
  HamburgerIcon,
  CloseIcon,
  MoonIcon,
  SunIcon,
  ChevronDownIcon,
} from '@chakra-ui/icons';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

const Navbar = () => {
  const { isOpen, onToggle } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const activeColor = useColorModeValue('brand.500', 'brand.200');

  const isMobile = useBreakpointValue({ base: true, md: false });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const NavLink = ({ to, children }) => {
    const isActive = location.pathname === to;
    return (
      <MotionBox
        as={RouterLink}
        to={to}
        px={3}
        py={2}
        rounded="md"
        color={isActive ? activeColor : textColor}
        fontWeight={isActive ? "semibold" : "medium"}
        _hover={{
          textDecoration: 'none',
          color: activeColor,
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {children}
      </MotionBox>
    );
  };

  return (
    <Box
      position="sticky"
      top={0}
      zIndex="sticky"
      bg={bgColor}
      borderBottom={1}
      borderStyle="solid"
      borderColor={borderColor}
      shadow="sm"
    >
      <MotionFlex
        minH="60px"
        py={2}
        px={4}
        maxW="container.xl"
        mx="auto"
        align="center"
        justify="space-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Mobile menu button */}
        <IconButton
          display={{ base: 'flex', md: 'none' }}
          onClick={onToggle}
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          variant="ghost"
          aria-label="Toggle Navigation"
        />

        {/* Logo */}
        <MotionFlex
          flex={{ base: 1, md: 'auto' }}
          justify={{ base: 'center', md: 'start' }}
          align="center"
          whileHover={{ scale: 1.05 }}
        >
          <Text
            as={RouterLink}
            to="/"
            fontSize="xl"
            fontWeight="bold"
            color={useColorModeValue('brand.500', 'brand.200')}
            _hover={{ textDecoration: 'none' }}
          >
            SQL Agent
          </Text>
        </MotionFlex>

        {/* Desktop Navigation */}
        <HStack
          spacing={8}
          align="center"
          display={{ base: 'none', md: 'flex' }}
        >
          {user && (
            <>
              <NavLink to="/dashboard">Dashboard</NavLink>
              <NavLink to="/templates">Templates</NavLink>
              <NavLink to="/usage">Usage</NavLink>
            </>
          )}
        </HStack>

        {/* Right side items */}
        <Flex align="center" gap={4}>
          <IconButton
            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            variant="ghost"
            aria-label="Toggle color mode"
          />

          {user ? (
            <Menu>
              <MenuButton
                as={Button}
                rounded="full"
                variant="link"
                cursor="pointer"
                minW={0}
              >
                <HStack spacing={2}>
                  <Avatar
                    size="sm"
                    name={user.email}
                    src={user.avatar}
                  />
                  {!isMobile && (
                    <>
                      <Text fontSize="sm">{user.email}</Text>
                      <ChevronDownIcon />
                    </>
                  )}
                </HStack>
              </MenuButton>
              <MenuList>
                <MenuItem as={RouterLink} to="/settings">Settings</MenuItem>
                <MenuItem as={RouterLink} to="/subscription">Subscription</MenuItem>
                <MenuDivider />
                <MenuItem onClick={handleLogout} color="red.500">Logout</MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <HStack spacing={4}>
              <Button
                as={RouterLink}
                to="/login"
                variant="ghost"
                colorScheme="brand"
              >
                Login
              </Button>
              <Button
                as={RouterLink}
                to="/register"
                colorScheme="brand"
              >
                Register
              </Button>
            </HStack>
          )}
        </Flex>
      </MotionFlex>

      {/* Mobile Navigation */}
      {isOpen && (
        <MotionBox
          display={{ base: 'block', md: 'none' }}
          p={4}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <VStack spacing={4} align="stretch">
            {user && (
              <>
                <NavLink to="/">Dashboard</NavLink>
                <NavLink to="/templates">Templates</NavLink>
                <NavLink to="/usage">Usage</NavLink>
                <NavLink to="/settings">Settings</NavLink>
              </>
            )}
          </VStack>
        </MotionBox>
      )}
    </Box>
  );
};

export default Navbar; 