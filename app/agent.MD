from langchain_community.agent_toolkits import SQLDatabaseToolkit
from langchain_community.utilities.sql_database import SQLDatabase
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain_openai import AzureChatOpenAI
from langchain.prompts import ChatPromptTemplate
from typing import List, Dict
import json
from sqlalchemy import create_engine, text
from sqlalchemy.engine.url import make_url
from app.config import get_settings

settings = get_settings()

class SQLQueryAgent:
    def __init__(self, db_uri: str, example_queries: List[Dict[str, str]]):
        """
        Initialize SQL Query Agent
        """
        try:
            # Parse the URI and ensure it's properly formatted
            url = make_url(db_uri)

            self.schema_info = self.get_safe_schema_info(db_uri)
            
            # Create the database connection
            self.db = SQLDatabase.from_uri(
                database_uri=db_uri,
                sample_rows_in_table_info=3,
                include_tables=None,
                view_support=True
            )
            
            
            # Initialize Azure OpenAI
            self.llm = AzureChatOpenAI(
                temperature=0,
                deployment_name=settings.AZURE_OPENAI_DEPLOYMENT_NAME,
                azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
                openai_api_key=settings.AZURE_OPENAI_API_KEY,
                api_version=settings.OPENAI_API_VERSION,
                api_type="azure"
            )
            
            # Create toolkit and prompt
            self.toolkit = SQLDatabaseToolkit(db=self.db, llm=self.llm)
            
            # Create the agent with the new method
            prompt = ChatPromptTemplate.from_messages([
                ("system", "You are an AI that helps convert natural language questions into SQL queries. "
                          "Use the database schema and example queries provided to generate accurate SQL."),
                ("human", "{input}")
            ])
            
            tools = self.toolkit.get_tools()
            agent = create_openai_tools_agent(self.llm, tools, prompt)
            
            self.agent_executor = AgentExecutor(
                agent=agent,
                tools=tools,
                verbose=True
            )
            
            # Parse example queries
            self.example_queries = example_queries if isinstance(example_queries, list) else json.loads(example_queries)
                
        except Exception as e:
            print(f"Error initializing SQLQueryAgent: {str(e)}")
            raise Exception(f"Failed to initialize database connection: {str(e)}")

    # ... rest of the methods remain the same ...

    def query(self, question: str) -> Dict:
        """
        Execute a natural language query
        """
        try:
            # Prepare context with available schema and examples
            context = f"""
            Database Schema:
            {self.schema_info}
            
            Table Information:
            {self.db.get_table_info()}
            
            Example Queries:
            {json.dumps(self.example_queries, indent=2)}
            
            Please use this schema and the example queries as reference when answering:
            {question}
            """
            
            # Execute the query through the agent
            result = self.agent_executor.invoke({"input": context})
            
            # Extract SQL and results from the response
            sql_query = ""
            if isinstance(result.get("output"), str):
                # Try to find SQL in the text response
                if "```sql" in result["output"]:
                    sql_parts = result["output"].split("```sql")
                    if len(sql_parts) > 1:
                        sql_query = sql_parts[1].split("```")[0].strip()
                elif "```" in result["output"]:
                    sql_parts = result["output"].split("```")
                    if len(sql_parts) > 1:
                        sql_query = sql_parts[1].strip()
            
            return {
                "sql": sql_query,
                "result": result.get("output", ""),
                "explanation": result.get("intermediate_steps", [])
            }
            
        except Exception as e:
            print(f"Error executing query: {str(e)}")
            raise Exception(f"Failed to execute query: {str(e)}")