from pydantic import BaseModel, validator
from typing import List, Dict, Optional
from datetime import datetime

class ExampleQuery(BaseModel):
    question: str
    query: str

class TemplateBase(BaseModel):
    name: str
    description: Optional[str] = None
    database_uri: str
    example_queries: List[ExampleQuery]
    is_public: bool = False

    @validator('example_queries')
    def validate_examples(cls, v):
        if not v:
            raise ValueError("At least one example query is required")
        return v

class TemplateCreate(TemplateBase):
    pass

class TemplateUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    database_uri: Optional[str] = None
    example_queries: Optional[List[ExampleQuery]] = None
    is_public: Optional[bool] = None

class TemplateResponse(TemplateBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True