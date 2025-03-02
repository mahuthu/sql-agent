from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import List, Optional
import os
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    PROJECT_NAME: str = "SQL Agent Service"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Database
    # DATABASE_URL: str = "postgresql://postgres:Mahuthu2142@localhost:5432/sql_agent_db"
    DATABASE_URL: str = "postgresql://postgres:Mahuthu2142@localhost:5432/sql_agent_db?client_encoding=utf8&auth=scram-sha-256"
    DATABASE_PASSWORD: str  # Ensure this exists
    DATABASE_URL: str
    # OpenAI
    # OPENAI_API_KEY: str
    
    # Stripe (Optional)
    STRIPE_SECRET_KEY: Optional[str] = None
    STRIPE_PUBLIC_KEY: Optional[str] = None
    STRIPE_WEBHOOK_SECRET: Optional[str] = None
    FRONTEND_URL: Optional[str] = "http://localhost:3000"

    
    # Email (Optional)
    MAIL_USERNAME: Optional[str] = None
    MAIL_PASSWORD: Optional[str] = None
    MAIL_FROM: Optional[str] = None
    MAIL_PORT: Optional[int] = None
    MAIL_SERVER: Optional[str] = None

    API_KEY_HEADER_NAME: str = "X-API-Key"

    
    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000"]
    
    # Azure OpenAI
    AZURE_OPENAI_API_KEY: str
    AZURE_OPENAI_ENDPOINT: str
    AZURE_OPENAI_DEPLOYMENT_NAME: str
    AZURE_OPENAI_API_VERSION: str = "2024-02-15-preview"

    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache()
def get_settings():
    return Settings()