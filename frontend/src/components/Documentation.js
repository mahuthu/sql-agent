import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Code,
  VStack,
  useColorModeValue,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { PageTransition } from './common';

const Documentation = () => {
  const codeBg = useColorModeValue('gray.100', 'gray.700');

  return (
    <PageTransition>
      <Container maxW="container.xl" py={10}>
        <VStack spacing={8} align="stretch">
          <Heading as="h1">API Documentation</Heading>
          
          <Box>
            <Heading size="md" mb={4}>Authentication</Heading>
            <Text mb={4}>
              All API requests must include your API key in the Authorization header:
            </Text>
            <Code p={4} bg={codeBg} borderRadius="md" display="block">
              Authorization: Bearer YOUR_API_KEY
            </Code>
          </Box>

          <Box>
            <Heading size="md" mb={4}>Database Configuration</Heading>
            <Text mb={4}>
              Configure your database connection using the appropriate URI format for your database type:
            </Text>

            <Heading size="sm" mb={2}>PostgreSQL</Heading>
            <Alert status="info" mb={2}>
              <AlertIcon />
              The URI must start with postgresql:// instead of postgres:// as SQLAlchemy has removed support for the postgres prefix.
            </Alert>
            <Code p={4} bg={codeBg} borderRadius="md" display="block" mb={4}>
              postgresql://[user]:[password]@[host]:[port]/[database_name]
              
Example:
postgresql://reader:NWDMCE5xdipIjRrp@hh-pgsql-public.ebi.ac.uk:5432/pfmegrnargs
            </Code>

            <Heading size="sm" mb={2}>MySQL</Heading>
            <Code p={4} bg={codeBg} borderRadius="md" display="block" mb={4}>
              mysql+pymysql://[user]:[password]@[host]:[port]/[database_name]
              
Example:
mysql+pymysql://root:password123@localhost:3306/sales_db
            </Code>

            <Heading size="sm" mb={2}>Microsoft SQL Server</Heading>
            <Code p={4} bg={codeBg} borderRadius="md" display="block" mb={4}>
              mssql+pyodbc://[user]:[password]@[host]:[port]/[database_name]?driver=ODBC+Driver+17+for+SQL+Server
              
Example:
mssql+pyodbc://sa:YourStrong@Passw0rd@localhost:1433/adventureworks?driver=ODBC+Driver+17+for+SQL+Server
            </Code>

            <Heading size="sm" mb={2}>SQLite</Heading>
            <Code p={4} bg={codeBg} borderRadius="md" display="block" mb={4}>
              sqlite:///[path_to_database_file]
              
Example:
sqlite:///./sql_app.db
            </Code>
          </Box>

          <Box>
            <Heading size="md" mb={4}>Query Templates</Heading>
            <Text mb={4}>
              Create a new query template with your database schema and example queries:
            </Text>
            <Code p={4} bg={codeBg} borderRadius="md" display="block">
              POST /api/v1/templates
              {`
{
  "name": "Sales Analysis",
  "description": "Template for analyzing sales data",
  "database_uri": "postgresql://user:password@host:5432/sales_db",
  "example_queries": [
    {
      "question": "What were the total sales last month?",
      "query": "SELECT SUM(amount) as total_sales FROM sales WHERE date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')"
    },
    {
      "question": "Show me top 5 selling products",
      "query": "SELECT p.name, COUNT(*) as sales_count FROM sales s JOIN products p ON s.product_id = p.id GROUP BY p.name ORDER BY sales_count DESC LIMIT 5"
    }
  ]
}`}
            </Code>
          </Box>

          <Box>
            <Heading size="md" mb={4}>Database-Specific SQL Examples</Heading>
            
            <Heading size="sm" mb={2}>Date Functions</Heading>
            <Text mb={2}>Getting data for last month:</Text>
            <Code p={4} bg={codeBg} borderRadius="md" display="block" mb={4}>
              {`PostgreSQL:
WHERE date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')

MySQL:
WHERE date >= DATE_SUB(DATE_FORMAT(CURRENT_DATE, '%Y-%m-01'), INTERVAL 1 MONTH)

SQL Server:
WHERE date >= DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE())-1, 0)`}
            </Code>

            <Heading size="sm" mb={2}>Aggregation Functions</Heading>
            <Text mb={2}>Calculate rolling averages:</Text>
            <Code p={4} bg={codeBg} borderRadius="md" display="block">
              {`PostgreSQL:
SELECT date, amount,
AVG(amount) OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) as rolling_avg
FROM sales

MySQL:
SELECT date, amount,
AVG(amount) OVER (ORDER BY date ROWS 6 PRECEDING) as rolling_avg
FROM sales

SQL Server:
SELECT date, amount,
AVG(amount) OVER (ORDER BY date ROWS 6 PRECEDING) as rolling_avg
FROM sales`}
            </Code>
          </Box>

          <Box>
            <Heading size="md" mb={4}>Making Queries</Heading>
            <Text mb={4}>
              Execute a natural language query against your template:
            </Text>
            <Code p={4} bg={codeBg} borderRadius="md" display="block">
              POST /api/v1/queries
              {`
{
  "template_id": "123",
  "question": "What were the total sales last month?"
}`}
            </Code>
          </Box>
        </VStack>
      </Container>
    </PageTransition>
  );
};

export default Documentation; 