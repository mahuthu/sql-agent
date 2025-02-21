from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user_by_api_key
from app.models.user import User
from app.models.template import QueryTemplate
from app.models.query_history import QueryHistory
from app.core.agent import SQLQueryAgent
from app.schemas.response import StandardResponse
from typing import Dict
from pydantic import BaseModel
import time

router = APIRouter()

class QueryRequest(BaseModel):
    question: str

@router.post("/{template_id}", response_model=StandardResponse)
async def execute_query(
    template_id: int,
    query: QueryRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_by_api_key)
):
    """Execute a natural language query using a specific template"""
    
    # Check user credits
    if current_user.credits_remaining <= 0:
        raise HTTPException(
            status_code=402,
            detail="No credits remaining. Please upgrade your subscription."
        )
    
    # Get the template
    template = db.query(QueryTemplate).filter(
        QueryTemplate.id == template_id,
        (QueryTemplate.user_id == current_user.id) | (QueryTemplate.is_public == True)
    ).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    start_time = time.time()
    try:
        # Initialize the agent
        agent = SQLQueryAgent(
            db_uri=template.database_uri,
            example_queries=template.example_queries
        )
        
        # Execute the query
        result = agent.query(query.question)
        execution_time = time.time() - start_time
        
        # Record query history in background
        background_tasks.add_task(
            record_query_history,
            db=db,
            user_id=current_user.id,
            template_id=template_id,
            question=query.question,
            generated_sql=result.get("sql", ""),
            execution_time=execution_time,
            status="success",
            error_message=None
        )
        
        # Deduct credits
        current_user.credits_remaining -= 1
        db.commit()
        
        return StandardResponse(
            status="success",
            message="Query executed successfully",
            data=result
        )
        
    except Exception as e:
        execution_time = time.time() - start_time
        # Record failed query in background
        background_tasks.add_task(
            record_query_history,
            db=db,
            user_id=current_user.id,
            template_id=template_id,
            question=query.question,
            generated_sql="",
            execution_time=execution_time,
            status="error",
            error_message=str(e)
        )
        
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history", response_model=StandardResponse)
async def get_query_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_by_api_key)
):
    """Get user's query history"""
    history = db.query(QueryHistory).filter(
        QueryHistory.user_id == current_user.id
    ).order_by(QueryHistory.created_at.desc()).all()
    
    return StandardResponse(
        status="success",
        message="Query history retrieved",
        data=history
    )

def record_query_history(
    db: Session,
    user_id: int,
    template_id: int,
    question: str,
    generated_sql: str,
    execution_time: float,
    status: str,
    error_message: str = None
):
    """Record query execution in history"""
    history_entry = QueryHistory(
        user_id=user_id,
        template_id=template_id,
        question=question,
        generated_sql=generated_sql,
        execution_time=execution_time,
        status=status,
        error_message=error_message
    )
    db.add(history_entry)
    db.commit() 