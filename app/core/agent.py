# from langchain.agents import create_sql_agent
# from langchain_community.agent_toolkits.sql.base import create_sql_agent
from langchain_community.agent_toolkits import create_sql_agent
from langchain.agents.agent_toolkits import SQLDatabaseToolkit
from langchain.sql_database import SQLDatabase
from langchain_openai import AzureChatOpenAI
from typing import List, Dict, Optional, Any
import json
from sqlalchemy import create_engine, text, MetaData, Table, inspect
from sqlalchemy.engine.url import make_url
from app.config import get_settings

settings = get_settings()

# class CustomSQLDatabase(SQLDatabase):
#     """Custom SQLDatabase implementation that bypasses system catalog queries"""
    
#     def __init__(
#         self,
#         engine,
#         schema=None,
#         metadata=None,
#         ignore_tables=None,
#         include_tables=None,
#         sample_rows_in_table_info=0,
#         indexes_in_table_info=False,
#         view_support=True,
#         custom_schema_info=None
#     ):
#         self._engine = engine
#         self._schema = schema
#         self.metadata = metadata or MetaData()
#         self._ignore_tables = ignore_tables or []
#         self._include_tables = include_tables or []
#         self._sample_rows_in_table_info = sample_rows_in_table_info
#         self._indexes_in_table_info = indexes_in_table_info
#         self._view_support = view_support
        
#         # Store the custom schema info
#         self._custom_schema_info = custom_schema_info or ""
        
#         # Explicitly *don't* call self._metadata.reflect() here
        
#     def get_table_info(self) -> str:
#         """Return the custom schema information instead of querying the database"""
#         return self._custom_schema_info
    
#     @classmethod
#     def from_uri_with_schema_info(
#         cls,
#         database_uri: str,
#         custom_schema_info: str,
#         engine_args: Optional[Dict[str, Any]] = None,
#         **kwargs
#     ) -> "CustomSQLDatabase":
#         """Create a CustomSQLDatabase from a URI without introspection"""
#         engine_args = engine_args or {}
#         engine = create_engine(database_uri, **engine_args)
#         return cls(engine=engine, custom_schema_info=custom_schema_info, **kwargs)
    
#     def run(self, command: str, fetch: str = "all") -> List[Dict[str, Any]]:
#         """Execute a SQL command and return the results."""
#         with self._engine.connect() as connection:
#             cursor = connection.execute(text(command))
#             if cursor.returns_rows:
#                 if fetch == "all":
#                     result = cursor.fetchall()
#                 elif fetch == "one":
#                     result = cursor.fetchone()
#                 else:
#                     raise ValueError("Fetch parameter must be either 'one' or 'all'")
#                 return [dict(zip(row.keys(), row)) for row in result]
#             else:
#                 return []

class CustomSQLDatabase(SQLDatabase):
    """Custom SQLDatabase implementation that bypasses system catalog queries"""
    
    def __init__(
        self,
        engine,
        schema=None,
        metadata=None,
        ignore_tables=None,
        include_tables=None,
        sample_rows_in_table_info=0,
        indexes_in_table_info=False,
        view_support=True,
        custom_schema_info=None
    ):
        self._engine = engine
        self._schema = schema
        self.metadata = metadata or MetaData()
        self._ignore_tables = ignore_tables or []
        self._include_tables = include_tables or []
        self._sample_rows_in_table_info = sample_rows_in_table_info
        self._indexes_in_table_info = indexes_in_table_info
        self._view_support = view_support
        
        # Store the custom schema info
        self._custom_schema_info = custom_schema_info or ""
        
        # Add the missing _all_tables attribute
        self._all_tables = self._extract_tables_from_schema()
        
    def _extract_tables_from_schema(self) -> List[str]:
        """Extract table names from the custom schema info"""
        tables = []
        lines = self._custom_schema_info.split('\n')
        for line in lines:
            if line.startswith('Table:'):
                table_name = line.replace('Table:', '').strip()
                tables.append(table_name)
        return tables
    
    def get_table_info(self, table_names: Optional[List[str]] = None) -> str:
        """Return the custom schema information instead of querying the database
        
        Args:
            table_names: Optional list of table names to filter schema info
            
        Returns:
            Schema information as a string
        """
        return self._custom_schema_info
    
    # Add this method which is required by the SQL agent
    def get_usable_table_names(self) -> List[str]:
        """Get names of tables available."""
        return self._all_tables
    
    @classmethod
    def from_uri_with_schema_info(
        cls,
        database_uri: str,
        custom_schema_info: str,
        engine_args: Optional[Dict[str, Any]] = None,
        **kwargs
    ) -> "CustomSQLDatabase":
        """Create a CustomSQLDatabase from a URI without introspection"""
        engine_args = engine_args or {}
        engine = create_engine(database_uri, **engine_args)
        return cls(engine=engine, custom_schema_info=custom_schema_info, **kwargs)
    
    def run(
        self, 
        command: str, 
        fetch: str = "all", 
        parameters: Optional[Dict[str, Any]] = None,
        execution_options: Optional[Dict[str, Any]] = None,
        **kwargs
    ) -> List[Dict[str, Any]]:
        """Execute a SQL command and return the results.
        
        Args:
            command: SQL command to execute
            fetch: Either "one" or "all" to fetch one or all results
            parameters: Optional parameters for the SQL query
            execution_options: Optional execution options for the connection
            **kwargs: Additional keyword arguments
            
        Returns:
            List of dictionaries containing the query results
        """
        # with self._engine.connect() as connection:
        #     # Apply execution options if provided
        #     if execution_options:
        #         connection = connection.execution_options(**execution_options)
                
        #     # Handle parameters if provided
        #     if parameters:
        #         cursor = connection.execute(text(command), parameters)
        #     else:
        #         cursor = connection.execute(text(command))
                
        #     if cursor.returns_rows:
        #         if fetch == "all":
        #             result = cursor.fetchall()
        #         elif fetch == "one":
        #             result = cursor.fetchone()
        #         else:
        #             raise ValueError("Fetch parameter must be either 'one' or 'all'")
        #         return [dict(zip(row.keys(), row)) for row in result]
        #     else:
        #         return []

        with self._engine.connect() as connection:
            cursor = connection.execute(text(command))
            if cursor.returns_rows:
                if fetch == "all":
                    result = cursor.fetchall()
                    return [dict(row._mapping) for row in result]  # Use _mapping attribute
                elif fetch == "one":
                    result = cursor.fetchone()
                    return [dict(result._mapping)] if result else []  # Handle None result
                else:
                    raise ValueError("Fetch parameter must be either 'one' or 'all'")
            else:
                return []

    # Add other required SQLDatabase methods that might be called
    def dialect(self):
        """Return the dialect of the database."""
        return self._engine.dialect.name
        
    def get_table_names(self) -> List[str]:
        """Get names of tables available."""
        return self._all_tables
        
    def get_qualified_table_names(self) -> List[str]:
        """Get fully qualified names of tables available."""
        if self._schema:
            return [f"{self._schema}.{table}" for table in self._all_tables]
        return self._all_tables

class SQLQueryAgent:
    def __init__(self, db_uri: str, example_queries: List[Dict[str, str]]):
        """
        Initialize SQL Query Agent
        
        Args:
            db_uri: Database connection string
            example_queries: List of dict with 'question' and 'query' keys
        """
        try:
            # Parse the URI and ensure it's properly formatted
            url = make_url(db_uri)
            
            # Get schema info using the safer method
            self.schema_info = self.get_safe_schema_info(db_uri)
            
            # Create our custom database connection that won't try to access system catalogs
            self.db = CustomSQLDatabase.from_uri_with_schema_info(
                database_uri=db_uri,
                custom_schema_info=self.schema_info,
                view_support=True
            )
            
            # Initialize Azure OpenAI
            self.llm = AzureChatOpenAI(
                temperature=0,
                deployment_name=settings.AZURE_OPENAI_DEPLOYMENT_NAME,
                azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
                openai_api_key=settings.AZURE_OPENAI_API_KEY,
                api_version=settings.AZURE_OPENAI_API_VERSION,  # Add this line


            )
            
            self.toolkit = SQLDatabaseToolkit(
                db=self.db,
                llm=self.llm
            )
            
            self.agent = create_sql_agent(
                llm=self.llm,
                toolkit=self.toolkit,
                verbose=True,
                agent_type="openai-tools",
            )
            
            # Parse example queries
            self.example_queries = example_queries if isinstance(example_queries, list) else json.loads(example_queries)
                
        except Exception as e:
            print(f"Error initializing SQLQueryAgent: {str(e)}")
            raise Exception(f"Failed to initialize database connection: {str(e)}")

    def get_safe_schema_info(self, db_uri: str) -> str:
        """
        Get schema information using safer queries that don't require system catalog access
        """
        try:
            engine = create_engine(db_uri)
            schema_info = []
            
            with engine.connect() as connection:
                # Get table list using information_schema (more permissive)
                table_query = text("""
                    SELECT table_name, column_name, data_type, 
                           is_nullable, column_default
                    FROM information_schema.columns
                    WHERE table_schema = 'public'
                    ORDER BY table_name, ordinal_position
                """)
                
                result = connection.execute(table_query)
                current_table = None
                table_columns = []
                
                for row in result:
                    if current_table != row.table_name:
                        if current_table is not None:
                            schema_info.extend([
                                f"\nTable: {current_table}",
                                "Columns:",
                                *[f"  - {col}" for col in table_columns]
                            ])
                        current_table = row.table_name
                        table_columns = []
                    
                    nullable = "NULL" if row.is_nullable == 'YES' else "NOT NULL"
                    default = f" DEFAULT {row.column_default}" if row.column_default else ""
                    table_columns.append(
                        f"{row.column_name} ({row.data_type}) {nullable}{default}"
                    )
                
                # Add the last table
                if current_table is not None:
                    schema_info.extend([
                        f"\nTable: {current_table}",
                        "Columns:",
                        *[f"  - {col}" for col in table_columns]
                    ])
                
                # Try to get foreign key information if permissions allow
                try:
                    fk_query = text("""
                        SELECT
                            tc.table_name, 
                            kcu.column_name, 
                            ccu.table_name AS foreign_table_name,
                            ccu.column_name AS foreign_column_name
                        FROM 
                            information_schema.table_constraints AS tc 
                            JOIN information_schema.key_column_usage AS kcu
                              ON tc.constraint_name = kcu.constraint_name
                              AND tc.table_schema = kcu.table_schema
                            JOIN information_schema.constraint_column_usage AS ccu
                              ON ccu.constraint_name = tc.constraint_name
                              AND ccu.table_schema = tc.table_schema
                        WHERE tc.constraint_type = 'FOREIGN KEY'
                          AND tc.table_schema = 'public'
                        ORDER BY tc.table_name, kcu.column_name
                    """)
                    
                    fk_result = connection.execute(fk_query)
                    fk_info = []
                    
                    for row in fk_result:
                        fk_info.append(
                            f"Foreign Key: {row.table_name}.{row.column_name} references {row.foreign_table_name}.{row.foreign_column_name}"
                        )
                    
                    if fk_info:
                        schema_info.append("\nForeign Keys:")
                        schema_info.extend(fk_info)
                except:
                    # If we can't get foreign key info, just continue
                    pass
            
            return "\n".join(schema_info)
            
        except Exception as e:
            print(f"Error getting schema info: {str(e)}")
            return "Schema information unavailable due to permissions"

    def query(self, question: str) -> Dict:
        """
        Execute a natural language query
        
        Args:
            question: Natural language question
        
        Returns:
            Dict containing query results and generated SQL
        """
        try:
            # Prepare context with schema info and examples
            context = f"""
            Database Schema:
            {self.schema_info}
            
            Example Queries:
            {json.dumps(self.example_queries, indent=2)}
            
            Please analyze the following question using the schema and example queries:
            {question}
            
            First, think about which tables and columns you need to answer this question.
            Then, write an SQL query that will answer the question accurately.
            """
            
            # Execute the query through the agent
            result = self.agent.run(context)
            
            # Extract SQL from the response if possible
            sql_query = ""
            if isinstance(result, dict):
                sql_query = result.get("sql", "")
            elif isinstance(result, str):
                # Try to find SQL in the text response
                if "```sql" in result:
                    sql_parts = result.split("```sql")
                    if len(sql_parts) > 1:
                        sql_query = sql_parts[1].split("```")[0].strip()
                elif "```" in result:
                    sql_parts = result.split("```")
                    if len(sql_parts) > 1:
                        sql_query = sql_parts[1].strip()
            
            return {
                "sql": sql_query,
                "result": result,
                "explanation": "Query executed successfully"
            }
            
        except Exception as e:
            print(f"Error executing query: {str(e)}")
            raise Exception(f"Failed to execute query: {str(e)}")