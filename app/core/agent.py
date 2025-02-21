from langchain.agents import create_sql_agent
from langchain.agents.agent_toolkits import SQLDatabaseToolkit
from langchain.sql_database import SQLDatabase
from langchain_openai import ChatOpenAI
from typing import List, Dict
import json

class SQLQueryAgent:
    def __init__(self, db_uri: str, example_queries: List[Dict[str, str]]):
        """
        Initialize SQL Query Agent
        
        Args:
            db_uri: Database connection string
            example_queries: List of dict with 'question' and 'query' keys
        """
        self.db = SQLDatabase.from_uri(db_uri)
        self.llm = ChatOpenAI(temperature=0, model_name="gpt-4")
        self.toolkit = SQLDatabaseToolkit(db=self.db, llm=self.llm)
        self.agent = create_sql_agent(
            llm=self.llm,
            toolkit=self.toolkit,
            verbose=True,
            agent_type="openai-tools",
        )
        self.example_queries = example_queries

    def query(self, question: str) -> Dict:
        """
        Execute a natural language query
        
        Args:
            question: Natural language question
            
        Returns:
            Dict containing query results
        """
        # Create context with examples
        context = self._build_context()
        
        # Execute query
        try:
            result = self.agent.run(f"{context}\n\nQuestion: {question}")
            return {"status": "success", "result": result}
        except Exception as e:
            return {"status": "error", "error": str(e)}

    def _build_context(self) -> str:
        """Build context string from example queries"""
        examples = "\n".join([
            f"Question: {ex['question']}\nSQL: {ex['query']}"
            for ex in self.example_queries
        ])
        return f"Use these example queries as reference:\n{examples}"