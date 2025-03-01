from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class QueryHistoryBase(BaseModel):
    question: str
    generated_sql: str
    execution_time: float
    status: str
    error_message: Optional[str] = None

class QueryHistoryCreate(QueryHistoryBase):
    template_id: int

class QueryHistoryResponse(BaseModel):
    id: int
    user_id: int
    template_id: int
    question: str
    generated_sql: str
    execution_time: float
    status: str
    error_message: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class StandardResponse(BaseModel):
    status: str
    message: str
    data: Optional[QueryHistoryResponse] = None
    error: Optional[dict] = None 